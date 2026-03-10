import { relations } from "drizzle-orm";
import {
  users,
  categories,
  stamps,
  transactions,
  favorites,
  reviews,
  partners,
  partnerBenefits,
  partnerTransactions,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  stamps: many(stamps),
  reviews: many(reviews),
  favorites: many(favorites),
  partners: many(partners),
  buyerTransactions: many(transactions, { relationName: "buyerTransactions" }),
  sellerTransactions: many(transactions, { relationName: "sellerTransactions" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  stamps: many(stamps),
}));

export const stampsRelations = relations(stamps, ({ one, many }) => ({
  category: one(categories, {
    fields: [stamps.categoryId],
    references: [categories.id],
  }),
  owner: one(users, {
    fields: [stamps.ownerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  favorites: many(favorites),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  stamp: one(stamps, {
    fields: [transactions.stampId],
    references: [stamps.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "buyerTransactions",
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
    relationName: "sellerTransactions",
  }),
  partnerTransactions: many(partnerTransactions),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  stamp: one(stamps, {
    fields: [favorites.stampId],
    references: [stamps.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  stamp: one(stamps, {
    fields: [reviews.stampId],
    references: [stamps.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  benefits: many(partnerBenefits),
  transactions: many(partnerTransactions),
}));

export const partnerBenefitsRelations = relations(partnerBenefits, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerBenefits.partnerId],
    references: [partners.id],
  }),
}));

export const partnerTransactionsRelations = relations(partnerTransactions, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerTransactions.partnerId],
    references: [partners.id],
  }),
  transaction: one(transactions, {
    fields: [partnerTransactions.transactionId],
    references: [transactions.id],
  }),
}));
