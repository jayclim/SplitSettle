'use server';

import { db } from '@/lib/db';
import { groups, usersToGroups, expenses, expenseSplits } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CreateGroupData = {
  name: string;
  description?: string;
  coverImage?: string;
};

export async function createGroupAction(data: CreateGroupData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!data.name) {
    throw new Error('Group name is required');
  }

  try {
    // Create the group
    const [newGroup] = await db.insert(groups).values({
      name: data.name,
      description: data.description,
      coverImageUrl: data.coverImage,
    }).returning();

    // Add creator as admin
    await db.insert(usersToGroups).values({
      userId: user.id,
      groupId: newGroup.id,
      role: 'admin',
    });

    revalidatePath('/dashboard');
    return { success: true, group: newGroup };
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group');
  }
}

export type CreateExpenseData = {
  groupId: string;
  description: string;
  amount: number;
  paidById: string;
  splitBetween: string[];
  splitType: 'equal' | 'custom' | 'percentage';
  customSplits?: { userId: string; amount: number }[];
  category?: string;
  receipt?: string;
};

export async function createExpenseAction(data: CreateExpenseData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const groupIdNum = parseInt(data.groupId);
  if (isNaN(groupIdNum)) {
    throw new Error('Invalid group ID');
  }

  try {
    // Verify membership
    const membership = await db.query.usersToGroups.findFirst({
      where: (usersToGroups, { and, eq }) => and(
        eq(usersToGroups.userId, user.id),
        eq(usersToGroups.groupId, groupIdNum)
      ),
    });

    if (!membership) {
      throw new Error('You are not a member of this group');
    }

    // Create expense
    const [newExpense] = await db.insert(expenses).values({
      groupId: groupIdNum,
      description: data.description,
      amount: data.amount.toString(),
      paidById: data.paidById,
      category: data.category,
      receiptUrl: data.receipt,
      date: new Date(), // Use provided date if available in future
    }).returning();

    // Create splits
    // Currently only handling 'equal' split type for simplicity, as per original mock
    // In a real app, we'd handle other split types here
    const splitAmount = data.amount / data.splitBetween.length;

    const splitsToInsert = data.splitBetween.map(userId => ({
      expenseId: newExpense.id,
      userId: userId,
      amount: splitAmount.toString(),
    }));

    if (splitsToInsert.length > 0) {
      await db.insert(expenseSplits).values(splitsToInsert);
    }

    revalidatePath(`/groups/${data.groupId}`);
    revalidatePath('/dashboard');

    return { success: true, expense: newExpense };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw new Error('Failed to create expense');
  }
}

export async function joinGroupAction(code: string) {
  // TODO: Implement join by code logic
  // For now, this is a placeholder as the invite system wasn't fully detailed in schema
  // We might need to add an 'inviteCode' to the groups table or a separate invites table
  console.log("Joining with code:", code);
  throw new Error("Join by code not yet implemented");
}
