import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for stamp classification
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  nameDe: varchar("nameDe", { length: 100 }),
  nameFr: varchar("nameFr", { length: 100 }),
  nameEs: varchar("nameEs", { length: 100 }),
  nameZh: varchar("nameZh", { length: 100 }),
  nameKo: varchar("nameKo", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Stamps table for digital stamp NFTs
 */
export const stamps = mysqlTable("stamps", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  titleAr: varchar("titleAr", { length: 200 }),
  titleDe: varchar("titleDe", { length: 200 }),
  titleFr: varchar("titleFr", { length: 200 }),
  titleEs: varchar("titleEs", { length: 200 }),
  titleZh: varchar("titleZh", { length: 200 }),
  titleKo: varchar("titleKo", { length: 200 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  descriptionDe: text("descriptionDe"),
  descriptionFr: text("descriptionFr"),
  descriptionEs: text("descriptionEs"),
  descriptionZh: text("descriptionZh"),
  descriptionKo: text("descriptionKo"),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 500 }),
  categoryId: int("categoryId").notNull(),
  country: varchar("country", { length: 100 }),
  year: int("year"),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "very_rare", "legendary"]).default("common").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  ownerId: int("ownerId"),
  authenticatedBy: varchar("authenticatedBy", { length: 200 }),
  authenticationDate: timestamp("authenticationDate"),
  mintNumber: int("mintNumber"),
  totalMinted: int("totalMinted"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Stamp = typeof stamps.$inferSelect;
export type InsertStamp = typeof stamps.$inferInsert;

/**
 * Transactions table for stamp purchases
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  stampId: int("stampId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  transactionHash: varchar("transactionHash", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Favorites table for user's favorite stamps
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stampId: int("stampId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Contact messages table
 */
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 300 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Reviews table for stamp ratings and feedback
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  stampId: int("stampId").notNull().references(() => stamps.id, { onDelete: 'cascade' }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Partners table for tracking partners and supporters
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar("companyName", { length: 200 }).notNull(),
  companyNameAr: varchar("companyNameAr", { length: 200 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  website: varchar("website", { length: 500 }),
  logo: text("logo"),
  logoKey: varchar("logoKey", { length: 500 }),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum", "diamond"]).notNull(),
  totalInvestment: decimal("totalInvestment", { precision: 15, scale: 2 }).notNull(),
  investmentDate: timestamp("investmentDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active", "inactive"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvalDate: timestamp("approvalDate"),
  benefits: text("benefits"),
  contactPerson: varchar("contactPerson", { length: 200 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Partner Benefits table for tracking partner perks and rewards
 */
export const partnerBenefits = mysqlTable("partnerBenefits", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partners.id, { onDelete: 'cascade' }),
  benefitType: mysqlEnum("benefitType", ["discount", "commission", "feature", "support", "branding", "exclusive_access"]).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  value: varchar("value", { length: 200 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerBenefit = typeof partnerBenefits.$inferSelect;
export type InsertPartnerBenefit = typeof partnerBenefits.$inferInsert;

/**
 * Partner Transactions table for tracking partner purchases and commissions
 */
export const partnerTransactions = mysqlTable("partnerTransactions", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partners.id, { onDelete: 'cascade' }),
  transactionId: int("transactionId").references(() => transactions.id),
  type: mysqlEnum("type", ["purchase", "commission", "reward", "refund"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PartnerTransaction = typeof partnerTransactions.$inferSelect;
export type InsertPartnerTransaction = typeof partnerTransactions.$inferInsert;
