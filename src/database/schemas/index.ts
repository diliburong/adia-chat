import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  AnyPgColumn,
  uuid,
  json,
  primaryKey,
  boolean,
  foreignKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { AdapterAccountType } from 'next-auth/adapters';
import { AppUsage } from '@/lib/usage';

// user table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// type for insert
export type NewUser = InferInsertModel<typeof usersTable>;
export type UserItem = InferSelectModel<typeof usersTable>;

// zod schema for insert
export const userInsertSchema = createInsertSchema(usersTable);

export const accountsTable = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
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
  table => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ]
);

// chat table
export const chatTable = pgTable('chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => usersTable.id),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  lastContext: jsonb('lastContext').$type<AppUsage | null>(),
});

// type for insert
export type NewChat = InferInsertModel<typeof chatTable>;
export type ChatItem = InferSelectModel<typeof chatTable>;

// zod schema for insert
export const chatInsertSchema = createInsertSchema(chatTable);

// message table
export const messageTable = pgTable('message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chatTable.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

// type for insert
export type DBNewMessage = InferInsertModel<typeof messageTable>;
export type DBMessageItem = InferSelectModel<typeof messageTable>;

// zod schema for insert
export const dbMessageInsertSchema = createInsertSchema(messageTable);

// vote table
export const voteTable = pgTable(
  'vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chatTable.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageTable.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  table => [primaryKey({ columns: [table.chatId, table.messageId] })]
);

// type for insert
export type DBNewVote = InferInsertModel<typeof voteTable>;
export type DBVoteItem = InferSelectModel<typeof voteTable>;

// zod schema for insert
export const dbVoteInsertSchema = createInsertSchema(voteTable);

// document table
export const documentTable = pgTable('document', {
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
    .notNull()
    .default('text'),
  userId: uuid('userId')
    .notNull()
    .references(() => usersTable.id),
});

// type for insert
export type Document = InferSelectModel<typeof documentTable>;
export type NewDocument = InferInsertModel<typeof documentTable>;

// zod schema for insert
export const dbDocumentInsertSchema = createInsertSchema(documentTable);

// suggestion table
export const suggestionTable = pgTable('suggestion', {
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  documentId: uuid('documentId')
    .notNull()
    .references(() => documentTable.id),
  documentCreatedAt: timestamp('documentCreatedAt').notNull(),
  originalText: text('originalText').notNull(),
  suggestedText: text('suggestedText').notNull(),
  description: text('description'),
  isResolved: boolean('isResolved').notNull().default(false),
  userId: uuid('userId')
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp('createdAt').notNull(),
});

// // type for insert
export type DBNewSuggestion = InferInsertModel<typeof suggestionTable>;
export type DBSuggestionItem = InferSelectModel<typeof suggestionTable>;

// zod schema for insert
export const dbSuggestionInsertSchema = createInsertSchema(suggestionTable);

export const streamTable = pgTable('stream', {
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chatTable.id),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBNewStream = InferInsertModel<typeof streamTable>;
export type DBStreamItem = InferSelectModel<typeof streamTable>;

// zod schema for insert
export const dbStreamInsertSchema = createInsertSchema(streamTable);
