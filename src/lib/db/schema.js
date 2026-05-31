import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
  text,
  integer,
  numeric,
  jsonb,
  date,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

// Enums
export const commentPhaseEnum = pgEnum("comment_phase", ["script", "video"]);
export const userRoleEnum = pgEnum("user_role", ["manager", "admin"]);
export const workflowStageEnum = pgEnum("workflow_stage", [
  "script_review",
  "changes_requested",
  "ready_for_shoot",
  "video_review",
  "ready_to_schedule",
  "scheduled",
  "published"
]);

// Organizations
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  plan: varchar("plan", { length: 32 }).default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("manager").notNull(),
  isSample: boolean("is_sample").default(false).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  avatarUrl: text("avatar_url"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  index("users_role_idx").on(table.role),
]);

// Org Members
export const orgMembers = pgTable("org_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 32 }).default("member").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Connected social accounts (per-org)
export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  platform: varchar("platform", { length: 32 }).notNull(),
  platformUserId: varchar("platform_user_id", { length: 255 }).notNull(),
  platformUsername: varchar("platform_username", { length: 255 }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  metaPageId: varchar("meta_page_id", { length: 255 }),
  metaIgAccountId: varchar("meta_ig_account_id", { length: 255 }),
  profilePictureUrl: text("profile_picture_url"),
  followersCount: integer("followers_count").default(0),
  isActive: boolean("is_active").default(true),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Research entries
export const researchEntries = pgTable("research_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  location: varchar("location", { length: 32 }).default("IN").notNull(),
  status: varchar("status", { length: 64 }).default("pending").notNull(),
  payload: jsonb("payload").default({}).notNull(),
  scheduledDate: varchar("scheduled_date", { length: 32 }),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("research_entries_keyword_idx").on(table.keyword),
  index("research_entries_status_idx").on(table.status),
]);

// Content items
export const contentItems = pgTable("content_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  researchEntryId: uuid("research_entry_id").references(() => researchEntries.id, { onDelete: "set null" }),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  format: varchar("format", { length: 64 }).notNull(),
  script: text("script").notNull(),
  originalScript: text("original_script"),
  style: varchar("style", { length: 64 }),
  audience: varchar("audience", { length: 255 }),
  location: varchar("location", { length: 32 }).default("IN").notNull(),
  stage: workflowStageEnum("stage").default("script_review").notNull(),
  legacyStatus: varchar("legacy_status", { length: 64 }).default("pending").notNull(),
  handoffNote: text("handoff_note"),
  scheduledDate: varchar("scheduled_date", { length: 32 }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  readyForShootAt: timestamp("ready_for_shoot_at", { withTimezone: true }),
  videoApprovedAt: timestamp("video_approved_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seo: jsonb("seo").default({}).notNull(),
  editing: jsonb("editing").default({}).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  tagSnapshot: jsonb("tag_snapshot").default([]).notNull(),
  publication: jsonb("publication").default({}).notNull(),
  performance: jsonb("performance").default({}).notNull(),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  approvedById: uuid("approved_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("content_items_stage_idx").on(table.stage),
  index("content_items_keyword_idx").on(table.keyword),
  index("content_items_created_by_idx").on(table.createdById),
  index("content_items_research_idx").on(table.researchEntryId),
]);

// Workflow comments
export const workflowComments = pgTable("workflow_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentItemId: uuid("content_item_id").references(() => contentItems.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  authorRole: userRoleEnum("author_role").notNull(),
  phase: commentPhaseEnum("phase").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("workflow_comments_content_item_idx").on(table.contentItemId),
  index("workflow_comments_created_at_idx").on(table.createdAt),
]);

// Workflow events
export const workflowEvents = pgTable("workflow_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentItemId: uuid("content_item_id").references(() => contentItems.id, { onDelete: "cascade" }).notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorRole: userRoleEnum("actor_role").notNull(),
  fromStage: workflowStageEnum("from_stage"),
  toStage: workflowStageEnum("to_stage").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("workflow_events_content_item_idx").on(table.contentItemId),
  index("workflow_events_stage_idx").on(table.toStage),
]);

// Instagram post snapshots (synced from Meta API)
export const igPosts = pgTable("ig_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  socialAccountId: uuid("social_account_id").references(() => socialAccounts.id, { onDelete: "cascade" }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  mediaId: varchar("media_id", { length: 255 }).notNull(),
  mediaType: varchar("media_type", { length: 32 }),
  mediaProductType: varchar("media_product_type", { length: 32 }),
  permalink: text("permalink"),
  caption: text("caption"),
  thumbnailUrl: text("thumbnail_url"),
  timestamp: timestamp("timestamp", { withTimezone: true }),
  likeCount: integer("like_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("ig_posts_account_media_unique").on(table.socialAccountId, table.mediaId),
]);

// Instagram insights snapshots (time-series)
export const igInsights = pgTable("ig_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  igPostId: uuid("ig_post_id").references(() => igPosts.id, { onDelete: "cascade" }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  views: integer("views").default(0),
  saves: integer("saves").default(0),
  shares: integer("shares").default(0),
  totalInteractions: integer("total_interactions").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
});

// Account-level insights (daily snapshots)
export const igAccountInsights = pgTable("ig_account_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  socialAccountId: uuid("social_account_id").references(() => socialAccounts.id, { onDelete: "cascade" }).notNull(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  followersCount: integer("followers_count").default(0),
  followsCount: integer("follows_count").default(0),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  profileViews: integer("profile_views").default(0),
  websiteClicks: integer("website_clicks").default(0),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("ig_account_insights_account_date_unique").on(table.socialAccountId, table.date),
]);
