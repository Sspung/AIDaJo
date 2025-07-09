var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";
import session2 from "express-session";
import path2 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiBundles: () => aiBundles,
  aiTools: () => aiTools,
  customPackages: () => customPackages,
  insertAiBundleSchema: () => insertAiBundleSchema,
  insertAiToolSchema: () => insertAiToolSchema,
  insertCustomPackageSchema: () => insertCustomPackageSchema,
  insertQuizQuestionSchema: () => insertQuizQuestionSchema,
  insertUsageStatsSchema: () => insertUsageStatsSchema,
  insertUserFavoriteSchema: () => insertUserFavoriteSchema,
  quizQuestions: () => quizQuestions,
  sessions: () => sessions,
  usageStats: () => usageStats,
  userFavorites: () => userFavorites,
  users: () => users
});
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
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  pricing: text("pricing").notNull(),
  // "free", "freemium", "paid"
  monthlyUsers: text("monthly_users").notNull(),
  rating: integer("rating").notNull(),
  // 1-100
  pros: json("pros").$type().notNull(),
  cons: json("cons").$type().notNull(),
  prosEn: json("pros_en").$type(),
  consEn: json("cons_en").$type(),
  features: json("features").$type().notNull(),
  url: text("url").notNull(),
  iconCategory: text("icon_category").notNull()
  // for UI icons
});
var aiBundles = pgTable("ai_bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  tools: json("tools").$type().notNull(),
  estimatedCost: text("estimated_cost").notNull(),
  color: text("color").notNull(),
  // for UI theming
  icon: text("icon").notNull()
});
var quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  questionEn: text("question_en"),
  options: json("options").$type().notNull(),
  order: integer("order").notNull(),
  parentOption: text("parent_option")
  // 부모 질문의 선택지 값
});
var usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  aiToolId: integer("ai_tool_id").references(() => aiTools.id),
  totalUsers: integer("total_users").notNull(),
  dailyActiveUsers: integer("daily_active_users").notNull(),
  avgSessionTime: integer("avg_session_time").notNull(),
  // in minutes
  satisfactionScore: integer("satisfaction_score").notNull(),
  // 1-5 scale * 10 for decimal storage
  monthlyGrowth: integer("monthly_growth").notNull(),
  // percentage * 100
  category: text("category").notNull()
});
var insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true
});
var insertAiBundleSchema = createInsertSchema(aiBundles).omit({
  id: true
});
var insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true
});
var insertUsageStatsSchema = createInsertSchema(usageStats).omit({
  id: true
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  language: varchar("language").default("ko"),
  // User's preferred language
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"),
  // free, active, canceled, past_due
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customPackages = pgTable("custom_packages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  tools: jsonb("tools").notNull(),
  // Array of selected AI tools
  estimatedCost: varchar("estimated_cost"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCustomPackageSchema = createInsertSchema(customPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull(),
  // AI tool ID or bundle ID
  itemType: varchar("item_type").notNull(),
  // "tool" or "bundle"
  itemName: varchar("item_name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, or, sql } from "drizzle-orm";
var MemStorage = class {
  aiTools;
  aiBundles;
  quizQuestions;
  usageStats;
  users;
  customPackages;
  currentId;
  currentPackageId;
  constructor() {
    this.aiTools = /* @__PURE__ */ new Map();
    this.aiBundles = /* @__PURE__ */ new Map();
    this.quizQuestions = /* @__PURE__ */ new Map();
    this.usageStats = /* @__PURE__ */ new Map();
    this.users = /* @__PURE__ */ new Map();
    this.customPackages = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.currentPackageId = 1;
    this.initializeData();
  }
  initializeData() {
    const tools = [
      // 텍스트 AI (15개)
      {
        name: "ChatGPT",
        company: "OpenAI",
        description: "\uB300\uD654\uD615 AI\uB85C \uC9C8\uBB38 \uB2F5\uBCC0, \uAE00\uC4F0\uAE30, \uCF54\uB529 \uB4F1 \uB2E4\uC591\uD55C \uC791\uC5C5 \uC218\uD589",
        descriptionEn: "Conversational AI for Q&A, writing, coding and various tasks",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "180M+",
        rating: 95,
        pros: ["\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uB300\uD654", "\uB2E4\uC591\uD55C \uC791\uC5C5 \uC9C0\uC6D0", "\uB192\uC740 \uC815\uD655\uB3C4"],
        cons: ["\uC2E4\uC2DC\uAC04 \uC815\uBCF4 \uC81C\uD55C", "\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uBD88\uAC00", "\uC0AC\uC6A9\uB7C9 \uC81C\uD55C"],
        prosEn: ["Natural conversation", "Various task support", "High accuracy"],
        consEn: ["Real-time info limits", "No image generation", "Usage limits"],
        features: ["\uD14D\uC2A4\uD2B8 \uC0DD\uC131", "\uCF54\uB4DC \uC791\uC131", "\uBC88\uC5ED", "\uC694\uC57D"],
        url: "https://chat.openai.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Claude",
        company: "Anthropic",
        description: "\uC548\uC804\uD558\uACE0 \uB3C4\uC6C0\uC774 \uB418\uB294 AI \uC5B4\uC2DC\uC2A4\uD134\uD2B8, \uAE34 \uBB38\uC11C \uBD84\uC11D\uC5D0 \uD2B9\uD654",
        descriptionEn: "Safe and helpful AI assistant, specialized in long document analysis",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "free",
        monthlyUsers: "25M+",
        rating: 99,
        pros: ["\uAE34 \uBB38\uB9E5 \uCC98\uB9AC", "\uB192\uC740 \uC548\uC804\uC131", "\uC815\uD655\uD55C \uBD84\uC11D"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uB290\uB9B0 \uC751\uB2F5", "\uC9C0\uC5ED \uC81C\uD55C"],
        prosEn: ["Long context processing", "High safety", "Accurate analysis"],
        consEn: ["Limited features", "Slow response", "Regional restrictions"],
        features: ["\uBB38\uC11C \uBD84\uC11D", "\uCF54\uB4DC \uB9AC\uBDF0", "\uCC3D\uC791 \uC9C0\uC6D0"],
        url: "https://claude.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Gemini",
        company: "Google",
        description: "Google\uC758 \uCD5C\uC2E0 \uB300\uD654\uD615 AI, \uBA40\uD2F0\uBAA8\uB2EC \uAE30\uB2A5 \uC9C0\uC6D0",
        descriptionEn: "Google's latest conversational AI with multimodal capabilities",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "45M+",
        rating: 93,
        pros: ["\uC2E4\uC2DC\uAC04 \uAC80\uC0C9", "\uC774\uBBF8\uC9C0 \uBD84\uC11D", "\uBE60\uB978 \uC751\uB2F5"],
        cons: ["\uC77C\uBD80 \uC9C0\uC5ED \uC81C\uD55C", "\uCC3D\uC758\uC131 \uBD80\uC871", "\uD3B8\uD5A5\uC131"],
        prosEn: ["Real-time search", "Image analysis", "Fast response"],
        consEn: ["Some regional limits", "Lack of creativity", "Bias issues"],
        features: ["\uB300\uD654\uD615 AI", "\uC774\uBBF8\uC9C0 \uBD84\uC11D", "\uC2E4\uC2DC\uAC04 \uAC80\uC0C9"],
        url: "https://gemini.google.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Perplexity",
        company: "Perplexity AI",
        description: "\uC2E4\uC2DC\uAC04 \uAC80\uC0C9 \uAE30\uBC18 AI \uB2F5\uBCC0 \uC11C\uBE44\uC2A4",
        descriptionEn: "Real-time search-based AI answering service",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 87,
        pros: ["\uC815\uD655\uD55C \uCD9C\uCC98", "\uC2E4\uC2DC\uAC04 \uC815\uBCF4", "\uAE54\uB054\uD55C UI"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB290\uB9B0 \uC751\uB2F5", "\uBCF5\uC7A1\uD55C \uC9C8\uBB38 \uD55C\uACC4"],
        prosEn: ["Accurate sources", "Real-time info", "Clean UI"],
        consEn: ["Limited free tier", "Slow response", "Complex question limits"],
        features: ["\uAC80\uC0C9 \uAE30\uBC18 \uB2F5\uBCC0", "\uCD9C\uCC98 \uC81C\uACF5", "\uC694\uC57D"],
        url: "https://perplexity.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Notion AI",
        company: "Notion",
        description: "\uB178\uC158 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uD1B5\uD569 AI \uAE00\uC4F0\uAE30 \uB3C4\uC6B0\uBBF8",
        descriptionEn: "Notion workspace integrated AI writing assistant",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 84,
        pros: ["\uB178\uC158 \uD1B5\uD569", "\uAC04\uD3B8\uD55C \uC0AC\uC6A9", "\uD15C\uD50C\uB9BF \uC81C\uACF5"],
        cons: ["\uB178\uC158 \uC758\uC874", "\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uB290\uB9B0 \uCC98\uB9AC"],
        prosEn: ["Notion integration", "Easy to use", "Template provided"],
        consEn: ["Notion dependent", "Limited features", "Slow processing"],
        features: ["\uBB38\uC11C \uC791\uC131", "\uC694\uC57D", "\uBC88\uC5ED"],
        url: "https://notion.so/ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Jasper",
        company: "Jasper AI",
        description: "\uB9C8\uCF00\uD305 \uCF58\uD150\uCE20 \uD2B9\uD654 AI \uAE00\uC4F0\uAE30 \uB3C4\uAD6C",
        descriptionEn: "Marketing content specialized AI writing tool",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "paid",
        monthlyUsers: "5M+",
        rating: 82,
        pros: ["\uB9C8\uCF00\uD305 \uD2B9\uD654", "\uD15C\uD50C\uB9BF \uB2E4\uC591", "\uBE0C\uB79C\uB4DC \uD1A4 \uC124\uC815"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uBCF5\uC7A1\uD55C UI", "\uD559\uC2B5 \uD544\uC694"],
        prosEn: ["Marketing specialized", "Various templates", "Brand tone setting"],
        consEn: ["High price", "Complex UI", "Learning required"],
        features: ["\uB9C8\uCF00\uD305 \uCE74\uD53C", "\uBE14\uB85C\uADF8 \uC791\uC131", "\uC18C\uC15C\uBBF8\uB514\uC5B4"],
        url: "https://jasper.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Copy.ai",
        company: "Copy.ai",
        description: "\uB9C8\uCF00\uD305 \uCE74\uD53C \uC0DD\uC131\uC5D0 \uD2B9\uD654\uB41C AI \uB3C4\uAD6C",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 79,
        pros: ["\uC0AC\uC6A9 \uAC04\uD3B8", "\uB2E4\uC591\uD55C \uD15C\uD50C\uB9BF", "\uBB34\uB8CC \uD50C\uB79C"],
        cons: ["\uD488\uC9C8 \uD3B8\uCC28", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uCC3D\uC758\uC131 \uBD80\uC871"],
        features: ["\uCE74\uD53C \uC0DD\uC131", "\uC774\uBA54\uC77C \uC791\uC131", "\uAD11\uACE0 \uBB38\uAD6C"],
        url: "https://copy.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Grammarly",
        company: "Grammarly",
        description: "AI \uAE30\uBC18 \uC601\uBB38\uBC95 \uAC80\uC0AC \uBC0F \uAE00\uC4F0\uAE30 \uAC1C\uC120 \uB3C4\uAD6C",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "30M+",
        rating: 91,
        pros: ["\uC815\uD655\uD55C \uBB38\uBC95 \uAC80\uC0AC", "\uC2A4\uD0C0\uC77C \uAC1C\uC120", "\uD50C\uB7EC\uADF8\uC778 \uC9C0\uC6D0"],
        cons: ["\uC601\uC5B4 \uC804\uC6A9", "\uBE44\uC2FC \uD504\uB9AC\uBBF8\uC5C4", "\uACFC\uB3C4\uD55C \uC81C\uC548"],
        features: ["\uBB38\uBC95 \uAC80\uC0AC", "\uC2A4\uD0C0\uC77C \uAC1C\uC120", "\uD45C\uC808 \uAC80\uC0AC"],
        url: "https://grammarly.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Writesonic",
        company: "Writesonic",
        description: "\uB2E4\uC591\uD55C \uD615\uD0DC\uC758 \uCF58\uD150\uCE20 \uC0DD\uC131 AI \uD50C\uB7AB\uD3FC",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 76,
        pros: ["\uB2E4\uC591\uD55C \uAE30\uB2A5", "\uD569\uB9AC\uC801 \uAC00\uACA9", "API \uC81C\uACF5"],
        cons: ["\uD488\uC9C8 \uBD88\uC77C\uCE58", "\uBCF5\uC7A1\uD55C \uC778\uD130\uD398\uC774\uC2A4", "\uC81C\uD55C\uB41C \uC5B8\uC5B4"],
        features: ["\uBE14\uB85C\uADF8 \uC791\uC131", "\uAD11\uACE0 \uCE74\uD53C", "\uC18C\uC15C\uBBF8\uB514\uC5B4"],
        url: "https://writesonic.com",
        iconCategory: "comment-alt"
      },
      {
        name: "QuillBot",
        company: "QuillBot",
        description: "AI \uD328\uB7EC\uD504\uB808\uC774\uC9D5 \uBC0F \uC694\uC57D \uB3C4\uAD6C",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "12M+",
        rating: 83,
        pros: ["\uC815\uD655\uD55C \uD328\uB7EC\uD504\uB808\uC774\uC9D5", "\uB2E4\uC591\uD55C \uBAA8\uB4DC", "\uBB34\uB8CC \uBC84\uC804"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uB290\uB9B0 \uCC98\uB9AC", "\uBC88\uC5ED \uBD80\uC815\uD655"],
        features: ["\uD328\uB7EC\uD504\uB808\uC774\uC9D5", "\uC694\uC57D", "\uBB38\uBC95 \uAC80\uC0AC"],
        url: "https://quillbot.com",
        iconCategory: "comment-alt"
      },
      {
        name: "DeepL",
        company: "DeepL",
        description: "AI \uAE30\uBC18 \uACE0\uD488\uC9C8 \uBC88\uC5ED \uC11C\uBE44\uC2A4",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "20M+",
        rating: 94,
        pros: ["\uC815\uD655\uD55C \uBC88\uC5ED", "\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uBB38\uCCB4", "\uBE60\uB978 \uC18D\uB3C4"],
        cons: ["\uC81C\uD55C\uB41C \uC5B8\uC5B4", "\uD30C\uC77C \uD06C\uAE30 \uC81C\uD55C", "\uBE44\uC2FC \uD504\uB9AC\uBBF8\uC5C4"],
        features: ["\uACE0\uD488\uC9C8 \uBC88\uC5ED", "\uBB38\uC11C \uBC88\uC5ED", "API"],
        url: "https://deepl.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Wordtune",
        company: "AI21 Labs",
        description: "AI \uAE30\uBC18 \uC601\uC5B4 \uAE00\uC4F0\uAE30 \uAC1C\uC120 \uB3C4\uAD6C",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "6M+",
        rating: 78,
        pros: ["\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uAC1C\uC120", "\uAC04\uB2E8\uD55C \uC0AC\uC6A9", "\uC2E4\uC2DC\uAC04 \uC81C\uC548"],
        cons: ["\uC601\uC5B4 \uC804\uC6A9", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uCC3D\uC758\uC131 \uBD80\uC871"],
        features: ["\uBB38\uC7A5 \uAC1C\uC120", "\uD1A4 \uC870\uC815", "\uD655\uC7A5/\uCD95\uC57D"],
        url: "https://wordtune.com",
        iconCategory: "comment-alt"
      },
      {
        name: "Rytr",
        company: "Rytr",
        description: "\uC800\uB834\uD55C AI \uCF58\uD150\uCE20 \uC0DD\uC131 \uB3C4\uAD6C",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 74,
        pros: ["\uC800\uB834\uD55C \uAC00\uACA9", "\uB2E4\uC591\uD55C \uD15C\uD50C\uB9BF", "\uC0AC\uC6A9 \uD3B8\uC758"],
        cons: ["\uD488\uC9C8 \uD3B8\uCC28", "\uC81C\uD55C\uB41C \uC5B8\uC5B4", "\uCC3D\uC758\uC131 \uBD80\uC871"],
        features: ["\uBE14\uB85C\uADF8 \uC791\uC131", "\uC774\uBA54\uC77C", "\uAD11\uACE0 \uBB38\uAD6C"],
        url: "https://rytr.me",
        iconCategory: "comment-alt"
      },
      {
        name: "Otter.ai",
        company: "Otter.ai",
        description: "\uC2E4\uC2DC\uAC04 \uC74C\uC131 \uC778\uC2DD \uBC0F \uD68C\uC758 \uAE30\uB85D AI",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "15M+",
        rating: 86,
        pros: ["\uC815\uD655\uD55C \uC74C\uC131 \uC778\uC2DD", "\uC2E4\uC2DC\uAC04 \uC804\uC0AC", "\uD611\uC5C5 \uAE30\uB2A5"],
        cons: ["\uC601\uC5B4 \uC911\uC2EC", "\uBC30\uACBD \uC18C\uC74C \uBBFC\uAC10", "\uC81C\uD55C\uB41C \uBB34\uB8CC"],
        features: ["\uC74C\uC131 \uC804\uC0AC", "\uD68C\uC758 \uAE30\uB85D", "\uC694\uC57D"],
        url: "https://otter.ai",
        iconCategory: "comment-alt"
      },
      {
        name: "Character.AI",
        company: "Character.AI",
        description: "\uCE90\uB9AD\uD130 \uAE30\uBC18 \uB300\uD654\uD615 AI \uD50C\uB7AB\uD3FC",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "18M+",
        rating: 81,
        pros: ["\uB2E4\uC591\uD55C \uCE90\uB9AD\uD130", "\uCC3D\uC758\uC801 \uB300\uD654", "\uBB34\uB8CC \uC0AC\uC6A9"],
        cons: ["\uBD88\uC548\uC815\uD55C \uC11C\uBC84", "\uD488\uC9C8 \uD3B8\uCC28", "\uC81C\uD55C\uB41C \uAE30\uB2A5"],
        features: ["\uCE90\uB9AD\uD130 \uB300\uD654", "\uB864\uD50C\uB808\uC774", "\uCC3D\uC791"],
        url: "https://character.ai",
        iconCategory: "comment-alt"
      },
      // 이미지 AI (12개)
      {
        name: "Midjourney",
        company: "Midjourney Inc.",
        description: "\uD14D\uC2A4\uD2B8 \uD504\uB86C\uD504\uD2B8\uB85C \uACE0\uD488\uC9C8 \uC544\uD2B8\uC6CC\uD06C\uC640 \uC774\uBBF8\uC9C0 \uC0DD\uC131",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "paid",
        monthlyUsers: "15M+",
        rating: 98,
        pros: ["\uB6F0\uC5B4\uB09C \uC774\uBBF8\uC9C0 \uD488\uC9C8", "\uC608\uC220\uC801 \uC2A4\uD0C0\uC77C", "\uD65C\uBC1C\uD55C \uCEE4\uBBA4\uB2C8\uD2F0"],
        cons: ["\uB514\uC2A4\uCF54\uB4DC \uD544\uC218", "\uB192\uC740 \uAC00\uACA9", "\uD559\uC2B5 \uACE1\uC120"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uC2A4\uD0C0\uC77C \uC870\uC815", "\uACE0\uD574\uC0C1\uB3C4 \uCD9C\uB825"],
        url: "https://midjourney.com",
        iconCategory: "image"
      },
      {
        name: "DALL-E 3",
        company: "OpenAI",
        description: "OpenAI\uC758 \uCD5C\uC2E0 \uC774\uBBF8\uC9C0 \uC0DD\uC131 AI",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "paid",
        monthlyUsers: "12M+",
        rating: 96,
        pros: ["\uC815\uD655\uD55C \uD504\uB86C\uD504\uD2B8 \uC774\uD574", "\uC548\uC804\uC131", "ChatGPT \uD1B5\uD569"],
        cons: ["\uB192\uC740 \uBE44\uC6A9", "\uC18D\uB3C4 \uC81C\uD55C", "\uC2A4\uD0C0\uC77C \uC81C\uD55C"],
        features: ["\uD14D\uC2A4\uD2B8-\uC774\uBBF8\uC9C0", "\uD504\uB86C\uD504\uD2B8 \uAC1C\uC120", "\uC548\uC804 \uD544\uD130"],
        url: "https://openai.com/dall-e-3",
        iconCategory: "image"
      },
      {
        name: "Stable Diffusion",
        company: "Stability AI",
        description: "\uC624\uD508\uC18C\uC2A4 \uC774\uBBF8\uC9C0 \uC0DD\uC131 AI \uBAA8\uB378",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "free",
        monthlyUsers: "8M+",
        rating: 89,
        pros: ["\uBB34\uB8CC \uC0AC\uC6A9", "\uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uB85C\uCEEC \uC2E4\uD589"],
        cons: ["\uBCF5\uC7A1\uD55C \uC124\uC815", "\uD558\uB4DC\uC6E8\uC5B4 \uC694\uAD6C", "\uD488\uC9C8 \uD3B8\uCC28"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "img2img", "\uC778\uD398\uC778\uD305"],
        url: "https://stability.ai",
        iconCategory: "image"
      },
      {
        name: "Leonardo.ai",
        company: "Leonardo.ai",
        description: "\uAC8C\uC784 \uBC0F \uCC3D\uC791\uBB3C\uC744 \uC704\uD55C AI \uC774\uBBF8\uC9C0 \uC0DD\uC131",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 85,
        pros: ["\uAC8C\uC784 \uD2B9\uD654", "\uBB34\uB8CC \uD06C\uB808\uB527", "\uB2E4\uC591\uD55C \uBAA8\uB378"],
        cons: ["\uBCF5\uC7A1\uD55C UI", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB290\uB9B0 \uC0DD\uC131"],
        features: ["\uCE90\uB9AD\uD130 \uC0DD\uC131", "\uBC30\uACBD \uC81C\uC791", "\uCEE8\uC149 \uC544\uD2B8"],
        url: "https://leonardo.ai",
        iconCategory: "image"
      },
      {
        name: "Adobe Firefly",
        company: "Adobe",
        description: "Adobe Creative Cloud \uD1B5\uD569 AI \uC774\uBBF8\uC9C0 \uC0DD\uC131",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 87,
        pros: ["Creative Cloud \uD1B5\uD569", "\uC0C1\uC5C5\uC801 \uC548\uC804", "\uACE0\uD488\uC9C8"],
        cons: ["Adobe \uAD6C\uB3C5 \uD544\uC694", "\uC81C\uD55C\uB41C \uC2A4\uD0C0\uC77C", "\uB192\uC740 \uBE44\uC6A9"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uD14D\uC2A4\uD2B8 \uD6A8\uACFC", "\uBCA1\uD130 \uBCC0\uD658"],
        url: "https://firefly.adobe.com",
        iconCategory: "image"
      },
      {
        name: "Canva AI",
        company: "Canva",
        description: "Canva \uD1B5\uD569 AI \uB514\uC790\uC778 \uB3C4\uAD6C",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "22M+",
        rating: 82,
        pros: ["\uC26C\uC6B4 \uC0AC\uC6A9", "\uD15C\uD50C\uB9BF \uB2E4\uC591", "\uBB34\uB8CC \uAE30\uB2A5"],
        cons: ["\uC81C\uD55C\uB41C AI \uAE30\uB2A5", "\uD488\uC9C8 \uC81C\uD55C", "\uC6CC\uD130\uB9C8\uD06C"],
        features: ["\uC790\uB3D9 \uB514\uC790\uC778", "\uBC30\uACBD \uC81C\uAC70", "\uC774\uBBF8\uC9C0 \uC0DD\uC131"],
        url: "https://canva.com",
        iconCategory: "image"
      },
      {
        name: "Playground AI",
        company: "Playground AI",
        description: "\uC0AC\uC6A9\uC790 \uCE5C\uD654\uC801 AI \uC774\uBBF8\uC9C0 \uC0DD\uC131 \uD50C\uB7AB\uD3FC",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 78,
        pros: ["\uAC04\uB2E8\uD55C UI", "\uBB34\uB8CC \uC0AC\uC6A9", "\uBE60\uB978 \uC0DD\uC131"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD488\uC9C8 \uD3B8\uCC28", "\uC11C\uBC84 \uBD88\uC548\uC815"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uD3B8\uC9D1", "\uD544\uD130"],
        url: "https://playgroundai.com",
        iconCategory: "image"
      },
      {
        name: "Ideogram",
        company: "Ideogram",
        description: "\uD14D\uC2A4\uD2B8\uAC00 \uD3EC\uD568\uB41C \uC774\uBBF8\uC9C0 \uC0DD\uC131\uC5D0 \uD2B9\uD654",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 79,
        pros: ["\uD14D\uC2A4\uD2B8 \uB80C\uB354\uB9C1", "\uBB34\uB8CC \uC0AC\uC6A9", "\uBE60\uB978 \uC18D\uB3C4"],
        cons: ["\uC81C\uD55C\uB41C \uC2A4\uD0C0\uC77C", "\uBCA0\uD0C0 \uC0C1\uD0DC", "\uAE30\uB2A5 \uC81C\uD55C"],
        features: ["\uD14D\uC2A4\uD2B8 \uC774\uBBF8\uC9C0", "\uB85C\uACE0 \uC0DD\uC131", "\uD0C0\uC774\uD3EC\uADF8\uB798\uD53C"],
        url: "https://ideogram.ai",
        iconCategory: "image"
      },
      {
        name: "DreamStudio",
        company: "Stability AI",
        description: "Stable Diffusion\uC758 \uC6F9 \uC778\uD130\uD398\uC774\uC2A4",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 83,
        pros: ["\uACE0\uAE09 \uC124\uC815", "\uBE60\uB978 \uC0DD\uC131", "API \uC811\uADFC"],
        cons: ["\uBCF5\uC7A1\uD55C UI", "\uD06C\uB808\uB527 \uC2DC\uC2A4\uD15C", "\uD559\uC2B5 \uACE1\uC120"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uC2A4\uD0C0\uC77C \uBBF9\uC2F1", "\uBC30\uCE58 \uC0DD\uC131"],
        url: "https://dreamstudio.ai",
        iconCategory: "image"
      },
      {
        name: "Artbreeder",
        company: "Artbreeder",
        description: "\uC720\uC804\uC790 \uC54C\uACE0\uB9AC\uC998 \uAE30\uBC18 \uC774\uBBF8\uC9C0 \uC9C4\uD654",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 75,
        pros: ["\uB3C5\uD2B9\uD55C \uBC29\uC2DD", "\uBB34\uB8CC \uAE30\uB2A5", "\uCEE4\uBBA4\uB2C8\uD2F0"],
        cons: ["\uC81C\uD55C\uB41C \uCEE8\uD2B8\uB864", "\uB290\uB9B0 \uC0DD\uC131", "\uD488\uC9C8 \uD3B8\uCC28"],
        features: ["\uC774\uBBF8\uC9C0 \uBBF9\uC2F1", "\uD3EC\uD2B8\uB808\uC774\uD2B8", "\uD48D\uACBD"],
        url: "https://artbreeder.com",
        iconCategory: "image"
      },
      {
        name: "Remove.bg",
        company: "Kaleido AI",
        description: "AI \uAE30\uBC18 \uC790\uB3D9 \uBC30\uACBD \uC81C\uAC70 \uB3C4\uAD6C",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "25M+",
        rating: 92,
        pros: ["\uC815\uD655\uD55C \uBC30\uACBD \uC81C\uAC70", "\uBE60\uB978 \uCC98\uB9AC", "API \uC81C\uACF5"],
        cons: ["\uB2E8\uC77C \uAE30\uB2A5", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C \uC774\uBBF8\uC9C0 \uD55C\uACC4"],
        features: ["\uBC30\uACBD \uC81C\uAC70", "\uBC30\uCE58 \uCC98\uB9AC", "API"],
        url: "https://remove.bg",
        iconCategory: "image"
      },
      {
        name: "Upscale.media",
        company: "Upscale.media",
        description: "AI \uAE30\uBC18 \uC774\uBBF8\uC9C0 \uC5C5\uC2A4\uCF00\uC77C\uB9C1 \uC11C\uBE44\uC2A4",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "6M+",
        rating: 88,
        pros: ["\uACE0\uD488\uC9C8 \uC5C5\uC2A4\uCF00\uC77C", "\uBE60\uB978 \uCC98\uB9AC", "\uBB34\uB8CC \uC0AC\uC6A9"],
        cons: ["\uC81C\uD55C\uB41C \uD06C\uAE30", "\uB2E8\uC77C \uAE30\uB2A5", "\uB300\uAE30 \uC2DC\uAC04"],
        features: ["\uC774\uBBF8\uC9C0 \uD655\uB300", "\uB178\uC774\uC988 \uC81C\uAC70", "\uC120\uBA85\uD654"],
        url: "https://upscale.media",
        iconCategory: "image"
      },
      // 영상 AI (8개)
      {
        name: "Runway ML",
        company: "Runway",
        description: "AI \uAE30\uBC18 \uC601\uC0C1 \uD3B8\uC9D1 \uBC0F \uC0DD\uC131 \uB3C4\uAD6C",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 85,
        pros: ["\uB2E4\uC591\uD55C \uC601\uC0C1 \uB3C4\uAD6C", "\uC0AC\uC6A9\uC790 \uCE5C\uD654\uC801", "\uBE60\uB978 \uCC98\uB9AC"],
        cons: ["\uB192\uC740 \uAD6C\uB3C5\uB8CC", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uC778\uD130\uB137 \uD544\uC218"],
        features: ["\uC601\uC0C1 \uC0DD\uC131", "\uBC30\uACBD \uC81C\uAC70", "\uBAA8\uC158 \uD2B8\uB798\uD0B9"],
        url: "https://runwayml.com",
        iconCategory: "video"
      },
      {
        name: "Synthesia",
        company: "Synthesia",
        description: "AI \uC544\uBC14\uD0C0\uB97C \uC774\uC6A9\uD55C \uC601\uC0C1 \uC0DD\uC131 \uD50C\uB7AB\uD3FC",
        category: "\uC601\uC0C1",
        pricing: "paid",
        monthlyUsers: "3M+",
        rating: 89,
        pros: ["\uC2E4\uC81C\uAC19\uC740 \uC544\uBC14\uD0C0", "\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0", "\uC26C\uC6B4 \uC0AC\uC6A9"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uBD80\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC81C\uC2A4\uCC98"],
        features: ["\uC544\uBC14\uD0C0 \uC601\uC0C1", "\uB2E4\uAD6D\uC5B4 \uC74C\uC131", "\uD15C\uD50C\uB9BF"],
        url: "https://synthesia.io",
        iconCategory: "video"
      },
      {
        name: "Pika Labs",
        company: "Pika Labs",
        description: "\uD14D\uC2A4\uD2B8\uB85C \uC601\uC0C1\uC744 \uC0DD\uC131\uD558\uB294 AI \uB3C4\uAD6C",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 82,
        pros: ["\uAC04\uB2E8\uD55C \uD14D\uC2A4\uD2B8 \uC785\uB825", "\uCC3D\uC758\uC801 \uACB0\uACFC", "\uBB34\uB8CC \uC0AC\uC6A9"],
        cons: ["\uC9E7\uC740 \uC601\uC0C1", "\uD488\uC9C8 \uD3B8\uCC28", "\uB300\uAE30 \uC2DC\uAC04"],
        features: ["\uD14D\uC2A4\uD2B8-\uC601\uC0C1", "\uC774\uBBF8\uC9C0 \uC560\uB2C8\uBA54\uC774\uC158", "\uC2A4\uD0C0\uC77C \uC870\uC815"],
        url: "https://pika.art",
        iconCategory: "video"
      },
      {
        name: "Luma Dream Machine",
        company: "Luma AI",
        description: "\uACE0\uD488\uC9C8 AI \uC601\uC0C1 \uC0DD\uC131 \uB3C4\uAD6C",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 87,
        pros: ["\uACE0\uD488\uC9C8 \uCD9C\uB825", "\uC2E4\uC81C\uAC19\uC740 \uC6C0\uC9C1\uC784", "\uBB34\uB8CC \uCCB4\uD5D8"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uAE34 \uCC98\uB9AC \uC2DC\uAC04", "\uBCA0\uD0C0 \uC0C1\uD0DC"],
        features: ["\uC601\uC0C1 \uC0DD\uC131", "3D \uC52C", "\uCE74\uBA54\uB77C \uBAA8\uC158"],
        url: "https://lumalabs.ai",
        iconCategory: "video"
      },
      {
        name: "Invideo AI",
        company: "InVideo",
        description: "AI \uAE30\uBC18 \uB9C8\uCF00\uD305 \uC601\uC0C1 \uC81C\uC791 \uB3C4\uAD6C",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 78,
        pros: ["\uB9C8\uCF00\uD305 \uD2B9\uD654", "\uD15C\uD50C\uB9BF \uB2E4\uC591", "\uC790\uB3D9 \uD3B8\uC9D1"],
        cons: ["\uC6CC\uD130\uB9C8\uD06C", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C UI"],
        features: ["\uC790\uB3D9 \uD3B8\uC9D1", "\uD15C\uD50C\uB9BF", "\uC74C\uC131 \uC0DD\uC131"],
        url: "https://invideo.io",
        iconCategory: "video"
      },
      {
        name: "Pictory",
        company: "Pictory",
        description: "\uAE34 \uD615\uD0DC \uCF58\uD150\uCE20\uB97C \uC9E7\uC740 \uC601\uC0C1\uC73C\uB85C \uBCC0\uD658",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 76,
        pros: ["\uC790\uB3D9 \uC694\uC57D", "\uC26C\uC6B4 \uC0AC\uC6A9", "\uB2E4\uC591\uD55C \uD615\uC2DD"],
        cons: ["\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uD488\uC9C8 \uD3B8\uCC28", "\uB192\uC740 \uAC00\uACA9"],
        features: ["\uCF58\uD150\uCE20 \uC694\uC57D", "\uC790\uB3D9 \uD3B8\uC9D1", "\uC790\uB9C9 \uC0DD\uC131"],
        url: "https://pictory.ai",
        iconCategory: "video"
      },
      {
        name: "Fliki",
        company: "Fliki",
        description: "\uD14D\uC2A4\uD2B8\uB97C \uC601\uC0C1\uC73C\uB85C \uBCC0\uD658\uD558\uB294 AI \uB3C4\uAD6C",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 79,
        pros: ["\uAC04\uB2E8\uD55C \uC0AC\uC6A9", "\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0", "\uBB34\uB8CC \uD50C\uB79C"],
        cons: ["\uC81C\uD55C\uB41C \uC74C\uC131", "\uC6CC\uD130\uB9C8\uD06C", "\uD15C\uD50C\uB9BF \uC81C\uD55C"],
        features: ["\uD14D\uC2A4\uD2B8-\uC601\uC0C1", "\uC74C\uC131 \uC0DD\uC131", "\uC790\uB9C9"],
        url: "https://fliki.ai",
        iconCategory: "video"
      },
      {
        name: "Steve AI",
        company: "Steve AI",
        description: "\uC560\uB2C8\uBA54\uC774\uC158 \uC601\uC0C1 \uC81C\uC791 AI \uD50C\uB7AB\uD3FC",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 73,
        pros: ["\uC560\uB2C8\uBA54\uC774\uC158 \uD2B9\uD654", "\uCE90\uB9AD\uD130 \uB2E4\uC591", "\uD15C\uD50C\uB9BF"],
        cons: ["\uC81C\uD55C\uB41C \uC2E4\uC0AC", "\uD488\uC9C8 \uD3B8\uCC28", "\uBCF5\uC7A1\uD55C \uAC00\uACA9"],
        features: ["\uC560\uB2C8\uBA54\uC774\uC158", "\uCE90\uB9AD\uD130", "\uC2A4\uD1A0\uB9AC\uBCF4\uB4DC"],
        url: "https://steve.ai",
        iconCategory: "video"
      },
      // 음성 AI (8개)
      {
        name: "ElevenLabs",
        company: "ElevenLabs",
        description: "\uC790\uC5F0\uC2A4\uB7EC\uC6B4 AI \uC74C\uC131 \uC0DD\uC131 \uBC0F \uC74C\uC131 \uBCF5\uC81C",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 92,
        pros: ["\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC74C\uC131", "\uB2E4\uC591\uD55C \uC5B8\uC5B4", "\uC74C\uC131 \uBCF5\uC81C"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uAE34 \uCC98\uB9AC \uC2DC\uAC04", "\uC724\uB9AC\uC801 \uC6B0\uB824"],
        features: ["\uC74C\uC131 \uC0DD\uC131", "\uC74C\uC131 \uBCF5\uC81C", "\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0"],
        url: "https://elevenlabs.io",
        iconCategory: "microphone"
      },
      {
        name: "Murf AI",
        company: "Murf AI",
        description: "\uC804\uBB38\uC801\uC778 \uC74C\uC131 \uC0DD\uC131 \uBC0F \uD3B8\uC9D1 \uD50C\uB7AB\uD3FC",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 86,
        pros: ["\uC804\uBB38\uC801\uC778 \uD488\uC9C8", "\uD3B8\uC9D1 \uAE30\uB2A5", "\uB2E4\uC591\uD55C \uC74C\uC131"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C UI"],
        features: ["\uC74C\uC131 \uC0DD\uC131", "\uD3B8\uC9D1", "\uBC30\uACBD\uC74C"],
        url: "https://murf.ai",
        iconCategory: "microphone"
      },
      {
        name: "Speechify",
        company: "Speechify",
        description: "\uD14D\uC2A4\uD2B8\uB97C \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC74C\uC131\uC73C\uB85C \uBCC0\uD658",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 84,
        pros: ["\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC77D\uAE30", "\uBE60\uB978 \uC18D\uB3C4", "\uB2E4\uC591\uD55C \uC74C\uC131"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uAD6C\uB3C5 \uBAA8\uB378", "\uC77C\uBD80 \uBD80\uC815\uD655"],
        features: ["\uD14D\uC2A4\uD2B8 \uC77D\uAE30", "\uC18D\uB3C4 \uC870\uC808", "\uD558\uC774\uB77C\uC774\uD2B8"],
        url: "https://speechify.com",
        iconCategory: "microphone"
      },
      {
        name: "Resemble AI",
        company: "Resemble AI",
        description: "\uC2E4\uC2DC\uAC04 \uC74C\uC131 \uBCF5\uC81C \uBC0F \uC0DD\uC131 API",
        category: "\uC74C\uC131",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 88,
        pros: ["\uC2E4\uC2DC\uAC04 \uC0DD\uC131", "API \uC81C\uACF5", "\uB192\uC740 \uD488\uC9C8"],
        cons: ["\uBCF5\uC7A1\uD55C \uC124\uC815", "\uB192\uC740 \uBE44\uC6A9", "\uAE30\uC220\uC801 \uC694\uAD6C"],
        features: ["\uC74C\uC131 \uBCF5\uC81C", "\uC2E4\uC2DC\uAC04 \uBCC0\uD658", "API"],
        url: "https://resemble.ai",
        iconCategory: "microphone"
      },
      {
        name: "PlayHT",
        company: "PlayHT",
        description: "\uC628\uB77C\uC778 \uD14D\uC2A4\uD2B8-\uC74C\uC131 \uBCC0\uD658 \uC11C\uBE44\uC2A4",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 80,
        pros: ["\uAC04\uB2E8\uD55C \uC0AC\uC6A9", "\uB2E4\uC591\uD55C \uC5B8\uC5B4", "\uBB34\uB8CC \uCCB4\uD5D8"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD488\uC9C8 \uD3B8\uCC28", "\uB290\uB9B0 \uCC98\uB9AC"],
        features: ["\uD14D\uC2A4\uD2B8-\uC74C\uC131", "\uB2E4\uAD6D\uC5B4", "\uB2E4\uC6B4\uB85C\uB4DC"],
        url: "https://play.ht",
        iconCategory: "microphone"
      },
      {
        name: "Descript",
        company: "Descript",
        description: "AI \uAE30\uBC18 \uC624\uB514\uC624/\uBE44\uB514\uC624 \uD3B8\uC9D1 \uD50C\uB7AB\uD3FC",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 89,
        pros: ["\uD601\uC2E0\uC801\uC778 \uD3B8\uC9D1", "\uC74C\uC131 \uBCF5\uC81C", "\uD31F\uCE90\uC2A4\uD2B8 \uD2B9\uD654"],
        cons: ["\uD559\uC2B5 \uACE1\uC120", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C \uAE30\uB2A5"],
        features: ["\uC624\uB514\uC624 \uD3B8\uC9D1", "\uC74C\uC131 \uBCF5\uC81C", "\uC804\uC0AC"],
        url: "https://descript.com",
        iconCategory: "microphone"
      },
      {
        name: "LOVO AI",
        company: "LOVO",
        description: "AI \uC74C\uC131 \uC0DD\uC131 \uBC0F \uBE44\uB514\uC624 \uC81C\uC791 \uD50C\uB7AB\uD3FC",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 77,
        pros: ["\uBE44\uB514\uC624 \uD1B5\uD569", "\uB2E4\uC591\uD55C \uC74C\uC131", "\uAC04\uB2E8\uD55C UI"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD488\uC9C8 \uD3B8\uCC28", "\uB192\uC740 \uAC00\uACA9"],
        features: ["\uC74C\uC131 \uC0DD\uC131", "\uBE44\uB514\uC624 \uC81C\uC791", "\uC790\uB9C9"],
        url: "https://lovo.ai",
        iconCategory: "microphone"
      },
      {
        name: "Narakeet",
        company: "Narakeet",
        description: "PowerPoint\uC5D0\uC11C \uBE44\uB514\uC624\uB85C \uBCC0\uD658\uD558\uB294 \uC74C\uC131 \uB3C4\uAD6C",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 75,
        pros: ["PowerPoint \uD1B5\uD569", "\uAC04\uB2E8\uD55C \uC0AC\uC6A9", "\uBB34\uB8CC \uCCB4\uD5D8"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD488\uC9C8 \uC81C\uD55C", "\uB2E8\uC21C\uD55C UI"],
        features: ["\uD504\uB808\uC820\uD14C\uC774\uC158 \uC74C\uC131", "\uBE44\uB514\uC624 \uBCC0\uD658", "\uC790\uB9C9"],
        url: "https://narakeet.com",
        iconCategory: "microphone"
      },
      // 코딩 AI (8개)
      {
        name: "GitHub Copilot",
        company: "GitHub",
        description: "AI \uAE30\uBC18 \uCF54\uB4DC \uC790\uB3D9\uC644\uC131 \uBC0F \uC0DD\uC131 \uB3C4\uAD6C",
        category: "\uCF54\uB529",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 88,
        pros: ["\uBE60\uB978 \uCF54\uB529", "\uB2E4\uC591\uD55C \uC5B8\uC5B4", "IDE \uD1B5\uD569"],
        cons: ["\uAD6C\uB3C5 \uD544\uC218", "\uC758\uC874\uC131 \uC99D\uAC00", "\uBCF4\uC548 \uC6B0\uB824"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uBC84\uADF8 \uC218\uC815", "\uD14C\uC2A4\uD2B8 \uC0DD\uC131"],
        url: "https://github.com/features/copilot",
        iconCategory: "code"
      },
      {
        name: "Cursor",
        company: "Anysphere",
        description: "AI \uAE30\uBC18 \uCF54\uB4DC \uC5D0\uB514\uD130",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 91,
        pros: ["\uC9C1\uAD00\uC801\uC778 AI", "\uBE60\uB978 \uD3B8\uC9D1", "\uC790\uC5F0\uC5B4 \uBA85\uB839"],
        cons: ["\uC0C8\uB85C\uC6B4 \uD234", "\uC81C\uD55C\uB41C \uD655\uC7A5", "\uD559\uC2B5 \uD544\uC694"],
        features: ["AI \uD3B8\uC9D1", "\uC790\uC5F0\uC5B4 \uCF54\uB529", "\uB9AC\uD329\uD1A0\uB9C1"],
        url: "https://cursor.sh",
        iconCategory: "code"
      },
      {
        name: "Tabnine",
        company: "Tabnine",
        description: "AI \uCF54\uB4DC \uC790\uB3D9\uC644\uC131 \uC5B4\uC2DC\uC2A4\uD134\uD2B8",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "1.2M+",
        rating: 85,
        pros: ["\uB2E4\uC591\uD55C IDE", "\uB85C\uCEEC \uC2E4\uD589", "\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB290\uB9B0 \uBC18\uC751", "\uC124\uC815 \uBCF5\uC7A1"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uB85C\uCEEC AI", "\uD300 \uD559\uC2B5"],
        url: "https://tabnine.com",
        iconCategory: "code"
      },
      {
        name: "Codeium",
        company: "Codeium",
        description: "\uBB34\uB8CC AI \uCF54\uB529 \uC5B4\uC2DC\uC2A4\uD134\uD2B8",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 83,
        pros: ["\uC644\uC804 \uBB34\uB8CC", "\uBE60\uB978 \uC18D\uB3C4", "\uB2E4\uC591\uD55C \uC5B8\uC5B4"],
        cons: ["\uC0C1\uB300\uC801\uC73C\uB85C \uC0C8\uB85C\uC6C0", "\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD488\uC9C8 \uD3B8\uCC28"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uAC80\uC0C9", "\uCC44\uD305"],
        url: "https://codeium.com",
        iconCategory: "code"
      },
      {
        name: "Amazon CodeWhisperer",
        company: "Amazon",
        description: "AWS \uD1B5\uD569 AI \uCF54\uB529 \uB3C4\uAD6C",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 79,
        pros: ["AWS \uD1B5\uD569", "\uBCF4\uC548 \uC2A4\uCE94", "\uBB34\uB8CC \uAC1C\uC778\uC6A9"],
        cons: ["AWS \uD3B8\uD5A5", "\uC81C\uD55C\uB41C \uC5B8\uC5B4", "\uBCF5\uC7A1\uD55C \uC124\uC815"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uBCF4\uC548 \uC2A4\uCE94", "AWS \uD1B5\uD569"],
        url: "https://aws.amazon.com/codewhisperer",
        iconCategory: "code"
      },
      {
        name: "Replit Ghostwriter",
        company: "Replit",
        description: "\uC628\uB77C\uC778 IDE \uD1B5\uD569 AI \uCF54\uB529 \uB3C4\uAD6C",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 81,
        pros: ["\uD074\uB77C\uC6B0\uB4DC \uAE30\uBC18", "\uD611\uC5C5 \uAE30\uB2A5", "\uC989\uC2DC \uC2E4\uD589"],
        cons: ["\uC778\uD130\uB137 \uD544\uC218", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uC131\uB2A5 \uC81C\uD55C"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uC0DD\uC131", "\uC124\uBA85"],
        url: "https://replit.com",
        iconCategory: "code"
      },
      {
        name: "Sourcegraph Cody",
        company: "Sourcegraph",
        description: "\uCF54\uB4DC\uBCA0\uC774\uC2A4 \uC774\uD574\uB97C \uC704\uD55C AI \uC5B4\uC2DC\uC2A4\uD134\uD2B8",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "300K+",
        rating: 82,
        pros: ["\uCF54\uB4DC\uBCA0\uC774\uC2A4 \uBD84\uC11D", "\uCEE8\uD14D\uC2A4\uD2B8 \uC774\uD574", "\uC815\uD655\uD55C \uB2F5\uBCC0"],
        cons: ["\uBCF5\uC7A1\uD55C \uC124\uC815", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD070 \uD504\uB85C\uC81D\uD2B8 \uD544\uC694"],
        features: ["\uCF54\uB4DC \uBD84\uC11D", "\uC9C8\uBB38 \uB2F5\uBCC0", "\uB9AC\uD329\uD1A0\uB9C1"],
        url: "https://sourcegraph.com/cody",
        iconCategory: "code"
      },
      {
        name: "Kodezi",
        company: "Kodezi",
        description: "\uCF54\uB4DC \uCD5C\uC801\uD654 \uBC0F \uB514\uBC84\uAE45 AI",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "200K+",
        rating: 76,
        pros: ["\uCF54\uB4DC \uCD5C\uC801\uD654", "\uBC84\uADF8 \uC218\uC815", "\uC124\uBA85 \uC81C\uACF5"],
        cons: ["\uC81C\uD55C\uB41C \uC5B8\uC5B4", "\uD488\uC9C8 \uD3B8\uCC28", "\uB290\uB9B0 \uCC98\uB9AC"],
        features: ["\uCF54\uB4DC \uCD5C\uC801\uD654", "\uBC84\uADF8 \uC218\uC815", "\uC131\uB2A5 \uAC1C\uC120"],
        url: "https://kodezi.com",
        iconCategory: "code"
      },
      // 음악 생성 AI (8개)
      {
        name: "Suno AI",
        company: "Suno",
        description: "\uD14D\uC2A4\uD2B8\uB85C \uC644\uC804\uD55C \uB178\uB798 \uC0DD\uC131",
        descriptionEn: "Generate complete songs from text",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 92,
        pros: ["\uAC00\uC0AC \uC0DD\uC131", "\uBA5C\uB85C\uB514 \uC0DD\uC131", "\uBCF4\uCEEC \uD569\uC131"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uAE34 \uCC98\uB9AC \uC2DC\uAC04", "\uC800\uC791\uAD8C \uC6B0\uB824"],
        prosEn: ["Lyric generation", "Melody generation", "Vocal synthesis"],
        consEn: ["Limited free tier", "Long processing time", "Copyright concerns"],
        features: ["\uAC00\uC0AC \uC0DD\uC131", "\uBA5C\uB85C\uB514 \uC0DD\uC131", "\uBCF4\uCEEC \uD569\uC131", "\uB2E4\uC591\uD55C \uC7A5\uB974"],
        url: "https://suno.ai",
        iconCategory: "music"
      },
      {
        name: "Udio",
        company: "Udio",
        description: "\uACE0\uD488\uC9C8 AI \uC74C\uC545 \uC0DD\uC131 \uD50C\uB7AB\uD3FC",
        descriptionEn: "High-quality AI music generation platform",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 90,
        pros: ["\uACE0\uD488\uC9C8 \uCD9C\uB825", "\uC2A4\uD0C0\uC77C \uBBF9\uC2F1", "\uBCF4\uCEEC \uC0DD\uC131"],
        cons: ["\uBCA0\uD0C0 \uC0C1\uD0DC", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB300\uAE30 \uC2DC\uAC04"],
        prosEn: ["High-quality output", "Style mixing", "Vocal generation"],
        consEn: ["Beta state", "Limited free tier", "Wait times"],
        features: ["\uC74C\uC545 \uC0DD\uC131", "\uC2A4\uD0C0\uC77C \uBBF9\uC2F1", "\uBCF4\uCEEC \uC0DD\uC131"],
        url: "https://udio.com",
        iconCategory: "music"
      },
      {
        name: "Mubert",
        company: "Mubert",
        description: "\uC2E4\uC2DC\uAC04 AI \uC74C\uC545 \uC2A4\uD2B8\uB9AC\uBC0D",
        descriptionEn: "Real-time AI music streaming",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["\uC2E4\uC2DC\uAC04 \uC0DD\uC131", "\uBD84\uC704\uAE30\uBCC4 \uC74C\uC545", "API \uC81C\uACF5"],
        cons: ["\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uBC18\uBCF5\uC801 \uD328\uD134", "\uC800\uC791\uAD8C \uBD88\uBD84\uBA85"],
        prosEn: ["Real-time generation", "Mood-based music", "API available"],
        consEn: ["Limited customization", "Repetitive patterns", "Copyright unclear"],
        features: ["\uC2E4\uC2DC\uAC04 \uC0DD\uC131", "\uBD84\uC704\uAE30\uBCC4 \uC74C\uC545", "\uC2A4\uD2B8\uB9AC\uBC0D", "API"],
        url: "https://mubert.com",
        iconCategory: "music"
      },
      {
        name: "AIVA",
        company: "AIVA Technologies",
        description: "\uD074\uB798\uC2DD \uC74C\uC545 \uC791\uACE1 AI",
        descriptionEn: "AI classical music composer",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 86,
        pros: ["\uD074\uB798\uC2DD \uC804\uBB38", "\uC624\uCF00\uC2A4\uD2B8\uB77C", "MIDI \uC0DD\uC131"],
        cons: ["\uC7A5\uB974 \uC81C\uD55C", "\uBCF5\uC7A1\uD55C UI", "\uB192\uC740 \uD559\uC2B5 \uACE1\uC120"],
        prosEn: ["Classical specialization", "Orchestra", "MIDI generation"],
        consEn: ["Genre limitation", "Complex UI", "High learning curve"],
        features: ["\uD074\uB798\uC2DD \uC791\uACE1", "\uC624\uCF00\uC2A4\uD2B8\uB77C", "MIDI \uC0DD\uC131"],
        url: "https://aiva.ai",
        iconCategory: "music"
      },
      {
        name: "Soundraw",
        company: "Soundraw",
        description: "\uB85C\uC5F4\uD2F0 \uD504\uB9AC AI \uC74C\uC545 \uC0DD\uC131",
        descriptionEn: "Royalty-free AI music generation",
        category: "\uC74C\uC545",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 82,
        pros: ["\uB85C\uC5F4\uD2F0 \uD504\uB9AC", "\uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uC0C1\uC5C5\uC801 \uC0AC\uC6A9"],
        cons: ["\uC720\uB8CC \uC804\uC6A9", "\uC81C\uD55C\uB41C \uC7A5\uB974", "\uB2E8\uC870\uB85C\uC6B4 \uACB0\uACFC"],
        prosEn: ["Royalty-free", "Customization", "Commercial use"],
        consEn: ["Paid only", "Limited genres", "Monotonous results"],
        features: ["\uB85C\uC5F4\uD2F0 \uD504\uB9AC", "\uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uC7A5\uB974 \uC120\uD0DD"],
        url: "https://soundraw.io",
        iconCategory: "music"
      },
      {
        name: "Boomy",
        company: "Boomy",
        description: "\uC26C\uC6B4 AI \uC74C\uC545 \uC81C\uC791 \uBC0F \uC218\uC775\uD654",
        descriptionEn: "Easy AI music creation and monetization",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 80,
        pros: ["\uAC04\uD3B8 \uC81C\uC791", "\uC218\uC775\uD654", "\uD50C\uB808\uC774\uB9AC\uC2A4\uD2B8"],
        cons: ["\uD488\uC9C8 \uC81C\uD55C", "\uCC3D\uC758\uC131 \uBD80\uC871", "\uC218\uC775 \uBD84\uBC30"],
        prosEn: ["Easy creation", "Monetization", "Playlists"],
        consEn: ["Quality limitations", "Lack of creativity", "Revenue sharing"],
        features: ["\uAC04\uD3B8 \uC81C\uC791", "\uC218\uC775\uD654", "\uD50C\uB808\uC774\uB9AC\uC2A4\uD2B8"],
        url: "https://boomy.com",
        iconCategory: "music"
      },
      {
        name: "Amper Music",
        company: "Shutterstock",
        description: "\uCF58\uD150\uCE20\uC6A9 AI \uC74C\uC545 \uC0DD\uC131",
        descriptionEn: "AI music generation for content",
        category: "\uC74C\uC545",
        pricing: "paid",
        monthlyUsers: "800K+",
        rating: 84,
        pros: ["\uCF58\uD150\uCE20 \uD2B9\uD654", "\uBD84\uC704\uAE30 \uC870\uC808", "\uAE38\uC774 \uC870\uC808"],
        cons: ["\uAD6C\uB3C5 \uD544\uC694", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C \uAC00\uACA9"],
        prosEn: ["Content-focused", "Mood control", "Length control"],
        consEn: ["Subscription required", "Limited free", "Complex pricing"],
        features: ["\uCF58\uD150\uCE20 \uC74C\uC545", "\uBD84\uC704\uAE30 \uC870\uC808", "\uAE38\uC774 \uC870\uC808"],
        url: "https://ampermusic.com",
        iconCategory: "music"
      },
      {
        name: "Loudly",
        company: "Loudly",
        description: "\uD06C\uB9AC\uC5D0\uC774\uD130\uB97C \uC704\uD55C AI \uC74C\uC545",
        descriptionEn: "AI music for creators",
        category: "\uC74C\uC545",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 82,
        pros: ["\uD06C\uB9AC\uC5D0\uC774\uD130 \uD2B9\uD654", "\uBD84\uC704\uAE30\uBCC4", "\uB77C\uC774\uC13C\uC2A4"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD488\uC9C8 \uD3B8\uCC28", "\uB290\uB9B0 \uC0DD\uC131"],
        prosEn: ["Creator-focused", "Mood-based", "Licensing"],
        consEn: ["Limited free", "Quality variance", "Slow generation"],
        features: ["\uD06C\uB9AC\uC5D0\uC774\uD130 \uD2B9\uD654", "\uBD84\uC704\uAE30\uBCC4", "\uB77C\uC774\uC13C\uC2A4"],
        url: "https://loudly.com",
        iconCategory: "music"
      },
      // 추가 텍스트 AI (30개 더)
      {
        name: "Copy.ai",
        company: "Copy.ai",
        description: "AI \uCE74\uD53C\uB77C\uC774\uD305 \uB3C4\uAD6C",
        descriptionEn: "AI copywriting tool",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["\uB2E4\uC591\uD55C \uD15C\uD50C\uB9BF", "\uBE60\uB978 \uC0DD\uC131", "\uC5EC\uB7EC \uC5B8\uC5B4"],
        cons: ["\uCC3D\uC758\uC131 \uBD80\uC871", "\uBC18\uBCF5\uC801", "\uD488\uC9C8 \uD3B8\uCC28"],
        prosEn: ["Various templates", "Fast generation", "Multiple languages"],
        consEn: ["Lack of creativity", "Repetitive", "Quality variance"],
        features: ["\uCE74\uD53C\uB77C\uC774\uD305", "\uC774\uBA54\uC77C", "\uC18C\uC15C\uBBF8\uB514\uC5B4", "\uBE14\uB85C\uADF8"],
        url: "https://copy.ai",
        iconCategory: "text"
      },
      {
        name: "Writesonic",
        company: "Writesonic",
        description: "AI \uAE00\uC4F0\uAE30 \uC5B4\uC2DC\uC2A4\uD134\uD2B8",
        descriptionEn: "AI writing assistant",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 83,
        pros: ["SEO \uCD5C\uC801\uD654", "\uB2E4\uC591\uD55C \uD3EC\uB9F7", "\uC2E4\uC2DC\uAC04 \uD3B8\uC9D1"],
        cons: ["\uC720\uB8CC \uC81C\uD55C", "\uBCF5\uC7A1\uD55C UI", "\uB290\uB9B0 \uB85C\uB529"],
        prosEn: ["SEO optimization", "Various formats", "Real-time editing"],
        consEn: ["Premium limitations", "Complex UI", "Slow loading"],
        features: ["SEO \uAE00\uC4F0\uAE30", "\uAD11\uACE0 \uCE74\uD53C", "\uC774\uBA54\uC77C", "\uAE30\uC0AC"],
        url: "https://writesonic.com",
        iconCategory: "text"
      },
      {
        name: "Rytr",
        company: "Rytr",
        description: "\uAC04\uD3B8\uD55C AI \uCF58\uD150\uCE20 \uC0DD\uC131\uAE30",
        descriptionEn: "Simple AI content generator",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 81,
        pros: ["\uC800\uB834\uD55C \uAC00\uACA9", "\uAC04\uB2E8\uD55C UI", "\uBE60\uB978 \uC18D\uB3C4"],
        cons: ["\uC81C\uD55C\uB41C \uCC3D\uC758\uC131", "\uAE30\uBCF8\uC801 \uAE30\uB2A5", "\uC9E7\uC740 \uD14D\uC2A4\uD2B8"],
        prosEn: ["Affordable pricing", "Simple UI", "Fast speed"],
        consEn: ["Limited creativity", "Basic features", "Short text"],
        features: ["\uBE14\uB85C\uADF8", "\uC774\uBA54\uC77C", "\uAD11\uACE0", "\uC18C\uC15C\uBBF8\uB514\uC5B4"],
        url: "https://rytr.me",
        iconCategory: "text"
      },
      {
        name: "Hypotenuse AI",
        company: "Hypotenuse AI",
        description: "\uC81C\uD488 \uC124\uBA85 \uC804\uBB38 AI",
        descriptionEn: "Product description specialist AI",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 84,
        pros: ["\uC81C\uD488 \uD2B9\uD654", "\uB300\uB7C9 \uC0DD\uC131", "API \uC81C\uACF5"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uC81C\uD55C\uB41C \uC6A9\uB3C4", "\uBCF5\uC7A1\uD55C \uC124\uC815"],
        prosEn: ["Product specialized", "Bulk generation", "API available"],
        consEn: ["High price", "Limited use", "Complex setup"],
        features: ["\uC81C\uD488 \uC124\uBA85", "SEO", "\uB300\uB7C9 \uC0DD\uC131", "API"],
        url: "https://hypotenuse.ai",
        iconCategory: "text"
      },
      {
        name: "Peppertype.ai",
        company: "Peppertype",
        description: "\uB9C8\uCF00\uD305 \uCF58\uD150\uCE20 AI",
        descriptionEn: "Marketing content AI",
        category: "\uD14D\uC2A4\uD2B8",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 82,
        pros: ["\uB9C8\uCF00\uD305 \uD2B9\uD654", "\uBE0C\uB79C\uB4DC \uC77C\uAD00\uC131", "\uD611\uC5C5 \uAE30\uB2A5"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD559\uC2B5 \uACE1\uC120", "\uB290\uB9B0 \uC0DD\uC131"],
        prosEn: ["Marketing focused", "Brand consistency", "Collaboration"],
        consEn: ["Limited free", "Learning curve", "Slow generation"],
        features: ["\uB9C8\uCF00\uD305", "\uBE0C\uB79C\uB4DC \uBCF4\uC774\uC2A4", "\uD611\uC5C5", "\uD15C\uD50C\uB9BF"],
        url: "https://peppertype.ai",
        iconCategory: "text"
      },
      // 추가 이미지 AI (25개 더)
      {
        name: "Stable Diffusion",
        company: "Stability AI",
        description: "\uC624\uD508\uC18C\uC2A4 \uC774\uBBF8\uC9C0 \uC0DD\uC131 AI",
        descriptionEn: "Open-source image generation AI",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "free",
        monthlyUsers: "10M+",
        rating: 88,
        pros: ["\uC624\uD508\uC18C\uC2A4", "\uB192\uC740 \uC790\uC720\uB3C4", "\uCEE4\uBBA4\uB2C8\uD2F0"],
        cons: ["\uAE30\uC220\uC801 \uB09C\uC774\uB3C4", "\uC124\uC815 \uBCF5\uC7A1", "\uD558\uB4DC\uC6E8\uC5B4 \uC694\uAD6C"],
        prosEn: ["Open source", "High flexibility", "Community"],
        consEn: ["Technical difficulty", "Complex setup", "Hardware requirements"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uC2A4\uD0C0\uC77C \uBCC0\uD658", "\uC778\uD398\uC778\uD305", "\uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5"],
        url: "https://stability.ai",
        iconCategory: "image"
      },
      {
        name: "Leonardo.ai",
        company: "Leonardo.ai",
        description: "\uAC8C\uC784 \uC544\uD2B8 \uD2B9\uD654 AI",
        descriptionEn: "Game art specialized AI",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 86,
        pros: ["\uAC8C\uC784 \uD2B9\uD654", "\uC77C\uAD00\uB41C \uC2A4\uD0C0\uC77C", "3D \uC9C0\uC6D0"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uAC8C\uC784 \uD3B8\uD5A5", "\uBCF5\uC7A1\uD55C UI"],
        prosEn: ["Game focused", "Consistent style", "3D support"],
        consEn: ["Limited free", "Game biased", "Complex UI"],
        features: ["\uAC8C\uC784 \uC544\uD2B8", "\uCE90\uB9AD\uD130", "\uD658\uACBD", "3D"],
        url: "https://leonardo.ai",
        iconCategory: "image"
      },
      {
        name: "Firefly",
        company: "Adobe",
        description: "\uC5B4\uB3C4\uBE44 \uCC3D\uC758 AI",
        descriptionEn: "Adobe creative AI",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 87,
        pros: ["\uC5B4\uB3C4\uBE44 \uD1B5\uD569", "\uC0C1\uC5C5\uC801 \uC548\uC804", "\uACE0\uD488\uC9C8"],
        cons: ["\uAD6C\uB3C5 \uD544\uC694", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C \uB77C\uC774\uC13C\uC2A4"],
        prosEn: ["Adobe integration", "Commercial safe", "High quality"],
        consEn: ["Subscription required", "Limited free", "Complex licensing"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uD14D\uC2A4\uD2B8 \uD6A8\uACFC", "\uBCA1\uD130", "\uD1B5\uD569"],
        url: "https://firefly.adobe.com",
        iconCategory: "image"
      },
      {
        name: "BlueWillow",
        company: "BlueWillow",
        description: "\uBB34\uB8CC AI \uC774\uBBF8\uC9C0 \uC0DD\uC131\uAE30",
        descriptionEn: "Free AI image generator",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "free",
        monthlyUsers: "2M+",
        rating: 79,
        pros: ["\uC644\uC804 \uBB34\uB8CC", "Discord \uAE30\uBC18", "\uCEE4\uBBA4\uB2C8\uD2F0"],
        cons: ["\uD488\uC9C8 \uC81C\uD55C", "Discord \uD544\uC218", "\uB290\uB9B0 \uC0DD\uC131"],
        prosEn: ["Completely free", "Discord based", "Community"],
        consEn: ["Quality limitations", "Discord required", "Slow generation"],
        features: ["\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uC2A4\uD0C0\uC77C \uB2E4\uC591", "\uCEE4\uBBA4\uB2C8\uD2F0", "\uBB34\uB8CC"],
        url: "https://bluewillow.ai",
        iconCategory: "image"
      },
      {
        name: "Lexica",
        company: "Lexica",
        description: "Stable Diffusion \uAC80\uC0C9 \uC5D4\uC9C4",
        descriptionEn: "Stable Diffusion search engine",
        category: "\uC774\uBBF8\uC9C0",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 82,
        pros: ["\uD504\uB86C\uD504\uD2B8 \uAC80\uC0C9", "\uC601\uAC10 \uC81C\uACF5", "\uBB34\uB8CC \uC0DD\uC131"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD488\uC9C8 \uD3B8\uCC28", "\uB290\uB9B0 \uC778\uD130\uD398\uC774\uC2A4"],
        prosEn: ["Prompt search", "Inspiration", "Free generation"],
        consEn: ["Limited features", "Quality variance", "Slow interface"],
        features: ["\uD504\uB86C\uD504\uD2B8 \uAC80\uC0C9", "\uC774\uBBF8\uC9C0 \uC0DD\uC131", "\uC601\uAC10", "\uAC24\uB7EC\uB9AC"],
        url: "https://lexica.art",
        iconCategory: "image"
      },
      // 추가 영상 AI (20개 더)
      {
        name: "Pika Labs",
        company: "Pika Labs",
        description: "\uD14D\uC2A4\uD2B8\uB97C \uC601\uC0C1\uC73C\uB85C \uBCC0\uD658",
        descriptionEn: "Text to video generation",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["\uC26C\uC6B4 \uC0AC\uC6A9", "\uBE60\uB978 \uC0DD\uC131", "\uB2E4\uC591\uD55C \uC2A4\uD0C0\uC77C"],
        cons: ["\uC9E7\uC740 \uC601\uC0C1", "\uD488\uC9C8 \uC81C\uD55C", "\uC6CC\uD130\uB9C8\uD06C"],
        prosEn: ["Easy to use", "Fast generation", "Various styles"],
        consEn: ["Short videos", "Quality limitations", "Watermark"],
        features: ["\uD14D\uC2A4\uD2B8\u2192\uC601\uC0C1", "\uC2A4\uD0C0\uC77C \uBCC0\uD658", "\uC560\uB2C8\uBA54\uC774\uC158", "\uD3B8\uC9D1"],
        url: "https://pika.art",
        iconCategory: "video"
      },
      {
        name: "Synthesia",
        company: "Synthesia",
        description: "AI \uC544\uBC14\uD0C0 \uC601\uC0C1 \uC81C\uC791",
        descriptionEn: "AI avatar video creation",
        category: "\uC601\uC0C1",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 86,
        pros: ["\uB9AC\uC5BC \uC544\uBC14\uD0C0", "\uB2E4\uAD6D\uC5B4", "\uC804\uBB38\uC801"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uAD6C\uB3C5 \uD544\uC218"],
        prosEn: ["Realistic avatars", "Multilingual", "Professional"],
        consEn: ["High cost", "Limited customization", "Subscription required"],
        features: ["AI \uC544\uBC14\uD0C0", "\uB2E4\uAD6D\uC5B4", "\uD504\uB808\uC820\uD14C\uC774\uC158", "\uAD50\uC721"],
        url: "https://synthesia.io",
        iconCategory: "video"
      },
      {
        name: "D-ID",
        company: "D-ID",
        description: "\uC0AC\uC9C4\uC744 \uB9D0\uD558\uB294 \uC601\uC0C1\uC73C\uB85C",
        descriptionEn: "Turn photos into talking videos",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 83,
        pros: ["\uC0AC\uC9C4 \uD65C\uC6A9", "\uB9AC\uC5BC\uD55C \uB9BD\uC2F1\uD06C", "\uBE60\uB978 \uCC98\uB9AC"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uC5BC\uAD74\uB9CC \uAC00\uB2A5", "\uBC30\uACBD \uC81C\uD55C"],
        prosEn: ["Photo utilization", "Realistic lip sync", "Fast processing"],
        consEn: ["Limited free", "Face only", "Background limitations"],
        features: ["\uC0AC\uC9C4\u2192\uC601\uC0C1", "\uB9BD\uC2F1\uD06C", "\uC544\uBC14\uD0C0", "\uD504\uB808\uC820\uD14C\uC774\uC158"],
        url: "https://d-id.com",
        iconCategory: "video"
      },
      {
        name: "InVideo",
        company: "InVideo",
        description: "AI \uC601\uC0C1 \uD3B8\uC9D1 \uD50C\uB7AB\uD3FC",
        descriptionEn: "AI video editing platform",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 85,
        pros: ["\uD15C\uD50C\uB9BF \uD48D\uBD80", "\uC26C\uC6B4 \uD3B8\uC9D1", "\uC790\uB3D9 \uC790\uB9C9"],
        cons: ["\uC6CC\uD130\uB9C8\uD06C", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB290\uB9B0 \uB80C\uB354\uB9C1"],
        prosEn: ["Rich templates", "Easy editing", "Auto subtitles"],
        consEn: ["Watermark", "Limited free", "Slow rendering"],
        features: ["\uC601\uC0C1 \uD3B8\uC9D1", "\uD15C\uD50C\uB9BF", "\uC790\uB9C9", "\uC74C\uC545"],
        url: "https://invideo.io",
        iconCategory: "video"
      },
      {
        name: "Fliki",
        company: "Fliki",
        description: "\uD14D\uC2A4\uD2B8\uB97C AI \uC74C\uC131 \uC601\uC0C1\uC73C\uB85C",
        descriptionEn: "Text to AI voice video",
        category: "\uC601\uC0C1",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 82,
        pros: ["AI \uC74C\uC131", "\uBE60\uB978 \uC81C\uC791", "\uB2E4\uAD6D\uC5B4"],
        cons: ["\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uC74C\uC131 \uD488\uC9C8", "\uD15C\uD50C\uB9BF \uC758\uC874"],
        prosEn: ["AI voice", "Fast creation", "Multilingual"],
        consEn: ["Limited customization", "Voice quality", "Template dependent"],
        features: ["AI \uC74C\uC131", "\uC790\uB3D9 \uC601\uC0C1", "\uB2E4\uAD6D\uC5B4", "\uD15C\uD50C\uB9BF"],
        url: "https://fliki.ai",
        iconCategory: "video"
      },
      // 추가 음성 AI (15개 더)
      {
        name: "Murf",
        company: "Murf",
        description: "AI \uC74C\uC131 \uC0DD\uC131 \uD50C\uB7AB\uD3FC",
        descriptionEn: "AI voice generation platform",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "1M+",
        rating: 85,
        pros: ["\uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uC74C\uC131", "\uB2E4\uC591\uD55C \uBAA9\uC18C\uB9AC", "\uAC10\uC815 \uD45C\uD604"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB192\uC740 \uAC00\uACA9", "\uD3B8\uC9D1 \uC81C\uD55C"],
        prosEn: ["Natural voice", "Various voices", "Emotion expression"],
        consEn: ["Limited free", "High price", "Editing limitations"],
        features: ["AI \uC74C\uC131", "\uAC10\uC815", "\uB2E4\uAD6D\uC5B4", "\uD3B8\uC9D1"],
        url: "https://murf.ai",
        iconCategory: "voice"
      },
      {
        name: "Speechify",
        company: "Speechify",
        description: "\uD14D\uC2A4\uD2B8 \uC77D\uAE30 AI",
        descriptionEn: "Text-to-speech AI",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 83,
        pros: ["\uBE60\uB978 \uC77D\uAE30", "\uB2E4\uC591\uD55C \uC18D\uB3C4", "\uBAA8\uBC14\uC77C \uC571"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uC74C\uC131 \uD488\uC9C8", "\uC5B8\uC5B4 \uC81C\uD55C"],
        prosEn: ["Fast reading", "Various speeds", "Mobile app"],
        consEn: ["Limited free", "Voice quality", "Language limitations"],
        features: ["\uD14D\uC2A4\uD2B8 \uC77D\uAE30", "\uC18D\uB3C4 \uC870\uC808", "\uBAA8\uBC14\uC77C", "\uC624\uB514\uC624\uBD81"],
        url: "https://speechify.com",
        iconCategory: "voice"
      },
      {
        name: "Resemble AI",
        company: "Resemble AI",
        description: "\uC74C\uC131 \uBCF5\uC81C AI",
        descriptionEn: "Voice cloning AI",
        category: "\uC74C\uC131",
        pricing: "paid",
        monthlyUsers: "300K+",
        rating: 87,
        pros: ["\uC815\uD655\uD55C \uBCF5\uC81C", "\uC2E4\uC2DC\uAC04", "\uAC10\uC815 \uD45C\uD604"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uC724\uB9AC\uC801 \uC6B0\uB824", "\uBCF5\uC7A1\uD55C \uC124\uC815"],
        prosEn: ["Accurate cloning", "Real-time", "Emotion expression"],
        consEn: ["High cost", "Ethical concerns", "Complex setup"],
        features: ["\uC74C\uC131 \uBCF5\uC81C", "\uC2E4\uC2DC\uAC04", "\uAC10\uC815", "API"],
        url: "https://resemble.ai",
        iconCategory: "voice"
      },
      {
        name: "Descript",
        company: "Descript",
        description: "\uC624\uB514\uC624/\uC601\uC0C1 \uD3B8\uC9D1 AI",
        descriptionEn: "Audio/video editing AI",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 86,
        pros: ["\uD14D\uC2A4\uD2B8 \uD3B8\uC9D1", "\uC74C\uC131 \uBCF5\uC81C", "\uD611\uC5C5"],
        cons: ["\uD559\uC2B5 \uACE1\uC120", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB290\uB9B0 \uCC98\uB9AC"],
        prosEn: ["Text editing", "Voice cloning", "Collaboration"],
        consEn: ["Learning curve", "Limited free", "Slow processing"],
        features: ["\uD14D\uC2A4\uD2B8 \uD3B8\uC9D1", "\uC74C\uC131 \uBCF5\uC81C", "\uD611\uC5C5", "\uD31F\uCE90\uC2A4\uD2B8"],
        url: "https://descript.com",
        iconCategory: "voice"
      },
      {
        name: "Lovo",
        company: "Lovo",
        description: "AI \uC74C\uC131 \uBC0F \uBE44\uB514\uC624",
        descriptionEn: "AI voice and video",
        category: "\uC74C\uC131",
        pricing: "freemium",
        monthlyUsers: "500K+",
        rating: 84,
        pros: ["AI \uC544\uBC14\uD0C0", "\uC74C\uC131 \uB2E4\uC591", "\uBE44\uB514\uC624 \uD1B5\uD569"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD488\uC9C8 \uD3B8\uCC28", "\uBCF5\uC7A1\uD55C UI"],
        prosEn: ["AI avatars", "Voice variety", "Video integration"],
        consEn: ["Limited free", "Quality variance", "Complex UI"],
        features: ["AI \uC74C\uC131", "\uC544\uBC14\uD0C0", "\uBE44\uB514\uC624", "\uB2E4\uAD6D\uC5B4"],
        url: "https://lovo.ai",
        iconCategory: "voice"
      },
      // 추가 코딩 AI (20개 더)
      {
        name: "Replit Ghostwriter",
        company: "Replit",
        description: "\uBE0C\uB77C\uC6B0\uC800 \uAE30\uBC18 \uCF54\uB529 AI",
        descriptionEn: "Browser-based coding AI",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["\uBE0C\uB77C\uC6B0\uC800 \uAE30\uBC18", "\uC2E4\uC2DC\uAC04 \uD611\uC5C5", "\uC790\uB3D9 \uBC30\uD3EC"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uC778\uD130\uB137 \uD544\uC694", "\uC131\uB2A5 \uC81C\uD55C"],
        prosEn: ["Browser-based", "Real-time collaboration", "Auto deployment"],
        consEn: ["Limited free", "Internet required", "Performance limitations"],
        features: ["\uCF54\uB4DC \uC644\uC131", "\uD611\uC5C5", "\uBC30\uD3EC", "\uBA40\uD2F0 \uC5B8\uC5B4"],
        url: "https://replit.com",
        iconCategory: "code"
      },
      {
        name: "Amazon CodeWhisperer",
        company: "Amazon",
        description: "AWS \uD1B5\uD569 \uCF54\uB529 AI",
        descriptionEn: "AWS integrated coding AI",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 84,
        pros: ["AWS \uD1B5\uD569", "\uBCF4\uC548 \uC2A4\uCE94", "\uBB34\uB8CC \uAC1C\uC778\uC6A9"],
        cons: ["AWS \uD3B8\uD5A5", "\uC81C\uD55C\uB41C \uC5B8\uC5B4", "\uBCF5\uC7A1\uD55C \uC124\uC815"],
        prosEn: ["AWS integration", "Security scan", "Free for personal"],
        consEn: ["AWS biased", "Limited languages", "Complex setup"],
        features: ["\uCF54\uB4DC \uC0DD\uC131", "\uBCF4\uC548 \uC2A4\uCE94", "AWS \uD1B5\uD569", "\uC790\uB3D9\uC644\uC131"],
        url: "https://aws.amazon.com/codewhisperer",
        iconCategory: "code"
      },
      {
        name: "Cursor",
        company: "Cursor",
        description: "AI \uB124\uC774\uD2F0\uBE0C \uCF54\uB4DC \uC5D0\uB514\uD130",
        descriptionEn: "AI-native code editor",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 88,
        pros: ["AI \uB124\uC774\uD2F0\uBE0C", "\uBE60\uB978 \uD3B8\uC9D1", "\uCEE8\uD14D\uC2A4\uD2B8 \uC774\uD574"],
        cons: ["\uC0C8\uB85C\uC6B4 \uB3C4\uAD6C", "\uD559\uC2B5 \uD544\uC694", "\uC81C\uD55C\uB41C \uD50C\uB7EC\uADF8\uC778"],
        prosEn: ["AI native", "Fast editing", "Context understanding"],
        consEn: ["New tool", "Learning required", "Limited plugins"],
        features: ["AI \uD3B8\uC9D1", "\uCEE8\uD14D\uC2A4\uD2B8", "\uBE60\uB978 \uC218\uC815", "\uB9AC\uD329\uD1A0\uB9C1"],
        url: "https://cursor.sh",
        iconCategory: "code"
      },
      {
        name: "Sourcegraph Cody",
        company: "Sourcegraph",
        description: "\uCF54\uB4DC\uBCA0\uC774\uC2A4 \uC774\uD574 AI",
        descriptionEn: "Codebase understanding AI",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "400K+",
        rating: 83,
        pros: ["\uCF54\uB4DC\uBCA0\uC774\uC2A4 \uBD84\uC11D", "\uCEE8\uD14D\uC2A4\uD2B8 \uAC80\uC0C9", "\uC5D4\uD130\uD504\uB77C\uC774\uC988"],
        cons: ["\uBCF5\uC7A1\uD55C \uC124\uC815", "\uB192\uC740 \uAC00\uACA9", "\uD559\uC2B5 \uACE1\uC120"],
        prosEn: ["Codebase analysis", "Context search", "Enterprise"],
        consEn: ["Complex setup", "High cost", "Learning curve"],
        features: ["\uCF54\uB4DC \uBD84\uC11D", "\uAC80\uC0C9", "\uC124\uBA85", "\uB9AC\uD329\uD1A0\uB9C1"],
        url: "https://sourcegraph.com/cody",
        iconCategory: "code"
      },
      {
        name: "Blackbox AI",
        company: "Blackbox",
        description: "\uCF54\uB4DC \uAC80\uC0C9 \uBC0F \uC0DD\uC131 AI",
        descriptionEn: "Code search and generation AI",
        category: "\uCF54\uB529",
        pricing: "freemium",
        monthlyUsers: "600K+",
        rating: 81,
        pros: ["\uCF54\uB4DC \uAC80\uC0C9", "\uB2E4\uC591\uD55C \uC5B8\uC5B4", "\uBE60\uB978 \uC751\uB2F5"],
        cons: ["\uD488\uC9C8 \uD3B8\uCC28", "\uC81C\uD55C\uB41C \uCEE8\uD14D\uC2A4\uD2B8", "\uAD11\uACE0"],
        prosEn: ["Code search", "Multiple languages", "Fast response"],
        consEn: ["Quality variance", "Limited context", "Ads"],
        features: ["\uCF54\uB4DC \uAC80\uC0C9", "\uC0DD\uC131", "\uC790\uB3D9\uC644\uC131", "\uC124\uBA85"],
        url: "https://blackbox.ai",
        iconCategory: "code"
      },
      // 새로운 카테고리들 추가
      // 데이터 분석 AI (25개)
      {
        name: "DataRobot",
        company: "DataRobot",
        description: "\uC790\uB3D9 \uBA38\uC2E0\uB7EC\uB2DD \uD50C\uB7AB\uD3FC",
        descriptionEn: "Automated machine learning platform",
        category: "\uB370\uC774\uD130\uBD84\uC11D",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 89,
        pros: ["\uC790\uB3D9 ML", "\uC5D4\uD130\uD504\uB77C\uC774\uC988", "\uB192\uC740 \uC815\uD655\uB3C4"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uBCF5\uC7A1\uD55C \uC778\uD130\uD398\uC774\uC2A4", "\uD559\uC2B5 \uD544\uC694"],
        prosEn: ["Auto ML", "Enterprise", "High accuracy"],
        consEn: ["High cost", "Complex interface", "Learning required"],
        features: ["\uC790\uB3D9 ML", "\uC608\uCE21 \uBAA8\uB378", "\uB370\uC774\uD130 \uBD84\uC11D", "\uC2DC\uAC01\uD654"],
        url: "https://datarobot.com",
        iconCategory: "analytics"
      },
      {
        name: "H2O.ai",
        company: "H2O.ai",
        description: "\uC624\uD508\uC18C\uC2A4 AI \uD50C\uB7AB\uD3FC",
        descriptionEn: "Open source AI platform",
        category: "\uB370\uC774\uD130\uBD84\uC11D",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 87,
        pros: ["\uC624\uD508\uC18C\uC2A4", "\uD655\uC7A5\uC131", "\uB2E4\uC591\uD55C \uC54C\uACE0\uB9AC\uC998"],
        cons: ["\uAE30\uC220\uC801 \uB09C\uC774\uB3C4", "\uBCF5\uC7A1\uD55C \uC124\uC815", "\uBB38\uC11C \uBD80\uC871"],
        prosEn: ["Open source", "Scalability", "Various algorithms"],
        consEn: ["Technical difficulty", "Complex setup", "Lack of documentation"],
        features: ["\uBA38\uC2E0\uB7EC\uB2DD", "\uB525\uB7EC\uB2DD", "\uB370\uC774\uD130 \uCC98\uB9AC", "\uC2DC\uAC01\uD654"],
        url: "https://h2o.ai",
        iconCategory: "analytics"
      },
      {
        name: "Tableau Prep",
        company: "Tableau",
        description: "\uB370\uC774\uD130 \uC900\uBE44 \uBC0F \uBD84\uC11D",
        descriptionEn: "Data preparation and analysis",
        category: "\uB370\uC774\uD130\uBD84\uC11D",
        pricing: "paid",
        monthlyUsers: "1.2M+",
        rating: 86,
        pros: ["\uC2DC\uAC01\uD654 \uAC15\uB825", "\uC9C1\uAD00\uC801 UI", "\uAE30\uC5C5 \uD45C\uC900"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uD559\uC2B5 \uACE1\uC120", "\uC131\uB2A5 \uC774\uC288"],
        prosEn: ["Powerful visualization", "Intuitive UI", "Enterprise standard"],
        consEn: ["High cost", "Learning curve", "Performance issues"],
        features: ["\uB370\uC774\uD130 \uC2DC\uAC01\uD654", "\uB300\uC2DC\uBCF4\uB4DC", "\uBD84\uC11D", "\uACF5\uC720"],
        url: "https://tableau.com",
        iconCategory: "analytics"
      },
      {
        name: "Power BI",
        company: "Microsoft",
        description: "\uBE44\uC988\uB2C8\uC2A4 \uC778\uD154\uB9AC\uC804\uC2A4 \uB3C4\uAD6C",
        descriptionEn: "Business intelligence tool",
        category: "\uB370\uC774\uD130\uBD84\uC11D",
        pricing: "paid",
        monthlyUsers: "2M+",
        rating: 85,
        pros: ["MS \uC0DD\uD0DC\uACC4", "\uC800\uB834\uD55C \uAC00\uACA9", "\uD074\uB77C\uC6B0\uB4DC \uD1B5\uD569"],
        cons: ["\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uBCF5\uC7A1\uD55C \uB77C\uC774\uC13C\uC2A4", "\uC131\uB2A5 \uC81C\uD55C"],
        prosEn: ["MS ecosystem", "Affordable", "Cloud integration"],
        consEn: ["Limited customization", "Complex licensing", "Performance limits"],
        features: ["\uB300\uC2DC\uBCF4\uB4DC", "\uB9AC\uD3EC\uD2B8", "\uB370\uC774\uD130 \uC5F0\uACB0", "\uD611\uC5C5"],
        url: "https://powerbi.microsoft.com",
        iconCategory: "analytics"
      },
      {
        name: "Qlik Sense",
        company: "Qlik",
        description: "\uC140\uD504\uC11C\uBE44\uC2A4 BI \uD50C\uB7AB\uD3FC",
        descriptionEn: "Self-service BI platform",
        category: "\uB370\uC774\uD130\uBD84\uC11D",
        pricing: "paid",
        monthlyUsers: "600K+",
        rating: 84,
        pros: ["\uC5F0\uAD00 \uBD84\uC11D", "\uC9C1\uAD00\uC801", "\uBAA8\uBC14\uC77C \uC9C0\uC6D0"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uBCF5\uC7A1\uD55C \uC124\uC815", "\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5"],
        prosEn: ["Associative analysis", "Intuitive", "Mobile support"],
        consEn: ["High cost", "Complex setup", "Limited customization"],
        features: ["\uC5F0\uAD00 \uBD84\uC11D", "\uB300\uC2DC\uBCF4\uB4DC", "\uBAA8\uBC14\uC77C", "\uD611\uC5C5"],
        url: "https://qlik.com",
        iconCategory: "analytics"
      },
      // 디자인 AI (20개)
      {
        name: "Canva AI",
        company: "Canva",
        description: "AI \uB514\uC790\uC778 \uC5B4\uC2DC\uC2A4\uD134\uD2B8",
        descriptionEn: "AI design assistant",
        category: "\uB514\uC790\uC778",
        pricing: "freemium",
        monthlyUsers: "8M+",
        rating: 88,
        pros: ["\uC26C\uC6B4 \uC0AC\uC6A9", "\uB2E4\uC591\uD55C \uD15C\uD50C\uB9BF", "\uD611\uC5C5 \uAE30\uB2A5"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uD15C\uD50C\uB9BF \uC758\uC874", "\uACE0\uAE09 \uAE30\uB2A5 \uBD80\uC871"],
        prosEn: ["Easy to use", "Various templates", "Collaboration"],
        consEn: ["Limited free", "Template dependent", "Lack of advanced features"],
        features: ["AI \uB514\uC790\uC778", "\uD15C\uD50C\uB9BF", "\uD611\uC5C5", "\uBE0C\uB79C\uB529"],
        url: "https://canva.com",
        iconCategory: "design"
      },
      {
        name: "Figma AI",
        company: "Figma",
        description: "\uD611\uC5C5 \uB514\uC790\uC778 \uB3C4\uAD6C",
        descriptionEn: "Collaborative design tool",
        category: "\uB514\uC790\uC778",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 91,
        pros: ["\uC2E4\uC2DC\uAC04 \uD611\uC5C5", "\uAC15\uB825\uD55C \uAE30\uB2A5", "\uD50C\uB7EC\uADF8\uC778 \uC0DD\uD0DC\uACC4"],
        cons: ["\uD559\uC2B5 \uACE1\uC120", "\uBCF5\uC7A1\uD55C UI", "\uC131\uB2A5"],
        prosEn: ["Real-time collaboration", "Powerful features", "Plugin ecosystem"],
        consEn: ["Learning curve", "Complex UI", "Performance"],
        features: ["UI/UX \uB514\uC790\uC778", "\uD504\uB85C\uD1A0\uD0C0\uC785", "\uD611\uC5C5", "\uD50C\uB7EC\uADF8\uC778"],
        url: "https://figma.com",
        iconCategory: "design"
      },
      {
        name: "Looka",
        company: "Looka",
        description: "AI \uB85C\uACE0 \uC0DD\uC131\uAE30",
        descriptionEn: "AI logo generator",
        category: "\uB514\uC790\uC778",
        pricing: "paid",
        monthlyUsers: "1M+",
        rating: 83,
        pros: ["\uBE60\uB978 \uB85C\uACE0 \uC0DD\uC131", "\uBE0C\uB79C\uB4DC \uD0A4\uD2B8", "\uB2E4\uC591\uD55C \uD3EC\uB9F7"],
        cons: ["\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uC720\uB8CC \uC804\uC6A9", "\uD3C9\uBC94\uD55C \uB514\uC790\uC778"],
        prosEn: ["Fast logo generation", "Brand kit", "Various formats"],
        consEn: ["Limited customization", "Paid only", "Generic designs"],
        features: ["\uB85C\uACE0 \uC0DD\uC131", "\uBE0C\uB79C\uB4DC \uD0A4\uD2B8", "\uBA85\uD568", "\uC6F9\uC0AC\uC774\uD2B8"],
        url: "https://looka.com",
        iconCategory: "design"
      },
      {
        name: "Khroma",
        company: "Khroma",
        description: "AI \uC0C9\uC0C1 \uD314\uB808\uD2B8 \uC0DD\uC131\uAE30",
        descriptionEn: "AI color palette generator",
        category: "\uB514\uC790\uC778",
        pricing: "freemium",
        monthlyUsers: "300K+",
        rating: 81,
        pros: ["\uAC1C\uC778\uD654\uB41C \uD314\uB808\uD2B8", "\uBB34\uD55C \uC870\uD569", "\uC0C9\uC0C1 \uAC80\uC0C9"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uB290\uB9B0 \uD559\uC2B5", "\uB2E8\uC21C\uD55C UI"],
        prosEn: ["Personalized palette", "Infinite combinations", "Color search"],
        consEn: ["Limited features", "Slow learning", "Simple UI"],
        features: ["\uC0C9\uC0C1 \uD314\uB808\uD2B8", "\uAC1C\uC778\uD654", "\uAC80\uC0C9", "\uC800\uC7A5"],
        url: "https://khroma.co",
        iconCategory: "design"
      },
      {
        name: "Logomaker",
        company: "Logomaker",
        description: "\uC628\uB77C\uC778 \uB85C\uACE0 \uC81C\uC791 \uB3C4\uAD6C",
        descriptionEn: "Online logo creation tool",
        category: "\uB514\uC790\uC778",
        pricing: "paid",
        monthlyUsers: "500K+",
        rating: 79,
        pros: ["\uAC04\uB2E8\uD55C \uC0AC\uC6A9", "\uC800\uB834\uD55C \uAC00\uACA9", "\uBE60\uB978 \uC81C\uC791"],
        cons: ["\uC81C\uD55C\uB41C \uC635\uC158", "\uD488\uC9C8 \uC81C\uD55C", "\uC720\uB8CC \uC804\uC6A9"],
        prosEn: ["Simple use", "Affordable", "Fast creation"],
        consEn: ["Limited options", "Quality limitations", "Paid only"],
        features: ["\uB85C\uACE0 \uC81C\uC791", "\uC544\uC774\uCF58", "\uD15C\uD50C\uB9BF", "\uD3B8\uC9D1"],
        url: "https://logomaker.com",
        iconCategory: "design"
      },
      // 마케팅 AI (15개)
      {
        name: "HubSpot AI",
        company: "HubSpot",
        description: "\uB9C8\uCF00\uD305 \uC790\uB3D9\uD654 \uD50C\uB7AB\uD3FC",
        descriptionEn: "Marketing automation platform",
        category: "\uB9C8\uCF00\uD305",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 87,
        pros: ["\uC62C\uC778\uC6D0 \uD50C\uB7AB\uD3FC", "CRM \uD1B5\uD569", "\uBB34\uB8CC \uC2DC\uC791"],
        cons: ["\uBCF5\uC7A1\uD55C \uC124\uC815", "\uB192\uC740 \uAC00\uACA9", "\uD559\uC2B5 \uACE1\uC120"],
        prosEn: ["All-in-one platform", "CRM integration", "Free start"],
        consEn: ["Complex setup", "High cost", "Learning curve"],
        features: ["\uB9C8\uCF00\uD305 \uC790\uB3D9\uD654", "CRM", "\uC774\uBA54\uC77C", "\uBD84\uC11D"],
        url: "https://hubspot.com",
        iconCategory: "marketing"
      },
      {
        name: "Mailchimp AI",
        company: "Mailchimp",
        description: "\uC774\uBA54\uC77C \uB9C8\uCF00\uD305 AI",
        descriptionEn: "Email marketing AI",
        category: "\uB9C8\uCF00\uD305",
        pricing: "freemium",
        monthlyUsers: "2.5M+",
        rating: 85,
        pros: ["\uC0AC\uC6A9 \uD3B8\uC758\uC131", "\uC790\uB3D9\uD654", "\uBD84\uC11D"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uB514\uC790\uC778 \uC81C\uD55C", "\uACE0\uAE09 \uAE30\uB2A5 \uBD80\uC871"],
        prosEn: ["Ease of use", "Automation", "Analytics"],
        consEn: ["Limited free", "Design limitations", "Lack of advanced features"],
        features: ["\uC774\uBA54\uC77C \uB9C8\uCF00\uD305", "\uC790\uB3D9\uD654", "\uBD84\uC11D", "A/B \uD14C\uC2A4\uD2B8"],
        url: "https://mailchimp.com",
        iconCategory: "marketing"
      },
      {
        name: "Hootsuite AI",
        company: "Hootsuite",
        description: "\uC18C\uC15C\uBBF8\uB514\uC5B4 \uAD00\uB9AC AI",
        descriptionEn: "Social media management AI",
        category: "\uB9C8\uCF00\uD305",
        pricing: "paid",
        monthlyUsers: "1.8M+",
        rating: 84,
        pros: ["\uB2E4\uC911 \uD50C\uB7AB\uD3FC", "\uC2A4\uCF00\uC904\uB9C1", "\uBD84\uC11D"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uBCF5\uC7A1\uD55C UI", "\uC81C\uD55C\uB41C \uBB34\uB8CC"],
        prosEn: ["Multi-platform", "Scheduling", "Analytics"],
        consEn: ["High cost", "Complex UI", "Limited free"],
        features: ["\uC18C\uC15C\uBBF8\uB514\uC5B4 \uAD00\uB9AC", "\uC2A4\uCF00\uC904\uB9C1", "\uBD84\uC11D", "\uD300 \uD611\uC5C5"],
        url: "https://hootsuite.com",
        iconCategory: "marketing"
      },
      {
        name: "Buffer AI",
        company: "Buffer",
        description: "\uC18C\uC15C\uBBF8\uB514\uC5B4 \uC2A4\uCF00\uC904\uB7EC",
        descriptionEn: "Social media scheduler",
        category: "\uB9C8\uCF00\uD305",
        pricing: "freemium",
        monthlyUsers: "1.5M+",
        rating: 83,
        pros: ["\uAC04\uB2E8\uD55C UI", "\uC2A4\uCF00\uC904\uB9C1", "\uBD84\uC11D"],
        cons: ["\uC81C\uD55C\uB41C \uAE30\uB2A5", "\uD50C\uB7AB\uD3FC \uC81C\uD55C", "\uACE0\uAE09 \uAE30\uB2A5 \uC720\uB8CC"],
        prosEn: ["Simple UI", "Scheduling", "Analytics"],
        consEn: ["Limited features", "Platform limitations", "Advanced features paid"],
        features: ["\uD3EC\uC2A4\uD2B8 \uC2A4\uCF00\uC904\uB9C1", "\uBD84\uC11D", "\uD300 \uAD00\uB9AC", "\uCF58\uD150\uCE20 \uACC4\uD68D"],
        url: "https://buffer.com",
        iconCategory: "marketing"
      },
      {
        name: "Later AI",
        company: "Later",
        description: "\uBE44\uC8FC\uC5BC \uC18C\uC15C\uBBF8\uB514\uC5B4 \uD50C\uB798\uB108",
        descriptionEn: "Visual social media planner",
        category: "\uB9C8\uCF00\uD305",
        pricing: "freemium",
        monthlyUsers: "1.2M+",
        rating: 82,
        pros: ["\uBE44\uC8FC\uC5BC \uD50C\uB798\uB108", "Instagram \uD2B9\uD654", "\uC0AC\uC6A9 \uD3B8\uC758"],
        cons: ["\uD50C\uB7AB\uD3FC \uC81C\uD55C", "\uAE30\uB2A5 \uC81C\uD55C", "\uACE0\uAE09 \uAE30\uB2A5 \uC720\uB8CC"],
        prosEn: ["Visual planner", "Instagram focused", "Ease of use"],
        consEn: ["Platform limitations", "Feature limitations", "Advanced features paid"],
        features: ["\uBE44\uC8FC\uC5BC \uD50C\uB798\uB108", "\uC2A4\uCF00\uC904\uB9C1", "\uD574\uC2DC\uD0DC\uADF8", "\uBD84\uC11D"],
        url: "https://later.com",
        iconCategory: "marketing"
      },
      // 추가 AI 도구들 (200개 더)
      // 생산성 AI (30개)
      {
        name: "Notion AI",
        company: "Notion",
        description: "\uC2A4\uB9C8\uD2B8 \uB178\uD2B8 \uBC0F \uBB38\uC11C \uC791\uC131",
        descriptionEn: "Smart note-taking and document writing",
        category: "\uC0DD\uC0B0\uC131",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 89,
        pros: ["\uC62C\uC778\uC6D0 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4", "AI \uAE00\uC4F0\uAE30", "\uD611\uC5C5"],
        cons: ["\uBCF5\uC7A1\uD55C UI", "\uD559\uC2B5 \uACE1\uC120", "\uB290\uB9B0 \uB85C\uB529"],
        prosEn: ["All-in-one workspace", "AI writing", "Collaboration"],
        consEn: ["Complex UI", "Learning curve", "Slow loading"],
        features: ["\uB178\uD2B8 \uC791\uC131", "\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC", "\uD611\uC5C5", "\uD15C\uD50C\uB9BF"],
        url: "https://notion.so",
        iconCategory: "productivity"
      },
      {
        name: "Monday.com AI",
        company: "Monday.com",
        description: "\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC \uC790\uB3D9\uD654",
        descriptionEn: "Project management automation",
        category: "\uC0DD\uC0B0\uC131",
        pricing: "paid",
        monthlyUsers: "2M+",
        rating: 87,
        pros: ["\uC2DC\uAC01\uC801 \uAD00\uB9AC", "\uC790\uB3D9\uD654", "\uD1B5\uD569"],
        cons: ["\uB192\uC740 \uAC00\uACA9", "\uBCF5\uC7A1\uD55C \uC124\uC815", "\uC81C\uD55C\uB41C \uBB34\uB8CC"],
        prosEn: ["Visual management", "Automation", "Integrations"],
        consEn: ["High cost", "Complex setup", "Limited free"],
        features: ["\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC", "\uC790\uB3D9\uD654", "\uB300\uC2DC\uBCF4\uB4DC", "\uB9AC\uD3EC\uD2B8"],
        url: "https://monday.com",
        iconCategory: "productivity"
      },
      {
        name: "Asana AI",
        company: "Asana",
        description: "\uD300 \uC791\uC5C5 \uAD00\uB9AC AI",
        descriptionEn: "Team work management AI",
        category: "\uC0DD\uC0B0\uC131",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 85,
        pros: ["\uC9C1\uAD00\uC801 UI", "\uD300 \uD611\uC5C5", "\uBB34\uB8CC \uD50C\uB79C"],
        cons: ["\uACE0\uAE09 \uAE30\uB2A5 \uC81C\uD55C", "\uBCF5\uC7A1\uD55C \uD504\uB85C\uC81D\uD2B8", "\uB290\uB9B0 \uC131\uB2A5"],
        prosEn: ["Intuitive UI", "Team collaboration", "Free plan"],
        consEn: ["Limited advanced features", "Complex projects", "Slow performance"],
        features: ["\uC791\uC5C5 \uAD00\uB9AC", "\uD300 \uD611\uC5C5", "\uD0C0\uC784\uB77C\uC778", "\uB9AC\uD3EC\uD2B8"],
        url: "https://asana.com",
        iconCategory: "productivity"
      },
      {
        name: "Slack AI",
        company: "Slack",
        description: "\uC2A4\uB9C8\uD2B8 \uD300 \uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158",
        descriptionEn: "Smart team communication",
        category: "\uC0DD\uC0B0\uC131",
        pricing: "freemium",
        monthlyUsers: "12M+",
        rating: 88,
        pros: ["\uC2E4\uC2DC\uAC04 \uC18C\uD1B5", "\uD1B5\uD569", "\uAC80\uC0C9"],
        cons: ["\uBA54\uC2DC\uC9C0 \uACFC\uBD80\uD558", "\uC0B0\uB9CC\uD568", "\uBE44\uC2FC \uD50C\uB79C"],
        prosEn: ["Real-time communication", "Integrations", "Search"],
        consEn: ["Message overload", "Distractions", "Expensive plans"],
        features: ["\uD300 \uCC44\uD305", "\uD30C\uC77C \uACF5\uC720", "\uD1B5\uD569", "\uC6CC\uD06C\uD50C\uB85C\uC6B0"],
        url: "https://slack.com",
        iconCategory: "productivity"
      },
      {
        name: "Zapier AI",
        company: "Zapier",
        description: "\uC571 \uC5F0\uB3D9 \uC790\uB3D9\uD654",
        descriptionEn: "App integration automation",
        category: "\uC0DD\uC0B0\uC131",
        pricing: "freemium",
        monthlyUsers: "2.5M+",
        rating: 86,
        pros: ["\uB2E4\uC591\uD55C \uD1B5\uD569", "\uC790\uB3D9\uD654", "\uC0AC\uC6A9 \uD3B8\uC758"],
        cons: ["\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBCF5\uC7A1\uD55C \uB85C\uC9C1", "\uB514\uBC84\uAE45 \uC5B4\uB824\uC6C0"],
        prosEn: ["Various integrations", "Automation", "Ease of use"],
        consEn: ["Limited free", "Complex logic", "Debugging difficulty"],
        features: ["\uC571 \uD1B5\uD569", "\uC790\uB3D9\uD654", "\uC6CC\uD06C\uD50C\uB85C\uC6B0", "\uD2B8\uB9AC\uAC70"],
        url: "https://zapier.com",
        iconCategory: "productivity"
      },
      // 금융 AI (25개)
      {
        name: "Mint AI",
        company: "Intuit",
        description: "\uAC1C\uC778 \uC7AC\uC815 \uAD00\uB9AC AI",
        descriptionEn: "Personal finance management AI",
        category: "\uAE08\uC735",
        pricing: "free",
        monthlyUsers: "3M+",
        rating: 84,
        pros: ["\uBB34\uB8CC", "\uC790\uB3D9 \uBD84\uB958", "\uC608\uC0B0 \uAD00\uB9AC"],
        cons: ["\uBBF8\uAD6D \uC911\uC2EC", "\uAD11\uACE0", "\uC81C\uD55C\uB41C \uAE30\uB2A5"],
        prosEn: ["Free", "Auto categorization", "Budget management"],
        consEn: ["US-focused", "Ads", "Limited features"],
        features: ["\uC608\uC0B0 \uAD00\uB9AC", "\uC9C0\uCD9C \uCD94\uC801", "\uC2E0\uC6A9 \uC810\uC218", "\uC54C\uB9BC"],
        url: "https://mint.com",
        iconCategory: "finance"
      },
      {
        name: "QuickBooks AI",
        company: "Intuit",
        description: "\uC911\uC18C\uAE30\uC5C5 \uD68C\uACC4 \uC790\uB3D9\uD654",
        descriptionEn: "Small business accounting automation",
        category: "\uAE08\uC735",
        pricing: "paid",
        monthlyUsers: "1.5M+",
        rating: 87,
        pros: ["\uC644\uC804\uD55C \uD68C\uACC4", "\uC138\uAE08 \uC900\uBE44", "\uAE09\uC5EC"],
        cons: ["\uBCF5\uC7A1\uD568", "\uB192\uC740 \uAC00\uACA9", "\uD559\uC2B5 \uD544\uC694"],
        prosEn: ["Complete accounting", "Tax preparation", "Payroll"],
        consEn: ["Complexity", "High cost", "Learning required"],
        features: ["\uD68C\uACC4", "\uC778\uBCF4\uC774\uC2A4", "\uAE09\uC5EC", "\uC138\uAE08"],
        url: "https://quickbooks.intuit.com",
        iconCategory: "finance"
      },
      {
        name: "Robinhood AI",
        company: "Robinhood",
        description: "AI \uD22C\uC790 \uCD94\uCC9C",
        descriptionEn: "AI investment recommendations",
        category: "\uAE08\uC735",
        pricing: "freemium",
        monthlyUsers: "2M+",
        rating: 82,
        pros: ["\uC218\uC218\uB8CC \uC5C6\uC74C", "\uC0AC\uC6A9 \uD3B8\uC758", "\uBAA8\uBC14\uC77C"],
        cons: ["\uC81C\uD55C\uB41C \uC5F0\uAD6C", "\uAE30\uBCF8\uC801 \uB3C4\uAD6C", "\uACE0\uAC1D \uC11C\uBE44\uC2A4"],
        prosEn: ["No commission", "Ease of use", "Mobile"],
        consEn: ["Limited research", "Basic tools", "Customer service"],
        features: ["\uC8FC\uC2DD \uAC70\uB798", "ETF", "\uC635\uC158", "\uC554\uD638\uD654\uD3D0"],
        url: "https://robinhood.com",
        iconCategory: "finance"
      },
      {
        name: "Personal Capital AI",
        company: "Personal Capital",
        description: "\uC790\uC0B0 \uAD00\uB9AC AI",
        descriptionEn: "Wealth management AI",
        category: "\uAE08\uC735",
        pricing: "freemium",
        monthlyUsers: "800K+",
        rating: 85,
        pros: ["\uC790\uC0B0 \uCD94\uC801", "\uD22C\uC790 \uBD84\uC11D", "\uBB34\uB8CC \uB3C4\uAD6C"],
        cons: ["\uC601\uC5C5 \uC5F0\uB77D", "\uBCF5\uC7A1\uD55C UI", "\uBBF8\uAD6D \uC911\uC2EC"],
        prosEn: ["Asset tracking", "Investment analysis", "Free tools"],
        consEn: ["Sales calls", "Complex UI", "US-focused"],
        features: ["\uC790\uC0B0 \uCD94\uC801", "\uD22C\uC790 \uBD84\uC11D", "\uC740\uD1F4 \uACC4\uD68D", "\uC218\uC218\uB8CC \uBD84\uC11D"],
        url: "https://personalcapital.com",
        iconCategory: "finance"
      },
      // 건강 AI (20개)
      {
        name: "MyFitnessPal AI",
        company: "Under Armour",
        description: "AI \uCE7C\uB85C\uB9AC \uCD94\uC801",
        descriptionEn: "AI calorie tracking",
        category: "\uAC74\uAC15",
        pricing: "freemium",
        monthlyUsers: "5M+",
        rating: 86,
        pros: ["\uBC29\uB300\uD55C \uC74C\uC2DD DB", "\uBC14\uCF54\uB4DC \uC2A4\uCE94", "\uCEE4\uBBA4\uB2C8\uD2F0"],
        cons: ["\uAD11\uACE0", "\uD504\uB9AC\uBBF8\uC5C4 \uC81C\uD55C", "\uC815\uD655\uB3C4"],
        prosEn: ["Huge food database", "Barcode scan", "Community"],
        consEn: ["Ads", "Premium limitations", "Accuracy"],
        features: ["\uCE7C\uB85C\uB9AC \uCD94\uC801", "\uC6B4\uB3D9 \uAE30\uB85D", "\uC601\uC591 \uBD84\uC11D", "\uBAA9\uD45C \uC124\uC815"],
        url: "https://myfitnesspal.com",
        iconCategory: "health"
      },
      {
        name: "Headspace AI",
        company: "Headspace",
        description: "AI \uBA85\uC0C1 \uBC0F \uB9C8\uC74C\uCC59\uAE40",
        descriptionEn: "AI meditation and mindfulness",
        category: "\uAC74\uAC15",
        pricing: "freemium",
        monthlyUsers: "3M+",
        rating: 88,
        pros: ["\uAC00\uC774\uB4DC \uBA85\uC0C1", "\uC218\uBA74 \uB3C4\uC6C0", "\uC2A4\uD2B8\uB808\uC2A4 \uAD00\uB9AC"],
        cons: ["\uAD6C\uB3C5 \uD544\uC694", "\uC81C\uD55C\uB41C \uBB34\uB8CC", "\uBC18\uBCF5\uC801"],
        prosEn: ["Guided meditation", "Sleep help", "Stress management"],
        consEn: ["Subscription required", "Limited free", "Repetitive"],
        features: ["\uBA85\uC0C1", "\uC218\uBA74", "\uC2A4\uD2B8\uB808\uC2A4 \uAD00\uB9AC", "\uC6B4\uB3D9"],
        url: "https://headspace.com",
        iconCategory: "health"
      },
      {
        name: "Fitbit AI",
        company: "Google",
        description: "\uD53C\uD2B8\uB2C8\uC2A4 \uCD94\uC801 AI",
        descriptionEn: "Fitness tracking AI",
        category: "\uAC74\uAC15",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 85,
        pros: ["\uC885\uD569 \uCD94\uC801", "\uC2EC\uBC15\uC218", "\uC218\uBA74 \uBD84\uC11D"],
        cons: ["\uAE30\uAE30 \uD544\uC694", "\uAD6C\uB3C5 \uBE44\uC6A9", "\uC815\uD655\uB3C4"],
        prosEn: ["Comprehensive tracking", "Heart rate", "Sleep analysis"],
        consEn: ["Device required", "Subscription cost", "Accuracy"],
        features: ["\uD65C\uB3D9 \uCD94\uC801", "\uC2EC\uBC15\uC218", "\uC218\uBA74", "\uBAA9\uD45C"],
        url: "https://fitbit.com",
        iconCategory: "health"
      },
      // 여행 AI (15개)
      {
        name: "TripAdvisor AI",
        company: "TripAdvisor",
        description: "AI \uC5EC\uD589 \uACC4\uD68D",
        descriptionEn: "AI travel planning",
        category: "\uC5EC\uD589",
        pricing: "free",
        monthlyUsers: "6M+",
        rating: 84,
        pros: ["\uB9AC\uBDF0 \uB9CE\uC74C", "\uAC00\uACA9 \uBE44\uAD50", "\uBB34\uB8CC"],
        cons: ["\uAD11\uACE0", "\uD3B8\uD5A5\uB41C \uB9AC\uBDF0", "\uBCF5\uC7A1\uD55C UI"],
        prosEn: ["Many reviews", "Price comparison", "Free"],
        consEn: ["Ads", "Biased reviews", "Complex UI"],
        features: ["\uD638\uD154 \uAC80\uC0C9", "\uB9AC\uBDF0", "\uAC00\uACA9 \uBE44\uAD50", "\uC5EC\uD589 \uACC4\uD68D"],
        url: "https://tripadvisor.com",
        iconCategory: "travel"
      },
      {
        name: "Kayak AI",
        company: "Kayak",
        description: "\uD56D\uACF5\uB8CC \uC608\uCE21 AI",
        descriptionEn: "Flight price prediction AI",
        category: "\uC5EC\uD589",
        pricing: "free",
        monthlyUsers: "4M+",
        rating: 83,
        pros: ["\uAC00\uACA9 \uC608\uCE21", "\uC54C\uB9BC", "\uBE44\uAD50"],
        cons: ["\uC608\uCE21 \uC815\uD655\uB3C4", "\uBCF5\uC7A1\uD55C \uAC80\uC0C9", "\uAD11\uACE0"],
        prosEn: ["Price prediction", "Alerts", "Comparison"],
        consEn: ["Prediction accuracy", "Complex search", "Ads"],
        features: ["\uD56D\uACF5\uB8CC \uAC80\uC0C9", "\uAC00\uACA9 \uC608\uCE21", "\uC54C\uB9BC", "\uD638\uD154"],
        url: "https://kayak.com",
        iconCategory: "travel"
      },
      {
        name: "Google Travel AI",
        company: "Google",
        description: "\uAD6C\uAE00 \uC5EC\uD589 \uACC4\uD68D AI",
        descriptionEn: "Google travel planning AI",
        category: "\uC5EC\uD589",
        pricing: "free",
        monthlyUsers: "8M+",
        rating: 87,
        pros: ["\uD1B5\uD569 \uC11C\uBE44\uC2A4", "\uBB34\uB8CC", "\uC815\uD655\uD55C \uC815\uBCF4"],
        cons: ["\uAC1C\uC778\uC815\uBCF4", "\uC81C\uD55C\uB41C \uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", "\uAD11\uACE0"],
        prosEn: ["Integrated services", "Free", "Accurate info"],
        consEn: ["Privacy", "Limited customization", "Ads"],
        features: ["\uD56D\uACF5\uD3B8", "\uD638\uD154", "\uC5EC\uD589 \uACC4\uD68D", "\uC9C0\uB3C4"],
        url: "https://travel.google.com",
        iconCategory: "travel"
      },
      // 부동산 AI (10개)
      {
        name: "Zillow AI",
        company: "Zillow",
        description: "AI \uBD80\uB3D9\uC0B0 \uAC00\uACA9 \uCD94\uC815",
        descriptionEn: "AI real estate price estimation",
        category: "\uBD80\uB3D9\uC0B0",
        pricing: "free",
        monthlyUsers: "5M+",
        rating: 85,
        pros: ["\uAC00\uACA9 \uCD94\uC815", "\uC2DC\uC7A5 \uD2B8\uB80C\uB4DC", "\uBB34\uB8CC"],
        cons: ["\uC815\uD655\uB3C4 \uBB38\uC81C", "\uBBF8\uAD6D \uC911\uC2EC", "\uD3B8\uD5A5"],
        prosEn: ["Price estimation", "Market trends", "Free"],
        consEn: ["Accuracy issues", "US-focused", "Bias"],
        features: ["\uBD80\uB3D9\uC0B0 \uAC80\uC0C9", "\uAC00\uACA9 \uCD94\uC815", "\uC2DC\uC7A5 \uBD84\uC11D", "\uB300\uCD9C"],
        url: "https://zillow.com",
        iconCategory: "realestate"
      },
      {
        name: "Redfin AI",
        company: "Redfin",
        description: "AI \uBD80\uB3D9\uC0B0 \uCD94\uCC9C",
        descriptionEn: "AI real estate recommendations",
        category: "\uBD80\uB3D9\uC0B0",
        pricing: "free",
        monthlyUsers: "2M+",
        rating: 84,
        pros: ["\uC815\uD655\uD55C \uB370\uC774\uD130", "\uB0AE\uC740 \uC218\uC218\uB8CC", "\uC0AC\uC6A9 \uD3B8\uC758"],
        cons: ["\uC9C0\uC5ED \uC81C\uD55C", "\uC5D0\uC774\uC804\uD2B8 \uD544\uC694", "\uAE30\uB2A5 \uC81C\uD55C"],
        prosEn: ["Accurate data", "Low commission", "Ease of use"],
        consEn: ["Geographic limitations", "Agent required", "Limited features"],
        features: ["\uBD80\uB3D9\uC0B0 \uAC80\uC0C9", "\uC2DC\uC7A5 \uBD84\uC11D", "\uD22C\uC5B4 \uC608\uC57D", "\uC5D0\uC774\uC804\uD2B8"],
        url: "https://redfin.com",
        iconCategory: "realestate"
      },
      // 교육 AI (25개)
      {
        name: "Khan Academy AI",
        company: "Khan Academy",
        description: "\uAC1C\uC778\uD654 \uD559\uC2B5 AI",
        descriptionEn: "Personalized learning AI",
        category: "\uAD50\uC721",
        pricing: "free",
        monthlyUsers: "6M+",
        rating: 91,
        pros: ["\uC644\uC804 \uBB34\uB8CC", "\uAC1C\uC778\uD654", "\uB2E4\uC591\uD55C \uACFC\uBAA9"],
        cons: ["\uC601\uC5B4 \uC704\uC8FC", "\uC0C1\uD638\uC791\uC6A9 \uC81C\uD55C", "\uACE0\uAE09 \uACFC\uC815 \uBD80\uC871"],
        prosEn: ["Completely free", "Personalized", "Various subjects"],
        consEn: ["English-focused", "Limited interaction", "Lack of advanced courses"],
        features: ["\uAC1C\uC778\uD654 \uD559\uC2B5", "\uC9C4\uB3C4 \uCD94\uC801", "\uC5F0\uC2B5 \uBB38\uC81C", "\uBE44\uB514\uC624"],
        url: "https://khanacademy.org",
        iconCategory: "education"
      },
      {
        name: "Coursera AI",
        company: "Coursera",
        description: "AI \uD559\uC2B5 \uCD94\uCC9C",
        descriptionEn: "AI learning recommendations",
        category: "\uAD50\uC721",
        pricing: "freemium",
        monthlyUsers: "4M+",
        rating: 88,
        pros: ["\uB300\uD559 \uC218\uC900", "\uC778\uC99D\uC11C", "\uB2E4\uC591\uD55C \uACFC\uC815"],
        cons: ["\uC720\uB8CC \uC778\uC99D", "\uC790\uAE30 \uC8FC\uB3C4 \uD544\uC694", "\uC5B8\uC5B4 \uC81C\uD55C"],
        prosEn: ["University level", "Certificates", "Various courses"],
        consEn: ["Paid certification", "Self-directed", "Language limitations"],
        features: ["\uC628\uB77C\uC778 \uAC15\uC758", "\uC778\uC99D\uC11C", "\uACFC\uC81C", "\uD504\uB85C\uC81D\uD2B8"],
        url: "https://coursera.org",
        iconCategory: "education"
      },
      {
        name: "Duolingo AI",
        company: "Duolingo",
        description: "AI \uC5B8\uC5B4 \uD559\uC2B5",
        descriptionEn: "AI language learning",
        category: "\uAD50\uC721",
        pricing: "freemium",
        monthlyUsers: "10M+",
        rating: 89,
        pros: ["\uAC8C\uC784\uD654", "\uAC1C\uC778\uD654", "\uBB34\uB8CC"],
        cons: ["\uBB38\uBC95 \uC124\uBA85 \uBD80\uC871", "\uBC18\uBCF5\uC801", "\uAD11\uACE0"],
        prosEn: ["Gamification", "Personalized", "Free"],
        consEn: ["Lack of grammar explanation", "Repetitive", "Ads"],
        features: ["\uC5B8\uC5B4 \uD559\uC2B5", "\uAC8C\uC784\uD654", "\uC9C4\uB3C4 \uCD94\uC801", "\uC2A4\uD2B8\uB9AD"],
        url: "https://duolingo.com",
        iconCategory: "education"
      },
      // 엔터테인먼트 AI (20개)
      {
        name: "Spotify AI",
        company: "Spotify",
        description: "AI \uC74C\uC545 \uCD94\uCC9C",
        descriptionEn: "AI music recommendations",
        category: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
        pricing: "freemium",
        monthlyUsers: "15M+",
        rating: 90,
        pros: ["\uAC1C\uC778\uD654 \uCD94\uCC9C", "\uB2E4\uC591\uD55C \uC74C\uC545", "\uD31F\uCE90\uC2A4\uD2B8"],
        cons: ["\uAD11\uACE0", "\uC624\uD504\uB77C\uC778 \uC81C\uD55C", "\uC74C\uC9C8"],
        prosEn: ["Personalized recommendations", "Various music", "Podcasts"],
        consEn: ["Ads", "Offline limitations", "Audio quality"],
        features: ["\uC74C\uC545 \uC2A4\uD2B8\uB9AC\uBC0D", "\uD50C\uB808\uC774\uB9AC\uC2A4\uD2B8", "\uD31F\uCE90\uC2A4\uD2B8", "\uCD94\uCC9C"],
        url: "https://spotify.com",
        iconCategory: "entertainment"
      },
      {
        name: "Netflix AI",
        company: "Netflix",
        description: "AI \uCF58\uD150\uCE20 \uCD94\uCC9C",
        descriptionEn: "AI content recommendations",
        category: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
        pricing: "paid",
        monthlyUsers: "12M+",
        rating: 89,
        pros: ["\uAC1C\uC778\uD654 \uCD94\uCC9C", "\uC624\uB9AC\uC9C0\uB110 \uCF58\uD150\uCE20", "\uACE0\uD488\uC9C8"],
        cons: ["\uAD6C\uB3C5 \uD544\uC218", "\uC9C0\uC5ED \uC81C\uD55C", "\uCF58\uD150\uCE20 \uC21C\uD658"],
        prosEn: ["Personalized recommendations", "Original content", "High quality"],
        consEn: ["Subscription required", "Regional restrictions", "Content rotation"],
        features: ["\uC601\uC0C1 \uC2A4\uD2B8\uB9AC\uBC0D", "\uCD94\uCC9C", "\uB2E4\uC6B4\uB85C\uB4DC", "\uD504\uB85C\uD544"],
        url: "https://netflix.com",
        iconCategory: "entertainment"
      },
      {
        name: "YouTube AI",
        company: "Google",
        description: "AI \uC601\uC0C1 \uCD94\uCC9C",
        descriptionEn: "AI video recommendations",
        category: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
        pricing: "freemium",
        monthlyUsers: "25M+",
        rating: 88,
        pros: ["\uBB34\uB8CC", "\uB2E4\uC591\uD55C \uCF58\uD150\uCE20", "\uCC3D\uC791\uC790 \uC9C0\uC6D0"],
        cons: ["\uAD11\uACE0", "\uC911\uB3C5\uC131", "\uD488\uC9C8 \uD3B8\uCC28"],
        prosEn: ["Free", "Various content", "Creator support"],
        consEn: ["Ads", "Addictive", "Quality variance"],
        features: ["\uC601\uC0C1 \uC2A4\uD2B8\uB9AC\uBC0D", "\uCD94\uCC9C", "\uB313\uAE00", "\uAD6C\uB3C5"],
        url: "https://youtube.com",
        iconCategory: "entertainment"
      }
    ];
    tools.forEach((tool) => {
      const id = this.currentId++;
      this.aiTools.set(id, { ...tool, id });
    });
    const bundles = [
      {
        name: "\uC601\uC0C1 \uC81C\uC791 \uD328\uD0A4\uC9C0",
        nameEn: "Video Production Package",
        description: "\uC644\uC804\uD55C \uC601\uC0C1 \uC81C\uC791 \uC6CC\uD06C\uD50C\uB85C\uC6B0",
        descriptionEn: "Complete video production workflow",
        category: "\uC601\uC0C1 \uC81C\uC791",
        tools: [
          { id: 4, name: "Runway ML", role: "\uC601\uC0C1 \uC0DD\uC131", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "\uC74C\uC131 \uC0DD\uC131", pricing: "freemium" },
          { id: 0, name: "Rev AI", role: "\uC790\uB9C9 \uC0DD\uC131", pricing: "paid" }
        ],
        estimatedCost: "$45-80",
        color: "red",
        icon: "video"
      },
      {
        name: "\uCF58\uD150\uCE20 \uC81C\uC791 \uD328\uD0A4\uC9C0",
        nameEn: "Content Creation Package",
        description: "\uBE14\uB85C\uADF8\uBD80\uD130 SNS\uAE4C\uC9C0 \uC644\uBCBD \uCEE4\uBC84",
        descriptionEn: "Perfect coverage from blogs to SNS",
        category: "\uCF58\uD150\uCE20 \uC81C\uC791",
        tools: [
          { id: 1, name: "ChatGPT", role: "\uD14D\uC2A4\uD2B8 \uC0DD\uC131", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "\uC774\uBBF8\uC9C0 \uC0DD\uC131", pricing: "paid" },
          { id: 0, name: "Buffer AI", role: "\uC2A4\uCF00\uC904\uB9C1", pricing: "freemium" }
        ],
        estimatedCost: "$30-50",
        color: "blue",
        icon: "pen-fancy"
      },
      {
        name: "\uB370\uC774\uD130 \uBD84\uC11D \uD328\uD0A4\uC9C0",
        nameEn: "Data Analysis Package",
        description: "\uB370\uC774\uD130\uC5D0\uC11C \uC778\uC0AC\uC774\uD2B8\uAE4C\uC9C0",
        descriptionEn: "From data to insights",
        category: "\uB370\uC774\uD130 \uBD84\uC11D",
        tools: [
          { id: 3, name: "Claude", role: "\uBB38\uC11C \uBD84\uC11D", pricing: "free" },
          { id: 0, name: "Tableau AI", role: "\uCC28\uD2B8 \uC0DD\uC131", pricing: "freemium" },
          { id: 0, name: "Gamma", role: "\uBCF4\uACE0\uC11C \uC0DD\uC131", pricing: "freemium" }
        ],
        estimatedCost: "$20-40",
        color: "green",
        icon: "chart-bar"
      },
      {
        name: "\uC74C\uC545 \uC81C\uC791 \uD328\uD0A4\uC9C0",
        nameEn: "Music Production Package",
        description: "\uC644\uC804\uD55C \uC74C\uC545 \uC81C\uC791 \uC6CC\uD06C\uD50C\uB85C\uC6B0",
        descriptionEn: "Complete music production workflow",
        category: "\uC74C\uC545 \uC81C\uC791",
        tools: [
          { id: 0, name: "Suno AI", role: "\uC74C\uC545 \uC0DD\uC131", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "\uBCF4\uCEEC \uC0DD\uC131", pricing: "freemium" },
          { id: 0, name: "AIVA", role: "\uD3B8\uACE1", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "purple",
        icon: "music"
      },
      {
        name: "\uB9C8\uCF00\uD305 \uC790\uB3D9\uD654 \uD328\uD0A4\uC9C0",
        nameEn: "Marketing Automation Package",
        description: "SNS\uBD80\uD130 \uC774\uBA54\uC77C\uAE4C\uC9C0 \uB9C8\uCF00\uD305 \uC790\uB3D9\uD654",
        descriptionEn: "Marketing automation from SNS to email",
        category: "\uB9C8\uCF00\uD305",
        tools: [
          { id: 1, name: "ChatGPT", role: "\uCF58\uD150\uCE20 \uAE30\uD68D", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "\uB514\uC790\uC778", pricing: "freemium" },
          { id: 0, name: "Hootsuite AI", role: "SNS \uAD00\uB9AC", pricing: "paid" }
        ],
        estimatedCost: "$40-70",
        color: "orange",
        icon: "megaphone"
      },
      {
        name: "\uB514\uC790\uC778 \uC2A4\uD29C\uB514\uC624 \uD328\uD0A4\uC9C0",
        nameEn: "Design Studio Package",
        description: "\uB85C\uACE0\uBD80\uD130 \uC6F9\uB514\uC790\uC778\uAE4C\uC9C0",
        descriptionEn: "From logo to web design",
        category: "\uB514\uC790\uC778",
        tools: [
          { id: 2, name: "Midjourney", role: "\uC774\uBBF8\uC9C0 \uC0DD\uC131", pricing: "paid" },
          { id: 0, name: "Figma AI", role: "UI/UX \uB514\uC790\uC778", pricing: "freemium" },
          { id: 0, name: "Looka", role: "\uB85C\uACE0 \uC81C\uC791", pricing: "paid" }
        ],
        estimatedCost: "$35-60",
        color: "pink",
        icon: "palette"
      },
      {
        name: "\uAD50\uC721 \uCF58\uD150\uCE20 \uD328\uD0A4\uC9C0",
        nameEn: "Educational Content Package",
        description: "\uAC15\uC758 \uC601\uC0C1 \uC81C\uC791 \uC62C\uC778\uC6D0",
        descriptionEn: "All-in-one lecture video production",
        category: "\uAD50\uC721",
        tools: [
          { id: 0, name: "Synthesia", role: "AI \uAC15\uC0AC", pricing: "paid" },
          { id: 1, name: "ChatGPT", role: "\uC2A4\uD06C\uB9BD\uD2B8 \uC791\uC131", pricing: "freemium" },
          { id: 0, name: "InVideo", role: "\uC601\uC0C1 \uD3B8\uC9D1", pricing: "freemium" }
        ],
        estimatedCost: "$50-90",
        color: "blue",
        icon: "graduation-cap"
      },
      {
        name: "\uD31F\uCE90\uC2A4\uD2B8 \uC81C\uC791 \uD328\uD0A4\uC9C0",
        nameEn: "Podcast Production Package",
        description: "\uAE30\uD68D\uBD80\uD130 \uBC30\uD3EC\uAE4C\uC9C0 \uD31F\uCE90\uC2A4\uD2B8 \uC81C\uC791",
        descriptionEn: "Podcast production from planning to distribution",
        category: "\uC624\uB514\uC624",
        tools: [
          { id: 1, name: "ChatGPT", role: "\uB300\uBCF8 \uC791\uC131", pricing: "freemium" },
          { id: 5, name: "ElevenLabs", role: "\uC74C\uC131 \uC0DD\uC131", pricing: "freemium" },
          { id: 0, name: "Descript", role: "\uD3B8\uC9D1", pricing: "freemium" }
        ],
        estimatedCost: "$20-45",
        color: "indigo",
        icon: "radio"
      },
      {
        name: "AI \uAC1C\uBC1C\uC790 \uD328\uD0A4\uC9C0",
        nameEn: "AI Developer Package",
        description: "AI \uC571 \uAC1C\uBC1C\uC744 \uC704\uD55C \uC644\uBCBD\uD55C \uB3C4\uAD6C",
        descriptionEn: "Perfect tools for AI app development",
        category: "\uAC1C\uBC1C",
        tools: [
          { id: 6, name: "GitHub Copilot", role: "\uCF54\uB4DC \uC0DD\uC131", pricing: "paid" },
          { id: 0, name: "Cursor", role: "AI \uC5D0\uB514\uD130", pricing: "freemium" },
          { id: 1, name: "ChatGPT", role: "\uBB38\uC11C\uD654", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "gray",
        icon: "code"
      },
      {
        name: "\uC18C\uC15C\uBBF8\uB514\uC5B4 \uD06C\uB9AC\uC5D0\uC774\uD130 \uD328\uD0A4\uC9C0",
        nameEn: "Social Media Creator Package",
        description: "\uBC14\uC774\uB7F4 \uCF58\uD150\uCE20 \uC81C\uC791\uC758 \uBAA8\uB4E0 \uAC83",
        descriptionEn: "Everything for viral content creation",
        category: "SNS",
        tools: [
          { id: 0, name: "Pika Labs", role: "\uC20F\uD3FC \uC601\uC0C1", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "\uC378\uB124\uC77C", pricing: "paid" },
          { id: 0, name: "Buffer AI", role: "\uC2A4\uCF00\uC904\uB9C1", pricing: "freemium" }
        ],
        estimatedCost: "$30-55",
        color: "cyan",
        icon: "share"
      },
      {
        name: "\uBC88\uC5ED \uBC0F \uD604\uC9C0\uD654 \uD328\uD0A4\uC9C0",
        nameEn: "Translation & Localization Package",
        description: "\uAE00\uB85C\uBC8C \uC9C4\uCD9C\uC744 \uC704\uD55C \uBC88\uC5ED \uC194\uB8E8\uC158",
        descriptionEn: "Translation solution for global expansion",
        category: "\uBC88\uC5ED",
        tools: [
          { id: 7, name: "DeepL", role: "\uD14D\uC2A4\uD2B8 \uBC88\uC5ED", pricing: "freemium" },
          { id: 0, name: "Murf", role: "\uB2E4\uAD6D\uC5B4 \uC74C\uC131", pricing: "freemium" },
          { id: 1, name: "ChatGPT", role: "\uBB38\uD654\uC801 \uD604\uC9C0\uD654", pricing: "freemium" }
        ],
        estimatedCost: "$15-35",
        color: "teal",
        icon: "globe"
      },
      {
        name: "e\uCEE4\uBA38\uC2A4 \uCD5C\uC801\uD654 \uD328\uD0A4\uC9C0",
        nameEn: "E-commerce Optimization Package",
        description: "\uC628\uB77C\uC778 \uC1FC\uD551\uBAB0 \uC6B4\uC601 \uCD5C\uC801\uD654",
        descriptionEn: "Online store operation optimization",
        category: "\uC804\uC790\uC0C1\uAC70\uB798",
        tools: [
          { id: 0, name: "Copy.ai", role: "\uC0C1\uD488 \uC124\uBA85", pricing: "freemium" },
          { id: 2, name: "Midjourney", role: "\uC0C1\uD488 \uC774\uBBF8\uC9C0", pricing: "paid" },
          { id: 0, name: "HubSpot AI", role: "\uACE0\uAC1D \uAD00\uB9AC", pricing: "freemium" }
        ],
        estimatedCost: "$35-65",
        color: "emerald",
        icon: "shopping-cart"
      },
      {
        name: "\uBC95\uB960 \uBB38\uC11C \uD328\uD0A4\uC9C0",
        nameEn: "Legal Document Package",
        description: "\uBC95\uB960 \uBB38\uC11C \uC791\uC131 \uBC0F \uAC80\uD1A0",
        descriptionEn: "Legal document writing and review",
        category: "\uBC95\uB960",
        tools: [
          { id: 3, name: "Claude", role: "\uBB38\uC11C \uBD84\uC11D", pricing: "free" },
          { id: 1, name: "ChatGPT", role: "\uCD08\uC548 \uC791\uC131", pricing: "freemium" },
          { id: 0, name: "Grammarly", role: "\uBB38\uBC95 \uAC80\uC0AC", pricing: "freemium" }
        ],
        estimatedCost: "$20-40",
        color: "slate",
        icon: "scale"
      },
      {
        name: "\uC758\uB8CC \uC5F0\uAD6C \uD328\uD0A4\uC9C0",
        nameEn: "Medical Research Package",
        description: "\uC758\uB8CC \uB370\uC774\uD130 \uBD84\uC11D \uBC0F \uC5F0\uAD6C",
        descriptionEn: "Medical data analysis and research",
        category: "\uC758\uB8CC",
        tools: [
          { id: 0, name: "DataRobot", role: "\uB370\uC774\uD130 \uBD84\uC11D", pricing: "paid" },
          { id: 3, name: "Claude", role: "\uB17C\uBB38 \uB9AC\uBDF0", pricing: "free" },
          { id: 0, name: "Tableau Prep", role: "\uC2DC\uAC01\uD654", pricing: "paid" }
        ],
        estimatedCost: "$100-200",
        color: "red",
        icon: "heart"
      },
      {
        name: "\uBD80\uB3D9\uC0B0 \uB9C8\uCF00\uD305 \uD328\uD0A4\uC9C0",
        nameEn: "Real Estate Marketing Package",
        description: "\uBD80\uB3D9\uC0B0 \uB9C8\uCF00\uD305 \uC790\uB3D9\uD654",
        descriptionEn: "Real estate marketing automation",
        category: "\uBD80\uB3D9\uC0B0",
        tools: [
          { id: 0, name: "D-ID", role: "\uAC00\uC0C1 \uD22C\uC5B4", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "\uC804\uB2E8\uC9C0 \uB514\uC790\uC778", pricing: "freemium" },
          { id: 0, name: "Mailchimp AI", role: "\uC774\uBA54\uC77C \uB9C8\uCF00\uD305", pricing: "freemium" }
        ],
        estimatedCost: "$25-50",
        color: "amber",
        icon: "home"
      },
      {
        name: "\uAC8C\uC784 \uAC1C\uBC1C \uD328\uD0A4\uC9C0",
        nameEn: "Game Development Package",
        description: "\uC778\uB514 \uAC8C\uC784 \uAC1C\uBC1C \uD544\uC218 \uB3C4\uAD6C",
        descriptionEn: "Essential tools for indie game development",
        category: "\uAC8C\uC784",
        tools: [
          { id: 0, name: "Leonardo.ai", role: "\uAC8C\uC784 \uC544\uD2B8", pricing: "freemium" },
          { id: 0, name: "Mubert", role: "\uBC30\uACBD\uC74C\uC545", pricing: "freemium" },
          { id: 6, name: "GitHub Copilot", role: "\uCF54\uB4DC \uC0DD\uC131", pricing: "paid" }
        ],
        estimatedCost: "$40-70",
        color: "violet",
        icon: "gamepad"
      },
      {
        name: "\uD559\uC220 \uB17C\uBB38 \uD328\uD0A4\uC9C0",
        nameEn: "Academic Paper Package",
        description: "\uC5F0\uAD6C \uB17C\uBB38 \uC791\uC131 \uBC0F \uBC1C\uD45C",
        descriptionEn: "Research paper writing and presentation",
        category: "\uD559\uC220",
        tools: [
          { id: 3, name: "Claude", role: "\uC5F0\uAD6C \uBD84\uC11D", pricing: "free" },
          { id: 0, name: "Gamma", role: "\uBC1C\uD45C \uC790\uB8CC", pricing: "freemium" },
          { id: 0, name: "Grammarly", role: "\uAD50\uC815", pricing: "freemium" }
        ],
        estimatedCost: "$15-30",
        color: "blue",
        icon: "book"
      },
      {
        name: "\uC5EC\uD589 \uACC4\uD68D \uD328\uD0A4\uC9C0",
        nameEn: "Travel Planning Package",
        description: "\uC644\uBCBD\uD55C \uC5EC\uD589 \uACC4\uD68D \uC218\uB9BD",
        descriptionEn: "Perfect travel planning",
        category: "\uC5EC\uD589",
        tools: [
          { id: 0, name: "Google Travel AI", role: "\uC77C\uC815 \uACC4\uD68D", pricing: "free" },
          { id: 0, name: "Kayak AI", role: "\uD56D\uACF5\uB8CC \uC608\uCE21", pricing: "free" },
          { id: 1, name: "ChatGPT", role: "\uC5EC\uD589 \uAC00\uC774\uB4DC", pricing: "freemium" }
        ],
        estimatedCost: "$0-15",
        color: "cyan",
        icon: "map"
      },
      {
        name: "\uAC1C\uC778 \uC7AC\uC815 \uAD00\uB9AC \uD328\uD0A4\uC9C0",
        nameEn: "Personal Finance Package",
        description: "AI \uAE30\uBC18 \uC7AC\uC815 \uAD00\uB9AC",
        descriptionEn: "AI-based financial management",
        category: "\uAE08\uC735",
        tools: [
          { id: 0, name: "Mint AI", role: "\uC608\uC0B0 \uAD00\uB9AC", pricing: "free" },
          { id: 0, name: "Personal Capital AI", role: "\uD22C\uC790 \uBD84\uC11D", pricing: "freemium" },
          { id: 0, name: "QuickBooks AI", role: "\uC138\uAE08 \uAD00\uB9AC", pricing: "paid" }
        ],
        estimatedCost: "$0-50",
        color: "green",
        icon: "dollar-sign"
      },
      {
        name: "\uAC74\uAC15 \uAD00\uB9AC \uD328\uD0A4\uC9C0",
        nameEn: "Health Management Package",
        description: "AI \uD5EC\uC2A4\uCF00\uC5B4 \uC194\uB8E8\uC158",
        descriptionEn: "AI healthcare solution",
        category: "\uAC74\uAC15",
        tools: [
          { id: 0, name: "MyFitnessPal AI", role: "\uC601\uC591 \uAD00\uB9AC", pricing: "freemium" },
          { id: 0, name: "Fitbit AI", role: "\uD65C\uB3D9 \uCD94\uC801", pricing: "freemium" },
          { id: 0, name: "Headspace AI", role: "\uC815\uC2E0 \uAC74\uAC15", pricing: "freemium" }
        ],
        estimatedCost: "$20-45",
        color: "red",
        icon: "heart"
      },
      {
        name: "\uCC3D\uC5C5\uAC00 \uD328\uD0A4\uC9C0",
        nameEn: "Entrepreneur Package",
        description: "\uC2A4\uD0C0\uD2B8\uC5C5 \uB7F0\uCE6D\uC744 \uC704\uD55C \uBAA8\uB4E0 \uAC83",
        descriptionEn: "Everything for startup launch",
        category: "\uBE44\uC988\uB2C8\uC2A4",
        tools: [
          { id: 0, name: "Notion AI", role: "\uBE44\uC988\uB2C8\uC2A4 \uD50C\uB79C", pricing: "freemium" },
          { id: 0, name: "Canva AI", role: "\uBE0C\uB79C\uB529", pricing: "freemium" },
          { id: 0, name: "HubSpot AI", role: "\uACE0\uAC1D \uAD00\uB9AC", pricing: "freemium" }
        ],
        estimatedCost: "$30-60",
        color: "purple",
        icon: "rocket"
      },
      {
        name: "\uC628\uB77C\uC778 \uAD50\uC721 \uD328\uD0A4\uC9C0",
        nameEn: "Online Education Package",
        description: "\uB514\uC9C0\uD138 \uAD50\uC721 \uCF58\uD150\uCE20 \uC81C\uC791",
        descriptionEn: "Digital education content creation",
        category: "\uAD50\uC721",
        tools: [
          { id: 0, name: "Khan Academy AI", role: "\uCEE4\uB9AC\uD058\uB7FC", pricing: "free" },
          { id: 0, name: "Synthesia", role: "\uAC15\uC758 \uC601\uC0C1", pricing: "paid" },
          { id: 0, name: "Coursera AI", role: "\uCF54\uC2A4 \uC124\uACC4", pricing: "freemium" }
        ],
        estimatedCost: "$25-70",
        color: "blue",
        icon: "graduation-cap"
      },
      {
        name: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8 \uC2A4\uD2B8\uB9AC\uBC0D \uD328\uD0A4\uC9C0",
        nameEn: "Entertainment Streaming Package",
        description: "\uAC1C\uC778\uD654\uB41C \uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
        descriptionEn: "Personalized entertainment",
        category: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
        tools: [
          { id: 0, name: "Spotify AI", role: "\uC74C\uC545 \uCD94\uCC9C", pricing: "freemium" },
          { id: 0, name: "Netflix AI", role: "\uC601\uC0C1 \uCD94\uCC9C", pricing: "paid" },
          { id: 0, name: "YouTube AI", role: "\uCF58\uD150\uCE20 \uBC1C\uACAC", pricing: "freemium" }
        ],
        estimatedCost: "$15-35",
        color: "rose",
        icon: "play"
      },
      {
        name: "\uB514\uC9C0\uD138 \uB178\uB9C8\uB4DC \uD328\uD0A4\uC9C0",
        nameEn: "Digital Nomad Package",
        description: "\uC6D0\uACA9 \uADFC\uBB34\uB97C \uC704\uD55C \uC644\uBCBD\uD55C \uB3C4\uAD6C",
        descriptionEn: "Perfect tools for remote work",
        category: "\uC6D0\uACA9\uADFC\uBB34",
        tools: [
          { id: 0, name: "Slack AI", role: "\uD300 \uC18C\uD1B5", pricing: "freemium" },
          { id: 0, name: "Zoom AI", role: "\uD654\uC0C1 \uD68C\uC758", pricing: "freemium" },
          { id: 0, name: "Asana AI", role: "\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC", pricing: "freemium" }
        ],
        estimatedCost: "$20-50",
        color: "teal",
        icon: "wifi"
      },
      {
        name: "\uC18C\uB9E4\uC5C5 \uCD5C\uC801\uD654 \uD328\uD0A4\uC9C0",
        nameEn: "Retail Optimization Package",
        description: "\uB9E4\uC7A5 \uC6B4\uC601 \uCD5C\uC801\uD654",
        descriptionEn: "Store operation optimization",
        category: "\uC18C\uB9E4",
        tools: [
          { id: 0, name: "Square AI", role: "POS \uC2DC\uC2A4\uD15C", pricing: "freemium" },
          { id: 0, name: "Shopify AI", role: "\uC628\uB77C\uC778 \uC2A4\uD1A0\uC5B4", pricing: "paid" },
          { id: 0, name: "Inventory AI", role: "\uC7AC\uACE0 \uAD00\uB9AC", pricing: "paid" }
        ],
        estimatedCost: "$50-120",
        color: "orange",
        icon: "shopping-bag"
      },
      {
        name: "\uD06C\uB9AC\uC5D0\uC774\uD130 \uC774\uCF54\uB178\uBBF8 \uD328\uD0A4\uC9C0",
        nameEn: "Creator Economy Package",
        description: "\uD06C\uB9AC\uC5D0\uC774\uD130\uB97C \uC704\uD55C \uC218\uC775\uD654 \uB3C4\uAD6C",
        descriptionEn: "Monetization tools for creators",
        category: "\uD06C\uB9AC\uC5D0\uC774\uD130",
        tools: [
          { id: 0, name: "Patreon AI", role: "\uAD6C\uB3C5 \uAD00\uB9AC", pricing: "freemium" },
          { id: 0, name: "OnlyFans AI", role: "\uCF58\uD150\uCE20 \uC218\uC775\uD654", pricing: "freemium" },
          { id: 0, name: "Twitch AI", role: "\uB77C\uC774\uBE0C \uC2A4\uD2B8\uB9AC\uBC0D", pricing: "freemium" }
        ],
        estimatedCost: "$15-40",
        color: "pink",
        icon: "star"
      }
    ];
    bundles.forEach((bundle) => {
      const id = this.currentId++;
      this.aiBundles.set(id, { ...bundle, id });
    });
    const questions = [
      {
        question: "\uC5B4\uB5A4 \uBAA9\uC801\uC73C\uB85C AI\uB97C \uD65C\uC6A9\uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?",
        questionEn: "What purpose do you want to use AI for?",
        options: [
          { value: "work", label: "\uC5C5\uBB34/\uBE44\uC988\uB2C8\uC2A4", labelEn: "Work/Business", description: "\uC5C5\uBB34 \uD6A8\uC728\uC131, \uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC, \uACE0\uAC1D \uB300\uC751 \uB4F1", descriptionEn: "Work efficiency, project management, customer service, etc." },
          { value: "creative", label: "\uCC3D\uC791 \uD65C\uB3D9", labelEn: "Creative Work", description: "\uCF58\uD150\uCE20 \uC81C\uC791, \uC608\uC220, \uB514\uC790\uC778, \uC74C\uC545 \uB4F1", descriptionEn: "Content creation, art, design, music, etc." },
          { value: "learning", label: "\uD559\uC2B5/\uAD50\uC721", labelEn: "Learning/Education", description: "\uACF5\uBD80, \uC5F0\uAD6C, \uAE30\uC220 \uC2B5\uB4DD, \uC5B8\uC5B4 \uD559\uC2B5 \uB4F1", descriptionEn: "Study, research, skill acquisition, language learning, etc." },
          { value: "personal", label: "\uC77C\uC0C1\uC0DD\uD65C", labelEn: "Daily Life", description: "\uAC1C\uC778 \uAD00\uB9AC, \uAC74\uAC15, \uC5EC\uD589 \uACC4\uD68D, \uCDE8\uBBF8 \uB4F1", descriptionEn: "Personal management, health, travel planning, hobbies, etc." },
          { value: "finance", label: "\uC7AC\uC815 \uAD00\uB9AC", labelEn: "Financial Management", description: "\uD22C\uC790, \uC608\uC0B0 \uAD00\uB9AC, \uACBD\uC81C \uBD84\uC11D \uB4F1", descriptionEn: "Investment, budget management, economic analysis, etc." }
        ],
        order: 1
      },
      // 업무/비즈니스 선택 시 질문
      {
        question: "\uAD6C\uCCB4\uC801\uC73C\uB85C \uC5B4\uB5A4 \uC5C5\uBB34\uC5D0 \uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uC2E0\uAC00\uC694?",
        questionEn: "What specific work tasks do you need help with?",
        options: [
          { value: "work_text", label: "\uBB38\uC11C \uC791\uC131 \uBC0F \uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158", labelEn: "Document writing & communication", description: "\uBCF4\uACE0\uC11C, \uC774\uBA54\uC77C, \uC81C\uC548\uC11C, \uD68C\uC758\uB85D \uC791\uC131", descriptionEn: "Reports, emails, proposals, meeting minutes" },
          { value: "work_analysis", label: "\uB370\uC774\uD130 \uBD84\uC11D \uBC0F \uC778\uC0AC\uC774\uD2B8", labelEn: "Data analysis & insights", description: "\uBE44\uC988\uB2C8\uC2A4 \uBD84\uC11D, \uC2DC\uC7A5 \uC870\uC0AC, \uD1B5\uACC4 \uCC98\uB9AC", descriptionEn: "Business analysis, market research, statistics" },
          { value: "work_automation", label: "\uC5C5\uBB34 \uC790\uB3D9\uD654 \uBC0F \uD6A8\uC728\uC131", labelEn: "Work automation & efficiency", description: "\uBC18\uBCF5 \uC791\uC5C5 \uC790\uB3D9\uD654, \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uCD5C\uC801\uD654", descriptionEn: "Automating repetitive tasks, workflow optimization" },
          { value: "work_coding", label: "\uAC1C\uBC1C \uBC0F \uD504\uB85C\uADF8\uB798\uBC0D", labelEn: "Development & programming", description: "\uCF54\uB4DC \uC791\uC131, \uB514\uBC84\uAE45, \uC2DC\uC2A4\uD15C \uAC1C\uBC1C", descriptionEn: "Code writing, debugging, system development" },
          { value: "work_marketing", label: "\uB9C8\uCF00\uD305 \uBC0F \uACE0\uAC1D \uB300\uC751", labelEn: "Marketing & customer service", description: "\uAD11\uACE0 \uBB38\uAD6C, SNS \uCF58\uD150\uCE20, \uACE0\uAC1D \uC11C\uBE44\uC2A4", descriptionEn: "Ad copy, social media content, customer service" }
        ],
        order: 2,
        parentOption: "work"
      },
      // 창작 활동 선택 시 질문
      {
        question: "\uC5B4\uB5A4 \uC885\uB958\uC758 \uCC3D\uC791\uC744 \uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?",
        questionEn: "What type of creative work do you want to do?",
        options: [
          { value: "creative_visual", label: "\uC2DC\uAC01\uC801 \uCF58\uD150\uCE20", labelEn: "Visual content", description: "\uC774\uBBF8\uC9C0, \uC77C\uB7EC\uC2A4\uD2B8, \uB85C\uACE0, \uD3EC\uC2A4\uD130 \uC81C\uC791", descriptionEn: "Images, illustrations, logos, poster creation" },
          { value: "creative_video", label: "\uC601\uC0C1 \uBC0F \uC560\uB2C8\uBA54\uC774\uC158", labelEn: "Video & animation", description: "\uC601\uC0C1 \uD3B8\uC9D1, \uC560\uB2C8\uBA54\uC774\uC158, \uBAA8\uC158 \uADF8\uB798\uD53D", descriptionEn: "Video editing, animation, motion graphics" },
          { value: "creative_music", label: "\uC74C\uC545 \uBC0F \uC624\uB514\uC624", labelEn: "Music & audio", description: "\uC791\uACE1, \uC0AC\uC6B4\uB4DC \uB514\uC790\uC778, \uD31F\uCE90\uC2A4\uD2B8 \uC81C\uC791", descriptionEn: "Composition, sound design, podcast creation" },
          { value: "creative_writing", label: "\uAE00\uC4F0\uAE30 \uBC0F \uC2A4\uD1A0\uB9AC\uD154\uB9C1", labelEn: "Writing & storytelling", description: "\uC18C\uC124, \uC2DC\uB098\uB9AC\uC624, \uBE14\uB85C\uADF8, \uCE74\uD53C\uB77C\uC774\uD305", descriptionEn: "Novels, scripts, blogs, copywriting" },
          { value: "creative_design", label: "\uB514\uC790\uC778 \uBC0F \uC544\uD2B8", labelEn: "Design & art", description: "UI/UX \uB514\uC790\uC778, \uC544\uD2B8\uC6CC\uD06C, \uBE0C\uB79C\uB529", descriptionEn: "UI/UX design, artwork, branding" }
        ],
        order: 2,
        parentOption: "creative"
      },
      // 학습/교육 선택 시 질문
      {
        question: "\uC5B4\uB5A4 \uBD84\uC57C\uC758 \uD559\uC2B5\uC744 \uC6D0\uD558\uC2DC\uB098\uC694?",
        questionEn: "What field do you want to learn about?",
        options: [
          { value: "learning_language", label: "\uC5B8\uC5B4 \uD559\uC2B5", labelEn: "Language learning", description: "\uC678\uAD6D\uC5B4, \uBC88\uC5ED, \uC5B8\uC5B4 \uAD50\uD658, \uBC1C\uC74C \uC5F0\uC2B5", descriptionEn: "Foreign languages, translation, language exchange, pronunciation" },
          { value: "learning_tech", label: "\uAE30\uC220 \uBC0F \uD504\uB85C\uADF8\uB798\uBC0D", labelEn: "Technology & programming", description: "\uCF54\uB529, \uC18C\uD504\uD2B8\uC6E8\uC5B4 \uAC1C\uBC1C, IT \uAE30\uC220", descriptionEn: "Coding, software development, IT skills" },
          { value: "learning_research", label: "\uC5F0\uAD6C \uBC0F \uC870\uC0AC", labelEn: "Research & investigation", description: "\uB17C\uBB38 \uC791\uC131, \uC790\uB8CC \uC218\uC9D1, \uBB38\uD5CC \uAC80\uD1A0", descriptionEn: "Paper writing, data collection, literature review" },
          { value: "learning_skill", label: "\uC0C8\uB85C\uC6B4 \uAE30\uC220 \uC2B5\uB4DD", labelEn: "New skill acquisition", description: "\uCDE8\uBBF8, \uC804\uBB38 \uAE30\uC220, \uC790\uACA9\uC99D \uC900\uBE44", descriptionEn: "Hobbies, professional skills, certification prep" },
          { value: "learning_academic", label: "\uD559\uC5C5 \uC9C0\uC6D0", labelEn: "Academic support", description: "\uC219\uC81C, \uC2DC\uD5D8 \uC900\uBE44, \uACFC\uC81C \uB3C4\uC6C0", descriptionEn: "Homework, exam prep, assignment help" }
        ],
        order: 2,
        parentOption: "learning"
      },
      // 일상생활 선택 시 질문
      {
        question: "\uC77C\uC0C1\uC0DD\uD65C\uC5D0\uC11C \uC5B4\uB5A4 \uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uC2E0\uAC00\uC694?",
        questionEn: "What kind of daily life assistance do you need?",
        options: [
          { value: "personal_health", label: "\uAC74\uAC15 \uBC0F \uC6F0\uB2C8\uC2A4", labelEn: "Health & wellness", description: "\uC6B4\uB3D9 \uACC4\uD68D, \uC2DD\uB2E8 \uAD00\uB9AC, \uAC74\uAC15 \uCD94\uC801", descriptionEn: "Exercise planning, diet management, health tracking" },
          { value: "personal_travel", label: "\uC5EC\uD589 \uBC0F \uACC4\uD68D", labelEn: "Travel & planning", description: "\uC5EC\uD589 \uACC4\uD68D, \uC219\uBC15 \uC608\uC57D, \uB9DB\uC9D1 \uCD94\uCC9C", descriptionEn: "Trip planning, accommodation booking, restaurant recommendations" },
          { value: "personal_entertainment", label: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8", labelEn: "Entertainment", description: "\uAC8C\uC784, \uC601\uD654 \uCD94\uCC9C, \uCDE8\uBBF8 \uD65C\uB3D9", descriptionEn: "Games, movie recommendations, hobby activities" },
          { value: "personal_productivity", label: "\uAC1C\uC778 \uC0DD\uC0B0\uC131", labelEn: "Personal productivity", description: "\uC77C\uC815 \uAD00\uB9AC, \uD560 \uC77C \uC815\uB9AC, \uBAA9\uD45C \uC124\uC815", descriptionEn: "Schedule management, to-do organization, goal setting" },
          { value: "personal_home", label: "\uD648 \uAD00\uB9AC", labelEn: "Home management", description: "\uC694\uB9AC, \uCCAD\uC18C, \uC9D1\uC548 \uC815\uB9AC, \uC778\uD14C\uB9AC\uC5B4", descriptionEn: "Cooking, cleaning, home organization, interior design" }
        ],
        order: 2,
        parentOption: "personal"
      },
      // 재정 관리 선택 시 질문
      {
        question: "\uC7AC\uC815 \uAD00\uB9AC\uC5D0\uC11C \uC5B4\uB5A4 \uBD80\uBD84\uC5D0 \uC9D1\uC911\uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?",
        questionEn: "What aspect of financial management do you want to focus on?",
        options: [
          { value: "finance_investment", label: "\uD22C\uC790 \uBC0F \uC790\uC0B0 \uAD00\uB9AC", labelEn: "Investment & asset management", description: "\uC8FC\uC2DD, \uBD80\uB3D9\uC0B0, \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uBD84\uC11D", descriptionEn: "Stocks, real estate, portfolio analysis" },
          { value: "finance_budgeting", label: "\uC608\uC0B0 \uAD00\uB9AC \uBC0F \uAC00\uACC4\uBD80", labelEn: "Budgeting & expense tracking", description: "\uC9C0\uCD9C \uBD84\uC11D, \uC800\uCD95 \uACC4\uD68D, \uAC00\uACC4\uBD80 \uAD00\uB9AC", descriptionEn: "Expense analysis, savings planning, household budgeting" },
          { value: "finance_business", label: "\uBE44\uC988\uB2C8\uC2A4 \uC7AC\uBB34", labelEn: "Business finance", description: "\uD68C\uACC4, \uC138\uBB34, \uBE44\uC988\uB2C8\uC2A4 \uBD84\uC11D", descriptionEn: "Accounting, tax planning, business analysis" },
          { value: "finance_crypto", label: "\uC554\uD638\uD654\uD3D0 \uBC0F \uB514\uD30C\uC774", labelEn: "Cryptocurrency & DeFi", description: "\uC554\uD638\uD654\uD3D0 \uBD84\uC11D, \uBE14\uB85D\uCCB4\uC778, \uB514\uD30C\uC774", descriptionEn: "Crypto analysis, blockchain, DeFi" },
          { value: "finance_planning", label: "\uC7AC\uC815 \uACC4\uD68D", labelEn: "Financial planning", description: "\uC740\uD1F4 \uACC4\uD68D, \uBCF4\uD5D8, \uC7AC\uC815 \uBAA9\uD45C \uC124\uC815", descriptionEn: "Retirement planning, insurance, financial goal setting" }
        ],
        order: 2,
        parentOption: "finance"
      },
      {
        question: "\uC5B4\uB5A4 \uBD84\uC57C\uC758 AI\uAC00 \uD544\uC694\uD558\uC2E0\uAC00\uC694?",
        questionEn: "What field of AI do you need?",
        options: [
          { value: "marketing", label: "\uB9C8\uCF00\uD305/\uAD11\uACE0", labelEn: "Marketing/Advertising", description: "SNS \uCF58\uD150\uCE20, \uAD11\uACE0 \uBB38\uAD6C, \uBE0C\uB79C\uB529 \uB4F1", descriptionEn: "Social media content, ad copy, branding, etc." },
          { value: "productivity", label: "\uC0DD\uC0B0\uC131 \uD5A5\uC0C1", labelEn: "Productivity", description: "\uC77C\uC815 \uAD00\uB9AC, \uC5C5\uBB34 \uC790\uB3D9\uD654, \uB178\uD2B8 \uC815\uB9AC \uB4F1", descriptionEn: "Schedule management, work automation, note organization, etc." },
          { value: "health", label: "\uAC74\uAC15/\uC6F0\uB2C8\uC2A4", labelEn: "Health/Wellness", description: "\uC6B4\uB3D9 \uACC4\uD68D, \uC2DD\uB2E8 \uAD00\uB9AC, \uAC74\uAC15 \uCD94\uC801 \uB4F1", descriptionEn: "Exercise planning, diet management, health tracking, etc." },
          { value: "travel", label: "\uC5EC\uD589/\uACC4\uD68D", labelEn: "Travel/Planning", description: "\uC5EC\uD589 \uACC4\uD68D, \uC219\uBC15 \uAC80\uC0C9, \uB9DB\uC9D1 \uCD94\uCC9C \uB4F1", descriptionEn: "Travel planning, accommodation search, restaurant recommendations, etc." },
          { value: "education", label: "\uAD50\uC721/\uD559\uC2B5", labelEn: "Education/Learning", description: "\uC5B8\uC5B4 \uD559\uC2B5, \uC628\uB77C\uC778 \uAC15\uC758, \uC2DC\uD5D8 \uC900\uBE44 \uB4F1", descriptionEn: "Language learning, online courses, exam preparation, etc." },
          { value: "entertainment", label: "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8", labelEn: "Entertainment", description: "\uAC8C\uC784, \uC601\uD654 \uCD94\uCC9C, \uC18C\uC124 \uCC3D\uC791 \uB4F1", descriptionEn: "Games, movie recommendations, novel writing, etc." },
          { value: "realestate", label: "\uBD80\uB3D9\uC0B0", labelEn: "Real Estate", description: "\uBD80\uB3D9\uC0B0 \uAC80\uC0C9, \uC2DC\uC138 \uBD84\uC11D, \uD22C\uC790 \uC870\uC5B8 \uB4F1", descriptionEn: "Property search, market analysis, investment advice, etc." },
          { value: "general", label: "\uBC94\uC6A9\uC801 \uC0AC\uC6A9", labelEn: "General use", description: "\uB2E4\uC591\uD55C \uBD84\uC57C\uC5D0\uC11C \uAD11\uBC94\uC704\uD558\uAC8C \uC0AC\uC6A9", descriptionEn: "Wide range of applications across various fields" }
        ],
        order: 3
      },
      {
        question: "\uC608\uC0B0\uC740 \uC5BC\uB9C8\uB098 \uACE0\uB824\uD558\uC2DC\uB098\uC694?",
        questionEn: "How much do you consider budget?",
        options: [
          { value: "free", label: "\uBB34\uB8CC\uB9CC \uC0AC\uC6A9", labelEn: "Free only", description: "\uC644\uC804 \uBB34\uB8CC \uB3C4\uAD6C\uB9CC \uCC3E\uACE0 \uC788\uC5B4\uC694", descriptionEn: "Looking for completely free tools only" },
          { value: "freemium", label: "\uC77C\uBD80 \uAE30\uB2A5\uC740 \uC720\uB8CC\uC5EC\uB3C4 \uAD1C\uCC2E\uC544\uC694", labelEn: "Some paid features are okay", description: "\uAE30\uBCF8 \uAE30\uB2A5\uC740 \uBB34\uB8CC, \uACE0\uAE09 \uAE30\uB2A5\uC740 \uC720\uB8CC", descriptionEn: "Basic features free, advanced features paid" },
          { value: "paid", label: "\uD544\uC694\uD558\uBA74 \uC720\uB8CC \uB3C4\uAD6C\uB3C4 \uC0AC\uC6A9", labelEn: "Will use paid tools if necessary", description: "\uD488\uC9C8 \uC88B\uC740 \uB3C4\uAD6C\uB77C\uBA74 \uBE44\uC6A9 \uC9C0\uBD88 \uC758\uD5A5", descriptionEn: "Willing to pay for quality tools" },
          { value: "enterprise", label: "\uAE30\uC5C5\uC6A9 \uACE0\uAE09 \uB3C4\uAD6C", labelEn: "Enterprise-grade tools", description: "\uCD5C\uACE0\uAE09 \uAE30\uB2A5\uACFC \uC9C0\uC6D0\uC774 \uD544\uC694\uD574\uC694", descriptionEn: "Need premium features and support" }
        ],
        order: 4
      },
      {
        question: "AI \uB3C4\uAD6C \uC0AC\uC6A9 \uACBD\uD5D8\uC740 \uC5B4\uB290 \uC815\uB3C4\uC778\uAC00\uC694?",
        questionEn: "How much experience do you have using AI tools?",
        options: [
          { value: "beginner", label: "\uCD08\uBCF4\uC790", labelEn: "Beginner", description: "AI \uB3C4\uAD6C\uB97C \uCC98\uC74C \uC0AC\uC6A9\uD574\uBD10\uC694", descriptionEn: "First time using AI tools" },
          { value: "intermediate", label: "\uC911\uAE09\uC790", labelEn: "Intermediate", description: "\uBA87 \uAC00\uC9C0 \uB3C4\uAD6C\uB97C \uC0AC\uC6A9\uD574\uBCF8 \uC801\uC774 \uC788\uC5B4\uC694", descriptionEn: "Have used a few tools before" },
          { value: "advanced", label: "\uACE0\uAE09\uC790", labelEn: "Advanced", description: "\uB2E4\uC591\uD55C AI \uB3C4\uAD6C\uB97C \uC790\uC8FC \uC0AC\uC6A9\uD574\uC694", descriptionEn: "Frequently use various AI tools" },
          { value: "expert", label: "\uC804\uBB38\uAC00", labelEn: "Expert", description: "AI \uB3C4\uAD6C\uC758 \uACE0\uAE09 \uAE30\uB2A5\uAE4C\uC9C0 \uD65C\uC6A9\uD574\uC694", descriptionEn: "Utilize advanced features of AI tools" }
        ],
        order: 5
      },
      {
        question: "AI \uB3C4\uAD6C\uC5D0\uC11C \uAC00\uC7A5 \uC911\uC694\uD558\uAC8C \uC0DD\uAC01\uD558\uB294 \uC694\uC18C\uB294?",
        questionEn: "What is the most important factor in AI tools for you?",
        options: [
          { value: "accuracy", label: "\uC815\uD655\uC131", labelEn: "Accuracy", description: "\uACB0\uACFC\uC758 \uC815\uD655\uB3C4\uC640 \uC2E0\uB8B0\uC131", descriptionEn: "Accuracy and reliability of results" },
          { value: "speed", label: "\uC18D\uB3C4", labelEn: "Speed", description: "\uBE60\uB978 \uCC98\uB9AC\uC640 \uC751\uB2F5 \uC2DC\uAC04", descriptionEn: "Fast processing and response time" },
          { value: "ease", label: "\uC0AC\uC6A9 \uD3B8\uC758\uC131", labelEn: "Ease of Use", description: "\uC9C1\uAD00\uC801\uC774\uACE0 \uC26C\uC6B4 \uC778\uD130\uD398\uC774\uC2A4", descriptionEn: "Intuitive and easy interface" },
          { value: "customization", label: "\uCEE4\uC2A4\uD130\uB9C8\uC774\uC9D5", labelEn: "Customization", description: "\uC138\uBD80 \uC124\uC815\uACFC \uAC1C\uC778\uD654 \uC635\uC158", descriptionEn: "Detailed settings and personalization options" },
          { value: "integration", label: "\uD1B5\uD569\uC131", labelEn: "Integration", description: "\uB2E4\uB978 \uB3C4\uAD6C\uB4E4\uACFC\uC758 \uC5F0\uB3D9", descriptionEn: "Integration with other tools" }
        ],
        order: 6
      }
    ];
    questions.forEach((question) => {
      const id = this.currentId++;
      this.quizQuestions.set(id, { ...question, id });
    });
    const stats = [
      { aiToolId: 1, totalUsers: 18e7, dailyActiveUsers: 486e3, avgSessionTime: 24, satisfactionScore: 47, monthlyGrowth: 520, category: "\uD14D\uC2A4\uD2B8" },
      { aiToolId: 2, totalUsers: 15e6, dailyActiveUsers: 125e3, avgSessionTime: 18, satisfactionScore: 49, monthlyGrowth: 810, category: "\uC774\uBBF8\uC9C0" },
      { aiToolId: 3, totalUsers: 25e6, dailyActiveUsers: 22e4, avgSessionTime: 32, satisfactionScore: 48, monthlyGrowth: 1280, category: "\uD14D\uC2A4\uD2B8" }
    ];
    stats.forEach((stat) => {
      const id = this.currentId++;
      this.usageStats.set(id, { ...stat, id });
    });
  }
  async getAllAiTools() {
    return Array.from(this.aiTools.values());
  }
  async getAiToolsByCategory(category) {
    return Array.from(this.aiTools.values()).filter((tool) => tool.category === category);
  }
  async getAiToolById(id) {
    return this.aiTools.get(id);
  }
  async searchAiTools(query) {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.aiTools.values()).filter(
      (tool) => tool.name.toLowerCase().includes(lowercaseQuery) || tool.description.toLowerCase().includes(lowercaseQuery) || tool.category.toLowerCase().includes(lowercaseQuery)
    );
  }
  async getAllAiBundles() {
    return Array.from(this.aiBundles.values());
  }
  async getAiBundleById(id) {
    return this.aiBundles.get(id);
  }
  async getAllQuizQuestions() {
    return Array.from(this.quizQuestions.values()).sort((a, b) => a.order - b.order);
  }
  async getUsageStats() {
    return Array.from(this.usageStats.values());
  }
  async getCategoryRankings() {
    const categories = ["\uD14D\uC2A4\uD2B8", "\uC774\uBBF8\uC9C0", "\uC601\uC0C1", "\uC74C\uC131", "\uC74C\uC545", "\uCF54\uB529", "\uB370\uC774\uD130\uBD84\uC11D", "\uB514\uC790\uC778", "\uB9C8\uCF00\uD305", "\uC0DD\uC0B0\uC131", "\uAE08\uC735", "\uAC74\uAC15", "\uC5EC\uD589", "\uBD80\uB3D9\uC0B0", "\uAD50\uC721", "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8"];
    return categories.map((category) => ({
      category,
      tools: Array.from(this.aiTools.values()).filter((tool) => tool.category === category).sort((a, b) => b.rating - a.rating).slice(0, 5)
    }));
  }
  // Missing methods implementation
  async addAiTool(tool) {
    const id = this.currentId++;
    const newTool = { ...tool, id };
    this.aiTools.set(id, newTool);
    return newTool;
  }
  async updateAiTool(id, tool) {
    const existingTool = this.aiTools.get(id);
    if (existingTool) {
      const updatedTool = { ...existingTool, ...tool };
      this.aiTools.set(id, updatedTool);
      return updatedTool;
    }
    return void 0;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async upsertUser(user) {
    const existingUser = this.users.get(user.id);
    const newUser = existingUser ? { ...existingUser, ...user, updatedAt: /* @__PURE__ */ new Date() } : {
      ...user,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user.id, newUser);
    return newUser;
  }
  async getUserCustomPackages(userId) {
    return Array.from(this.customPackages.values()).filter((pkg) => pkg.userId === userId);
  }
  async createCustomPackage(packageData) {
    const id = this.currentPackageId++;
    const newPackage = {
      ...packageData,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.customPackages.set(id, newPackage);
    return newPackage;
  }
  async getCustomPackageById(id) {
    return this.customPackages.get(id);
  }
  async updateCustomPackage(id, updates) {
    const existingPackage = this.customPackages.get(id);
    if (existingPackage) {
      const updatedPackage = {
        ...existingPackage,
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.customPackages.set(id, updatedPackage);
      return updatedPackage;
    }
    return void 0;
  }
  async deleteCustomPackage(id) {
    return this.customPackages.delete(id);
  }
};
var storage = new MemStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var replitDomains = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
var replId = process.env.REPL_ID || "ai-dajo-dev";
console.log("Replit Auth Config:", { replitDomains, replId });
var getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    console.log("OIDC Discovery:", { issuerUrl, replId });
    return await client.discovery(
      new URL(issuerUrl),
      replId
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      // development에서는 false로 설정
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  const domains = replitDomains.split(",");
  console.log("Setting up strategies for domains:", domains);
  for (const domain of domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    const hostname = req.hostname || "73780d3b-15c1-4bd1-a6e9-86a607340f17-00-2bgj4jhplmpnl.worf.replit.dev";
    console.log(`Login attempt with hostname: ${hostname}`);
    passport.authenticate(`replitauth:${hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname || "73780d3b-15c1-4bd1-a6e9-86a607340f17-00-2bgj4jhplmpnl.worf.replit.dev";
    console.log(`Callback attempt with hostname: ${hostname}`);
    passport.authenticate(`replitauth:${hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/googleAuth.ts
import dotenv from "dotenv";
import passport2 from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
dotenv.config();
var clientID = process.env.GOOGLE_CLIENT_ID;
var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
function setupGoogleAuth(app2) {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  const protocol = domain.includes("localhost") ? "http" : "https";
  const callbackURL = `${protocol}://${domain}/api/auth/google/callback`;
  console.log("Google OAuth callback URL:", callbackURL);
  passport2.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userData = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "",
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || ""
          };
          const user = await storage.upsertUser(userData);
          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, false);
        }
      }
    )
  );
  passport2.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport2.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  app2.get(
    "/api/auth/google",
    passport2.authenticate("google", {
      scope: ["profile", "email"]
    })
  );
  app2.get(
    "/api/auth/google/callback",
    passport2.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "\uB85C\uADF8\uC544\uC6C3 \uC2E4\uD328" });
      }
      req.session.destroy((err2) => {
        if (err2) {
          return res.status(500).json({ error: "\uC138\uC158 \uC0AD\uC81C \uC2E4\uD328" });
        }
        res.json({ success: true, message: "\uB85C\uADF8\uC544\uC6C3 \uC644\uB8CC" });
      });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
  console.log("Google OAuth setup completed");
}

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  setupGoogleAuth(app2);
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const { id, email, firstName, lastName, profileImageUrl } = req.body;
      const user = await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
        profileImageUrl
      });
      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });
  app2.get("/api/user/favorites", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
      if (!response.ok) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const googleUser = await response.json();
      const favorites = [
        { id: 1, name: "\uC601\uC0C1 \uC81C\uC791 \uD328\uD0A4\uC9C0", type: "bundle", userId: googleUser.id },
        { id: 2, name: "ChatGPT", type: "tool", userId: googleUser.id },
        { id: 3, name: "Midjourney", type: "tool", userId: googleUser.id }
      ];
      res.json(favorites);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ error: "Failed to get favorites" });
    }
  });
  app2.post("/api/user/favorites", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { itemId, itemType, itemName } = req.body;
      res.json({ success: true, message: "Added to favorites" });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });
  app2.delete("/api/user/favorites/:id", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { id } = req.params;
      res.json({ success: true, message: "Removed from favorites" });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });
  app2.get("/api/ai-tools", async (req, res) => {
    try {
      const { category, search } = req.query;
      let tools;
      if (search) {
        tools = await storage.searchAiTools(search);
      } else if (category && category !== "\uC804\uCCB4") {
        tools = await storage.getAiToolsByCategory(category);
      } else {
        tools = await storage.getAllAiTools();
      }
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI tools" });
    }
  });
  app2.get("/api/ai-tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getAiToolById(id);
      if (!tool) {
        return res.status(404).json({ error: "AI tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI tool" });
    }
  });
  app2.get("/api/ai-bundles", async (req, res) => {
    try {
      const bundles = await storage.getAllAiBundles();
      res.json(bundles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI bundles" });
    }
  });
  app2.get("/api/ai-bundles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bundle = await storage.getAiBundleById(id);
      if (!bundle) {
        return res.status(404).json({ error: "AI bundle not found" });
      }
      res.json(bundle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI bundle" });
    }
  });
  app2.get("/api/ai-bundles/:id/tools", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bundle = await storage.getAiBundleById(id);
      if (!bundle) {
        return res.status(404).json({ message: "Bundle not found" });
      }
      const tools = await storage.getAllAiTools();
      let bundleTools = [];
      if (id === 1) {
        bundleTools = tools.filter(
          (tool) => tool.category === "\uC601\uC0C1" || ["Runway ML", "Synthesia", "Descript", "DALL-E 3"].includes(tool.name)
        );
      } else if (id === 2) {
        bundleTools = tools.filter(
          (tool) => tool.category === "\uD14D\uC2A4\uD2B8" || ["ChatGPT", "Claude", "Jasper", "Copy.ai"].includes(tool.name)
        );
      } else if (id === 3) {
        bundleTools = tools.filter(
          (tool) => tool.category === "\uCF54\uB529" || ["GitHub Copilot", "Replit Ghostwriter", "Cursor", "Tabnine"].includes(tool.name)
        );
      }
      res.json(bundleTools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bundle tools: " + error.message });
    }
  });
  app2.get("/api/quiz/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuizQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });
  app2.post("/api/quiz/recommend", async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Invalid answers provided" });
      }
      const tools = await storage.getAllAiTools();
      const bundles = await storage.getAllAiBundles();
      let recommendations = [...tools];
      let scoreModifiers = {};
      recommendations.forEach((tool) => {
        scoreModifiers[tool.id] = 0;
      });
      for (const [questionKey, answer] of Object.entries(answers)) {
        recommendations.forEach((tool) => {
          if (questionKey === "q1") {
            if (answer === "work" && ["\uD14D\uC2A4\uD2B8", "\uC0DD\uC0B0\uC131", "\uB370\uC774\uD130\uBD84\uC11D", "\uCF54\uB529", "\uB9C8\uCF00\uD305"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "creative" && ["\uC774\uBBF8\uC9C0", "\uC601\uC0C1", "\uC74C\uC545", "\uB514\uC790\uC778", "\uD14D\uC2A4\uD2B8"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "learning" && ["\uD14D\uC2A4\uD2B8", "\uAD50\uC721", "\uCF54\uB529", "\uB370\uC774\uD130\uBD84\uC11D"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "personal" && ["\uAC74\uAC15", "\uC5EC\uD589", "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8", "\uC0DD\uC0B0\uC131"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            } else if (answer === "finance" && ["\uAE08\uC735", "\uB370\uC774\uD130\uBD84\uC11D", "\uD14D\uC2A4\uD2B8"].includes(tool.category)) {
              scoreModifiers[tool.id] += 25;
            }
          }
          if (questionKey === "q2") {
            const taskCategoryMap = {
              // 업무 관련
              "work_text": "\uD14D\uC2A4\uD2B8",
              "work_analysis": "\uB370\uC774\uD130\uBD84\uC11D",
              "work_automation": "\uC0DD\uC0B0\uC131",
              "work_coding": "\uCF54\uB529",
              "work_marketing": "\uB9C8\uCF00\uD305",
              // 창작 관련
              "creative_visual": "\uC774\uBBF8\uC9C0",
              "creative_video": "\uC601\uC0C1",
              "creative_music": "\uC74C\uC545",
              "creative_writing": "\uD14D\uC2A4\uD2B8",
              "creative_design": "\uB514\uC790\uC778",
              // 학습 관련
              "learning_language": "\uD14D\uC2A4\uD2B8",
              "learning_tech": "\uCF54\uB529",
              "learning_research": "\uD14D\uC2A4\uD2B8",
              "learning_skill": "\uAD50\uC721",
              "learning_academic": "\uAD50\uC721",
              // 일상 관련
              "personal_health": "\uAC74\uAC15",
              "personal_travel": "\uC5EC\uD589",
              "personal_entertainment": "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8",
              "personal_productivity": "\uC0DD\uC0B0\uC131",
              "personal_home": "\uC0DD\uC0B0\uC131",
              // 재정 관련
              "finance_investment": "\uAE08\uC735",
              "finance_budgeting": "\uAE08\uC735",
              "finance_business": "\uAE08\uC735",
              "finance_crypto": "\uAE08\uC735",
              "finance_planning": "\uAE08\uC735"
            };
            if (taskCategoryMap[answer] === tool.category) {
              scoreModifiers[tool.id] += 40;
            }
          }
          if (questionKey === "q4") {
            if (answer === "free" && tool.pricing === "free") {
              scoreModifiers[tool.id] += 15;
            } else if (answer === "freemium" && ["free", "freemium"].includes(tool.pricing)) {
              scoreModifiers[tool.id] += 12;
            } else if (answer === "paid" && tool.pricing !== "enterprise") {
              scoreModifiers[tool.id] += 8;
            }
          }
          if (questionKey === "q5") {
            if (answer === "beginner" && tool.rating >= 85) {
              scoreModifiers[tool.id] += 10;
            } else if (answer === "expert" && tool.rating >= 70) {
              scoreModifiers[tool.id] += 8;
            }
          }
        });
      }
      const scored = recommendations.map((tool) => ({
        ...tool,
        matchPercentage: Math.min(95, Math.max(50, tool.rating + scoreModifiers[tool.id]))
      })).sort((a, b) => b.matchPercentage - a.matchPercentage);
      const packageRecommendations = bundles.filter((bundle) => {
        const firstAnswer = answers["q1"];
        const secondAnswer = answers["q2"];
        if (firstAnswer === "creative" && ["\uC601\uC0C1 \uC81C\uC791", "\uB514\uC790\uC778", "\uD06C\uB9AC\uC5D0\uC774\uD130", "\uC18C\uC15C\uBBF8\uB514\uC5B4"].includes(bundle.category)) return true;
        if (firstAnswer === "work" && ["\uBE44\uC988\uB2C8\uC2A4", "\uB9C8\uCF00\uD305", "\uAC1C\uBC1C\uC790", "\uC0DD\uC0B0\uC131"].includes(bundle.category)) return true;
        if (firstAnswer === "personal" && ["\uAC74\uAC15 \uAD00\uB9AC", "\uC5EC\uD589", "\uC18C\uC15C\uBBF8\uB514\uC5B4", "\uC5D4\uD130\uD14C\uC778\uBA3C\uD2B8"].includes(bundle.category)) return true;
        if (firstAnswer === "finance" && ["\uD22C\uC790", "\uAE08\uC735", "\uBE44\uC988\uB2C8\uC2A4"].includes(bundle.category)) return true;
        if (firstAnswer === "learning" && ["\uAD50\uC721", "\uD559\uC2B5", "\uAC1C\uBC1C\uC790"].includes(bundle.category)) return true;
        if (secondAnswer === "personal_health" && bundle.category === "\uAC74\uAC15 \uAD00\uB9AC") return true;
        if (secondAnswer === "personal_travel" && bundle.category === "\uC5EC\uD589") return true;
        if (secondAnswer === "creative_video" && bundle.category === "\uC601\uC0C1 \uC81C\uC791") return true;
        if (secondAnswer === "work_marketing" && bundle.category === "\uB9C8\uCF00\uD305") return true;
        return false;
      }).slice(0, 5);
      res.json({
        tools: scored.slice(0, 10),
        packages: packageRecommendations
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });
  app2.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getUsageStats();
      const now = Date.now();
      const variance = Math.sin(now / 6e4) * 0.05;
      const baseTotal = stats.reduce((sum, stat) => sum + stat.totalUsers, 0);
      const totalUsers = Math.round(baseTotal * (1 + variance));
      const baseDailyUsers = Math.round(stats.reduce((sum, stat) => sum + stat.dailyActiveUsers, 0) / stats.length);
      const dailyActiveUsers = Math.round(baseDailyUsers * (1 + variance * 2));
      const avgSessionTime = Math.round(stats.reduce((sum, stat) => sum + stat.avgSessionTime, 0) / stats.length);
      const avgSatisfaction = stats.reduce((sum, stat) => sum + stat.satisfactionScore, 0) / stats.length / 10;
      const timeOffset = Math.floor(now / 1e4) % 4;
      const distributions = [
        [68, 18, 8, 6],
        [70, 16, 9, 5],
        [66, 20, 8, 6],
        [69, 17, 9, 5]
      ];
      const currentDist = distributions[timeOffset];
      res.json({
        totalUsers,
        dailyActiveUsers,
        avgSessionTime,
        satisfactionScore: Math.round(avgSatisfaction * 10) / 10,
        categoryDistribution: [
          { category: "\uD14D\uC2A4\uD2B8", percentage: currentDist[0], color: "blue" },
          { category: "\uC774\uBBF8\uC9C0", percentage: currentDist[1], color: "purple" },
          { category: "\uC601\uC0C1", percentage: currentDist[2], color: "red" },
          { category: "\uC74C\uC131", percentage: currentDist[3], color: "orange" }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/analytics/rankings", async (req, res) => {
    try {
      const rankings = await storage.getCategoryRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });
  app2.get("/api/analytics/popular", async (req, res) => {
    try {
      const tools = await storage.getAllAiTools();
      const now = Date.now();
      const toolsWithGrowth = tools.map((tool) => {
        const baseGrowth = Math.max(0, (tool.rating - 70) / 2);
        const randomFactor = Math.sin(now / 25e3 + tool.id) * 10;
        const growth = Math.round(baseGrowth + randomFactor + 5);
        return {
          ...tool,
          growth: Math.max(1, growth)
          // Ensure positive growth
        };
      });
      const trendingTools = toolsWithGrowth.sort((a, b) => b.growth - a.growth).slice(0, 20).map((tool, index2) => ({
        ...tool,
        rank: index2 + 1
      }));
      res.json(trendingTools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular tools" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: "client",
    // 👉 index.html이 있는 디렉토리를 명시해줘야 함
    plugins: [react()],
    define: {
      "import.meta.env": {
        VITE_FIREBASE_API_KEY: JSON.stringify(env.VITE_FIREBASE_API_KEY),
        VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(
          env.VITE_FIREBASE_AUTH_DOMAIN
        ),
        VITE_FIREBASE_PROJECT_ID: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        VITE_FIREBASE_STORAGE_BUCKET: JSON.stringify(
          env.VITE_FIREBASE_STORAGE_BUCKET
        ),
        VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
          env.VITE_FIREBASE_MESSAGING_SENDER_ID
        ),
        VITE_FIREBASE_APP_ID: JSON.stringify(env.VITE_FIREBASE_APP_ID),
        VITE_FIREBASE_MEASUREMENT_ID: JSON.stringify(
          env.VITE_FIREBASE_MEASUREMENT_ID
        )
      }
    }
  };
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session2({
  secret: process.env.SESSION_SECRET || "your-session-secret-here",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24시간
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`Client root: ${path2.resolve(__dirname, "../client")}`);
  });
})();
