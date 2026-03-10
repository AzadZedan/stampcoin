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
        createdAt: new Date("2025-01-01"),
        userName: "Test User",
        userEmail: "test@example.com",
      },
    ]),
    getUserReviews: vi.fn().mockResolvedValue([
      {
        id: 1,
        stampId: 1,
        userId: 1,
        rating: 4,
        comment: "Nice collection piece",
        createdAt: new Date("2025-01-01"),
      },
    ]),
    getStampAverageRating: vi.fn().mockResolvedValue({ average: 4.5, count: 2 }),
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): TrpcContext {
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

describe("reviews API", () => {
  it("should require authentication to create a review", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 5, comment: "Great stamp!" })
    ).rejects.toThrow();
  });

  it("should allow authenticated user to create a review", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.create({
      stampId: 1,
      rating: 5,
      comment: "Beautiful stamp!",
    });

    expect(result).toBeDefined();
  });

  it("should allow creating a review without a comment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.create({ stampId: 2, rating: 3 });

    expect(result).toBeDefined();
  });

  it("should get reviews for a stamp without authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.reviews.getStampReviews({ stampId: 1 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("rating");
    expect(result[0]).toHaveProperty("userName");
  });

  it("should get average rating for a stamp without authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.reviews.getStampRating({ stampId: 1 });

    expect(result).toHaveProperty("average");
    expect(result).toHaveProperty("count");
    expect(typeof result.average).toBe("number");
    expect(typeof result.count).toBe("number");
  });

  it("should require authentication to get user reviews", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.reviews.myReviews()).rejects.toThrow();
  });

  it("should return user reviews for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.myReviews();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("rating");
  });

  it("should validate rating is between 1 and 5", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Invalid ratings should throw
    await expect(
      caller.reviews.create({ stampId: 1, rating: 0 })
    ).rejects.toThrow();

    await expect(
      caller.reviews.create({ stampId: 1, rating: 6 })
    ).rejects.toThrow();

    // Valid boundary ratings should succeed
    await expect(
      caller.reviews.create({ stampId: 1, rating: 1 })
    ).resolves.toBeDefined();

    await expect(
      caller.reviews.create({ stampId: 1, rating: 5 })
    ).resolves.toBeDefined();
  });
});
