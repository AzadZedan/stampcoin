import { vi, describe, expect, it } from "vitest";

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createReview: vi.fn().mockResolvedValue({ affectedRows: 1 }),
    getStampReviews: vi.fn().mockResolvedValue([
      {
        id: 1,
        rating: 5,
        comment: "Beautiful stamp!",
        createdAt: new Date("2024-01-01"),
        userName: "Test User",
        userEmail: "test@example.com",
      },
    ]),
    getStampAverageRating: vi.fn().mockResolvedValue({ average: 4.5, count: 2 }),
    getUserReviews: vi.fn().mockResolvedValue([
      {
        id: 1,
        stampId: 1,
        userId: 1,
        rating: 5,
        comment: "Beautiful stamp!",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]),
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("reviews API", () => {
  it("should get stamp reviews without authentication", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.reviews.getStampReviews({ stampId: 1 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("rating");
    expect(result[0]).toHaveProperty("comment");
  });

  it("should get stamp rating without authentication", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.reviews.getStampRating({ stampId: 1 });

    expect(result).toHaveProperty("average");
    expect(result).toHaveProperty("count");
    expect(result.average).toBe(4.5);
    expect(result.count).toBe(2);
  });

  it("should require authentication to create a review", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 5, comment: "Great stamp!" })
    ).rejects.toThrow();
  });

  it("should allow authenticated user to create a review", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.reviews.create({
      stampId: 1,
      rating: 4,
      comment: "Nice stamp!",
    });

    expect(result).toBeDefined();
  });

  it("should allow creating a review without a comment", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.reviews.create({
      stampId: 1,
      rating: 3,
    });

    expect(result).toBeDefined();
  });

  it("should require authentication to get my reviews", async () => {
    const caller = appRouter.createCaller(createPublicCtx());

    await expect(caller.reviews.myReviews()).rejects.toThrow();
  });

  it("should return reviews for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.reviews.myReviews();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("rating");
    expect(result[0]).toHaveProperty("stampId");
  });

  it("should reject review with rating below 1", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 0 })
    ).rejects.toThrow();
  });

  it("should reject review with rating above 5", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 6 })
    ).rejects.toThrow();
  });
});
