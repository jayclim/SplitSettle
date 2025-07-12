'use server';

import { db } from '@/lib/db';
import { usersToGroups, expenses, users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, inArray } from 'drizzle-orm';
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