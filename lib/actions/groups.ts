'use server';

import { db } from '@/lib/db';
import { usersToGroups, expenses, users, groups, messages, expenseSplits } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, inArray, desc, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export type GroupMember = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

export type GroupCardData = {
  id: number;
  name: string;
  description: string | null;
  members: GroupMember[];
  balance: number;
  unreadCount: number;
  recentActivity: string | null;
};

// Types for GroupDetail page
export type GroupDetailMember = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: string;
};

export type GroupDetail = {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  members: GroupDetailMember[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  recentActivity?: string;
  balance: number;
};

export type Message = {
  _id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'expense' | 'settlement' | 'image';
  timestamp: string;
  replyTo?: {
    _id: string;
    content: string;
    senderName: string;
  };
  reactions: {
    emoji: string;
    users: string[];
  }[];
  expenseId?: string;
  imageUrl?: string;
};

export type Balance = {
  _id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  owesTo: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  owedBy: {
    userId: string;
    userName: string;
    amount: number;
  }[];
};

export async function getGroupsForUser(): Promise<GroupCardData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupMemberships = await db.query.usersToGroups.findMany({
    where: eq(usersToGroups.userId, user.id),
    with: { group: true },
  });

  if (groupMemberships.length === 0) return [];

  const groupIds = groupMemberships.map((gm) => gm.groupId);

  // Fetch all members for the user's groups in a single query
  const allGroupsMembers = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    with: {
      groups: {
        where: inArray(usersToGroups.groupId, groupIds),
        columns: {
          groupId: true,
        },
      },
    },
    where: inArray(
      users.id,
      db.select({ userId: usersToGroups.userId }).from(usersToGroups).where(inArray(usersToGroups.groupId, groupIds))
    ),
  });

  const allExpenses = await db.query.expenses.findMany({
    where: inArray(expenses.groupId, groupIds),
    with: { splits: true },
  });

  const result: GroupCardData[] = groupMemberships.map(({ group }) => {
    const membersOfGroup = allGroupsMembers
      .filter((member) => member.groups.some((g) => g.groupId === group.id))
      .map(({ groups, ...member }) => member); // Exclude the 'groups' property from the final member object

    const expensesInGroup = allExpenses.filter(e => e.groupId === group.id);

    // Calculate balance for the current user in this group
    let totalPaidByUser = 0;
    let totalUserShare = 0;

    for (const expense of expensesInGroup) {
      if (expense.paidById === user.id) {
        totalPaidByUser += parseFloat(expense.amount);
      }
      const userSplit = expense.splits.find(s => s.userId === user.id);
      if (userSplit) {
        totalUserShare += parseFloat(userSplit.amount);
      }
    }

    const balance = totalPaidByUser - totalUserShare;

    const recentExpense = expensesInGroup.sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      members: membersOfGroup,
      balance: balance,
      unreadCount: 0, // Mock
      recentActivity: recentExpense ? recentExpense.description : 'No recent activity',
    };
  });

  return result;
}

export async function getGroup(groupId: string): Promise<{ group: GroupDetail }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupIdNum = parseInt(groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  // Check if user is a member of this group
  const membership = await db.query.usersToGroups.findFirst({
    where: and(
      eq(usersToGroups.userId, user.id),
      eq(usersToGroups.groupId, groupIdNum)
    ),
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this group');
  }

  // Get group details
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupIdNum),
  });

  if (!group) {
    throw new Error('Group not found');
  }

  // Get all members of the group
  const groupMembers = await db.query.usersToGroups.findMany({
    where: eq(usersToGroups.groupId, groupIdNum),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  const members: GroupDetailMember[] = groupMembers.map((membership) => ({
    _id: membership.user.id,
    name: membership.user.name || 'Unknown',
    email: membership.user.email,
    avatar: membership.user.avatarUrl || undefined,
    role: membership.role,
    joinedAt: new Date().toISOString(), // Mock for now
  }));

  // Calculate user's balance in this group
  const groupExpenses = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupIdNum),
    with: { splits: true },
  });

  let totalPaidByUser = 0;
  let totalUserShare = 0;

  for (const expense of groupExpenses) {
    if (expense.paidById === user.id) {
      totalPaidByUser += parseFloat(expense.amount);
    }
    const userSplit = expense.splits.find(s => s.userId === user.id);
    if (userSplit) {
      totalUserShare += parseFloat(userSplit.amount);
    }
  }

  const balance = totalPaidByUser - totalUserShare;
  const recentExpense = groupExpenses.sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  return {
    group: {
      _id: group.id.toString(),
      name: group.name,
      description: group.description || undefined,
      coverImage: group.coverImageUrl || undefined,
      members,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      unreadCount: 0, // Mock
      recentActivity: recentExpense ? recentExpense.description : undefined,
      balance,
    },
  };
}

export async function getMessages(groupId: string): Promise<{ messages: Message[]; hasMore: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupIdNum = parseInt(groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  // Check if user is a member of this group
  const membership = await db.query.usersToGroups.findFirst({
    where: and(
      eq(usersToGroups.userId, user.id),
      eq(usersToGroups.groupId, groupIdNum)
    ),
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this group');
  }

  // Get messages for the group
  const groupMessages = await db.query.messages.findMany({
    where: eq(messages.groupId, groupIdNum),
    orderBy: [desc(messages.createdAt)],
    limit: 50,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Get recent expenses to create expense messages
  const recentExpenses = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupIdNum),
    orderBy: [desc(expenses.createdAt)],
    limit: 10,
    with: {
      paidBy: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Combine messages and expense notifications
  const allMessages: Message[] = [
    ...groupMessages.map((msg) => ({
      _id: msg.id.toString(),
      groupId: groupId,
      senderId: msg.userId,
      senderName: msg.user.name || 'Unknown User',
      senderAvatar: msg.user.avatarUrl || undefined,
      content: msg.content,
      type: 'text' as const,
      timestamp: msg.createdAt.toISOString(),
      reactions: [], // Mock for now
    })),
    ...recentExpenses.map((expense) => ({
      _id: `expense-${expense.id}`,
      groupId: groupId,
      senderId: expense.paidById,
      senderName: expense.paidBy.name || 'Unknown User',
      senderAvatar: expense.paidBy.avatarUrl || undefined,
      content: `${expense.description} - $${expense.amount}`,
      type: 'expense' as const,
      timestamp: expense.createdAt.toISOString(),
      expenseId: expense.id.toString(),
      reactions: [], // Mock for now
    })),
  ];

  // Sort by timestamp
  allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    messages: allMessages.slice(0, 50),
    hasMore: false,
  };
}

export async function getBalances(groupId: string): Promise<{ balances: Balance[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupIdNum = parseInt(groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  // Check if user is a member of this group
  const membership = await db.query.usersToGroups.findFirst({
    where: and(
      eq(usersToGroups.userId, user.id),
      eq(usersToGroups.groupId, groupIdNum)
    ),
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this group');
  }

  // Get all members of the group
  const groupMembers = await db.query.usersToGroups.findMany({
    where: eq(usersToGroups.groupId, groupIdNum),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Get all expenses for the group
  const groupExpenses = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupIdNum),
    with: { splits: true },
  });

  // Calculate balances for each member
  const balances: Balance[] = groupMembers.map((member) => {
    let totalPaid = 0;
    let totalOwed = 0;

    for (const expense of groupExpenses) {
      if (expense.paidById === member.user.id) {
        totalPaid += parseFloat(expense.amount);
      }
      const userSplit = expense.splits.find(s => s.userId === member.user.id);
      if (userSplit) {
        totalOwed += parseFloat(userSplit.amount);
      }
    }

    const netBalance = totalPaid - totalOwed;

    return {
      _id: `balance-${member.user.id}`,
      groupId: groupId,
      userId: member.user.id,
      userName: member.user.name || 'Unknown User',
      userAvatar: member.user.avatarUrl || undefined,
      amount: netBalance,
      owesTo: [], // Mock for now - would need complex calculation
      owedBy: [], // Mock for now - would need complex calculation
    };
  });

  return { balances };
}

export async function sendMessage(data: {
  groupId: string;
  content: string;
  replyToId?: string;
}): Promise<{ message: Message }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupIdNum = parseInt(data.groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  // Check if user is a member of this group
  const membership = await db.query.usersToGroups.findFirst({
    where: and(
      eq(usersToGroups.userId, user.id),
      eq(usersToGroups.groupId, groupIdNum)
    ),
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this group');
  }

  // Insert the message
  const [newMessage] = await db.insert(messages).values({
    groupId: groupIdNum,
    userId: user.id,
    content: data.content,
  }).returning();

  // Get user details for the response
  const userDetails = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  });

  return {
    message: {
      _id: newMessage.id.toString(),
      groupId: data.groupId,
      senderId: user.id,
      senderName: userDetails?.name || 'Unknown User',
      senderAvatar: userDetails?.avatarUrl || undefined,
      content: data.content,
      type: 'text',
      timestamp: newMessage.createdAt.toISOString(),
      reactions: [],
    },
  };
}

export async function addReaction(messageId: string, emoji: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // For now, this is a mock implementation
  // In a real app, you'd store reactions in a separate table
  console.log(`User ${user.id} added reaction ${emoji} to message ${messageId}`);
}

export type Expense = {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  splitBetween: {
    _id: string;
    name: string;
    amount: number;
  }[];
  category?: string;
  date: string;
  createdAt: string;
  receipt?: string;
  settled: boolean;
};

export async function getExpenses(groupId: string): Promise<{ expenses: Expense[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const groupIdNum = parseInt(groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  // Check if user is a member of this group
  const membership = await db.query.usersToGroups.findFirst({
    where: and(
      eq(usersToGroups.userId, user.id),
      eq(usersToGroups.groupId, groupIdNum)
    ),
  });

  if (!membership) {
    throw new Error('Access denied: You are not a member of this group');
  }

  // Get all expenses for the group
  const groupExpenses = await db.query.expenses.findMany({
    where: eq(expenses.groupId, groupIdNum),
    orderBy: [desc(expenses.createdAt)],
    with: {
      paidBy: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      splits: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Format expenses to match the expected interface
  const formattedExpenses: Expense[] = groupExpenses.map((expense) => ({
    _id: expense.id.toString(),
    groupId: groupId,
    description: expense.description,
    amount: parseFloat(expense.amount),
    paidBy: {
      _id: expense.paidBy.id,
      name: expense.paidBy.name || 'Unknown User',
      avatar: expense.paidBy.avatarUrl || undefined,
    },
    splitBetween: expense.splits.map((split) => ({
      _id: split.user.id,
      name: split.user.name || 'Unknown User',
      amount: parseFloat(split.amount),
    })),
    category: expense.category || undefined,
    date: expense.date.toISOString(),
    createdAt: expense.createdAt.toISOString(),
    receipt: expense.receiptUrl || undefined,
    settled: expense.settled,
  }));

  return { expenses: formattedExpenses };
}