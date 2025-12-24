import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stamps, categories, transactions, favorites, contactMessages, reviews, partners, partnerBenefits, partnerTransactions, InsertStamp, InsertCategory, InsertTransaction, InsertFavorite, InsertContactMessage, InsertReview, InsertPartner, InsertPartnerBenefit, InsertPartnerTransaction, Partner } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Operations ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Category Operations ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(category);
  return result;
}

// ============ Stamp Operations ============

export async function getAllStamps(params?: {
  search?: string;
  categoryId?: number;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(stamps);

  const conditions = [];

  if (params?.search) {
    conditions.push(
      or(
        like(stamps.title, `%${params.search}%`),
        like(stamps.country, `%${params.search}%`),
        like(stamps.description, `%${params.search}%`)
      )
    );
  }

  if (params?.categoryId) {
    conditions.push(eq(stamps.categoryId, params.categoryId));
  }

  if (params?.rarity) {
    conditions.push(sql`${stamps.rarity} = ${params.rarity}`);
  }

  if (params?.minPrice) {
    conditions.push(sql`${stamps.price} >= ${params.minPrice}`);
  }

  if (params?.maxPrice) {
    conditions.push(sql`${stamps.price} <= ${params.maxPrice}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(stamps.createdAt)) as any;

  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }

  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }

  return await query;
}

export async function getStampById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stamps).where(eq(stamps.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStamp(stamp: InsertStamp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stamps).values(stamp);
  return result;
}

export async function updateStamp(id: number, stamp: Partial<InsertStamp>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(stamps).set(stamp).where(eq(stamps.id, id));
  return result;
}

export async function deleteStamp(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.delete(stamps).where(eq(stamps.id, id));
  return result;
}

// ============ Transaction Operations ============

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(or(eq(transactions.buyerId, userId), eq(transactions.sellerId, userId)))
    .orderBy(desc(transactions.createdAt));
}

export async function getStampTransactions(stampId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.stampId, stampId))
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(transactions).values(transaction);
  return result;
}

// ============ Favorite Operations ============

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}

export async function isFavorite(userId: number, stampId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.stampId, stampId)))
    .limit(1);

  return result.length > 0;
}

export async function addFavorite(favorite: InsertFavorite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(favorites).values(favorite);
  return result;
}

export async function removeFavorite(userId: number, stampId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.stampId, stampId)));
  return result;
}

// ============ Contact Message Operations ============

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactMessages).values(message);
  return result;
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(contactMessages)
    .set({ status: 'read' })
    .where(eq(contactMessages.id, id));
  return result;
}

// ============ Review Operations ============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(reviews).values(review);
  return result;
}

export async function getStampReviews(stampId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.stampId, stampId))
    .orderBy(desc(reviews.createdAt));
  
  return result;
}

export async function getUserReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
  
  return result;
}

export async function getStampAverageRating(stampId: number): Promise<{ average: number; count: number }> {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const result = await db
    .select({
      average: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.stampId, stampId));
  
  return {
    average: result[0]?.average ? Number(result[0].average) : 0,
    count: result[0]?.count ? Number(result[0].count) : 0,
  };
}


// ============ Partner Operations ============

export async function createPartner(partner: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(partners).values(partner);
  return result;
}

export async function getPartnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPartnerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(partners).where(eq(partners.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPartners(status?: string) {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return await db
      .select()
      .from(partners)
      .where(eq(partners.status, status as any))
      .orderBy(desc(partners.totalInvestment));
  }
  
  return await db
    .select()
    .from(partners)
    .orderBy(desc(partners.totalInvestment));
}

export async function getPartnersByTier(tier: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(partners)
    .where(and(eq(partners.tier, tier as any), eq(partners.status, 'active')))
    .orderBy(desc(partners.totalInvestment));
}

export async function updatePartner(id: number, partner: Partial<InsertPartner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(partners).set(partner).where(eq(partners.id, id));
  return result;
}

export async function approvePartner(id: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(partners)
    .set({
      status: 'approved',
      approvedBy,
      approvalDate: new Date(),
    })
    .where(eq(partners.id, id));
  return result;
}

export async function rejectPartner(id: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(partners)
    .set({
      status: 'rejected',
      approvedBy,
      approvalDate: new Date(),
    })
    .where(eq(partners.id, id));
  return result;
}

// ============ Partner Benefits Operations ============

export async function createPartnerBenefit(benefit: InsertPartnerBenefit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(partnerBenefits).values(benefit);
  return result;
}

export async function getPartnerBenefits(partnerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(partnerBenefits)
    .where(and(eq(partnerBenefits.partnerId, partnerId), eq(partnerBenefits.isActive, true)))
    .orderBy(desc(partnerBenefits.createdAt));
}

export async function deletePartnerBenefit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.delete(partnerBenefits).where(eq(partnerBenefits.id, id));
  return result;
}

// ============ Partner Transaction Operations ============

export async function createPartnerTransaction(transaction: InsertPartnerTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(partnerTransactions).values(transaction);
  return result;
}

export async function getPartnerTransactions(partnerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(partnerTransactions)
    .where(eq(partnerTransactions.partnerId, partnerId))
    .orderBy(desc(partnerTransactions.createdAt));
}

export async function getPartnerTotalEarnings(partnerId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({
      total: sql<number>`SUM(${partnerTransactions.amount})`,
    })
    .from(partnerTransactions)
    .where(and(eq(partnerTransactions.partnerId, partnerId), eq(partnerTransactions.status, 'completed')));

  return result[0]?.total ? Number(result[0].total) : 0;
}

export async function updatePartnerTransaction(id: number, transaction: Partial<InsertPartnerTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(partnerTransactions).set(transaction).where(eq(partnerTransactions.id, id));
  return result;
}
