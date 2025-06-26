import { relations } from 'drizzle-orm';
import { pgTable, date, serial, text, integer, boolean, real } from 'drizzle-orm/pg-core';
import { finished } from 'stream';

// User Schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').default(false), // Using text for datetime
  image: text('image'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const usersRelation = relations(users, ({one, many}) => ({
  wallets: one(wallets, {
    fields: [users.id],
    references: [wallets.userId]
  }),
  for: many(wagers, {relationName: 'for'}),
  against: many(wagers, {relationName: 'against'}),
  comments: many(comments),
  replies: many(replies),
}))

// Wallet Schema
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  provider: text('provider').notNull(),
  publicKey: text('public_key').notNull().unique(),
  solanaBalance: real('solana_balance'),
  isMainWallet: boolean('is_main_wallet').notNull().default(false),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const walletsRelations = relations(wallets, ({ one }) => ({
	owner: one(users, { fields: [wallets.userId], references: [users.id] }),
  token: one(tokens, {fields: [wallets.id], references: [tokens.walletId]})
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  userId: integer('user_id').references(() => users.id),
  hubId: integer('hub_id').references(() => hubs.id),
    createdAt: date('created_at').notNull().defaultNow(),
})

export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
  hub: one(hubs, {
    fields: [comments.hubId],
    references: [hubs.id]
  }),
  replies: many(replies),
}));

export const replies = pgTable('replies', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  commentId: integer('comment_id').references(() => comments.id),
  userId: integer('user_id').references(() => users.id),
    createdAt: date('created_at').notNull().defaultNow(),
})

export const repliesRelations = relations(replies, ({ one }) => ({
	author: one(users, {
		fields: [replies.userId],
		references: [users.id],
	}),
  comments: one(comments, {
    fields: [replies.commentId],
    references: [comments.id]
  })
}));

export const hubs = pgTable('hubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isGameFinished: boolean('is_game_finished').default(false),
  isGameStarted: boolean('is_game_started').default(false),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
})

export const hubsRelations = relations(hubs, ({one, many}) => ({
  teams: one(teams, {
    fields: [hubs.id],
    references: [teams.hubId], // make sure this matches your foreign key
  }),
  comments: many(comments),
  wagers: many(wagers),
}))

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  hubId: integer('hub_id').references(() => hubs.id),
  home: text('home').notNull(),
  away: text('away').notNull(),
  homeScore: integer('home_score').default(0),
  awayScore: integer('away_score').default(0),
  startTime: text('start_time').notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
})

export const teamsRelations = relations(teams, ({ one }) => ({
	owner: one(hubs, { fields: [teams.hubId], references: [hubs.id] }),
}));

export const wagers = pgTable('wagers', {
  id: serial('id').primaryKey(),
  for: integer('for').references(() => users.id),
  against: integer('against').references(() => users.id),
  hubId: integer('hub_id').references(() => hubs.id),
  createdAt: date('created_at').notNull().defaultNow(),
  isOpen: boolean('is_open').default(true),
  amount: integer('amount').notNull(),
  condition: text('condition').notNull(),
})

export const wagersRelations = relations(wagers, ({ one }) => ({
	owner: one(hubs, { fields: [wagers.hubId], references: [hubs.id] }),
  for: one(users, {fields: [wagers.for], references: [users.id], relationName: 'for'}),
  against: one(users, {fields: [wagers.against], references: [users.id], relationName: 'against'})
}));

// Token Schema
export const tokens = pgTable('tokens', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  mintAddress: text('mint_address').notNull(),
  tokenName: text('token_name'),
  symbol: text('symbol'),
  balance: real('balance'),
  decimals: integer('decimals'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const tokensRelations = relations(tokens, ({one}) => ({
  wallet: one(wallets, {fields: [tokens.walletId], references: [wallets.id]})
}))
