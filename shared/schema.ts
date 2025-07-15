import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  json, 
  varchar,
  timestamp,
  jsonb,
  real,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  pricing: text("pricing").notNull(), // "free", "freemium", "paid"
  monthlyUsers: text("monthly_users").notNull(),
  rating: integer("rating").notNull(), // 1-100
  pros: json("pros").$type<string[]>().notNull(),
  cons: json("cons").$type<string[]>().notNull(),
  prosEn: json("pros_en").$type<string[]>(),
  consEn: json("cons_en").$type<string[]>(),
  features: json("features").$type<string[]>().notNull(),
  url: text("url").notNull(),
  iconCategory: text("icon_category").notNull() // for UI icons
});

export const aiBundles = pgTable("ai_bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  tools: json("tools").$type<{id: number, name: string, role: string, pricing: string}[]>().notNull(),
  estimatedCost: text("estimated_cost").notNull(),
  color: text("color").notNull(), // for UI theming
  icon: text("icon").notNull()
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  questionEn: text("question_en"),
  options: json("options").$type<{value: string, label: string, labelEn?: string, description: string, descriptionEn?: string}[]>().notNull(),
  order: integer("order").notNull(),
  parentOption: text("parent_option") // 부모 질문의 선택지 값
});

export const usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  aiToolId: integer("ai_tool_id").references(() => aiTools.id),
  totalUsers: integer("total_users").notNull(),
  dailyActiveUsers: integer("daily_active_users").notNull(),
  avgSessionTime: integer("avg_session_time").notNull(), // in minutes
  satisfactionScore: integer("satisfaction_score").notNull(), // 1-5 scale * 10 for decimal storage
  monthlyGrowth: integer("monthly_growth").notNull(), // percentage * 100
  category: text("category").notNull()
});

export const insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true
});

export const insertAiBundleSchema = createInsertSchema(aiBundles).omit({
  id: true
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true
});

export const insertUsageStatsSchema = createInsertSchema(usageStats).omit({
  id: true
});

export type AiTool = typeof aiTools.$inferSelect;
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiBundle = typeof aiBundles.$inferSelect;
export type InsertAiBundle = z.infer<typeof insertAiBundleSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type UsageStats = typeof usageStats.$inferSelect;
export type InsertUsageStats = z.infer<typeof insertUsageStatsSchema>;

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  language: varchar("language").default("ko"), // User's preferred language
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, active, canceled, past_due
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Custom packages table for user-created AI tool packages
export const customPackages = pgTable("custom_packages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  tools: jsonb("tools").notNull(), // Array of selected AI tools
  estimatedCost: varchar("estimated_cost"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomPackageSchema = createInsertSchema(customPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomPackage = typeof customPackages.$inferSelect;
export type InsertCustomPackage = z.infer<typeof insertCustomPackageSchema>;

// User favorites table
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull(), // AI tool ID or bundle ID
  itemType: varchar("item_type").notNull(), // "tool" or "bundle"
  itemName: varchar("item_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
