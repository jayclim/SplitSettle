import {
  pgTable,
  text,
  timestamp,
  uuid,
  serial,
  integer,
  boolean,
  jsonb,
  pgEnum,
  decimal,
  primaryKey,
  type PgTableWithColumns
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for user roles within a group
export const roleEnum = pgEnum('role', ['admin', 'member']);

// Enum for expense split types
export const splitTypeEnum = pgEnum('split_type', ['equal', 'custom', 'percentage']);

// Enum for message types
export const messageTypeEnum = pgEnum('message_type', ['text', 'expense', 'settlement', 'image']);

// Enum for settlement methods
export const settlementMethodEnum = pgEnum('settlement_method', ['venmo', 'paypal', 'cash', 'bank', 'other']);

// Enum for settlement statuses
export const settlementStatusEnum = pgEnum('settlement_status', ['pending', 'confirmed', 'disputed']);

// Users table to store public profile information, linked to Supabase auth users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => authUsers.id), // References Supabase auth.users
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Supabase auth.users table definition for establishing relations
export const authUsers = pgTable('users', {
    id: uuid('id').primaryKey(),
}, (table) => {
    return {
        schema: 'auth',
    }
});


export const usersRelations = relations(users, ({ many }) => ({
  groupMemberships: many(usersToGroups),
  expensesPaid: many(expenses),
  messagesSent: many(messages),
  settlementsFrom: many(settlements, { relationName: 'settlement_from' }),
  settlementsTo: many(settlements, { relationName: 'settlement_to' }),
}));

// Groups table
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(usersToGroups),
  expenses: many(expenses),
  messages: many(messages),
  settlements: many(settlements),
}));

// Join table for the many-to-many relationship between users and groups
export const usersToGroups = pgTable('users_to_groups', {
  userId: uuid('user_id').notNull().references(() => users.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
  role: roleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.groupId] }),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
}));

// Expenses table
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidById: uuid('paid_by_id').notNull().references(() => users.id),
  category: text('category'),
  receiptUrl: text('receipt_url'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  settled: boolean('settled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, { fields: [expenses.groupId], references: [groups.id] }),
  paidBy: one(users, { fields: [expenses.paidById], references: [users.id] }),
  splits: many(expenseSplits),
}));

// Expense splits table to define how an expense is split among users
export const expenseSplits = pgTable('expense_splits', {
  id: serial('id').primaryKey(),
  expenseId: integer('expense_id').notNull().references(() => expenses.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
});

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, { fields: [expenseSplits.expenseId], references: [expenses.id] }),
  user: one(users, { fields: [expenseSplits.userId], references: [users.id] }),
}));

// Messages table
export const messages: PgTableWithColumns<any> = pgTable('messages', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: messageTypeEnum('type').notNull().default('text'),
  replyToId: integer('reply_to_id').references(() => messages.id),
  expenseId: integer('expense_id').references(() => expenses.id),
  imageUrl: text('image_url'),
  reactions: jsonb('reactions'), // e.g., [{ emoji: '👍', users: ['uuid1', 'uuid2'] }]
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  group: one(groups, { fields: [messages.groupId], references: [groups.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  replyTo: one(messages, { fields: [messages.replyToId], references: [messages.id], relationName: 'reply' }),
  expense: one(expenses, { fields: [messages.expenseId], references: [expenses.id] }),
}));

// Settlements table
export const settlements = pgTable('settlements', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull().references(() => groups.id),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id),
  toUserId: uuid('to_user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: settlementMethodEnum('method').notNull(),
  status: settlementStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
});

export const settlementsRelations = relations(settlements, ({ one }) => ({
  group: one(groups, { fields: [settlements.groupId], references: [groups.id] }),
  fromUser: one(users, { fields: [settlements.fromUserId], references: [users.id], relationName: 'settlement_from' }),
  toUser: one(users, { fields: [settlements.toUserId], references: [users.id], relationName: 'settlement_to' }),
}));