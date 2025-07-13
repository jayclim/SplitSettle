import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  pgEnum,
  decimal,
  uuid,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from '@auth/core/adapters';
import { relations, SQL, Placeholder } from 'drizzle-orm';

// =================================
//          ENUMS
// =================================

export const roleEnum = pgEnum('role', ['admin', 'member']);

// =================================
//          TABLES
// =================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  avatarUrl: text('avatar_url'),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersToGroups = pgTable(
  'users_to_groups',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    role: roleEnum('role').default('member').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  })
);

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidById: uuid('paid_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  category: text('category'),
  receiptUrl: text('receipt_url'),
  settled: boolean('settled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const expenseSplits = pgTable(
  'expense_splits',
  {
    id: serial('id').primaryKey(),
    expenseId: integer('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  }
  // Remove the table configuration function entirely since we're using 'id' as primary key
);

export const settlements = pgTable('settlements', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  payerId: uuid('payer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  payeeId: uuid('payee_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

type AnyPlaceholder = Placeholder<string, unknown>;

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  metadata: text('metadata').$type<AnyPlaceholder>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// =================================
//          RELATIONS
// =================================

export const usersRelations = relations(users, ({ many }) => ({
  groups: many(usersToGroups),
  expenses: many(expenses),
  expenseSplits: many(expenseSplits),
  messages: many(messages),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(usersToGroups),
  expenses: many(expenses),
  messages: many(messages),
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

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id],
  }),
  paidBy: one(users, {
    fields: [expenses.paidById],
    references: [users.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  group: one(groups, {
    fields: [messages.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// =================================
//          TYPE EXPORTS
// =================================

export type NewSettlement = typeof settlements.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type NewGroup = typeof groups.$inferInsert;
export type NewExpense = typeof expenses.$inferInsert;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;
export type NewMessage = typeof messages.$inferInsert;