import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.getStampReviews({ stampId: 1 });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((review) => {
      expect(review).toHaveProperty("id");
      expect(review).toHaveProperty("rating");
      expect(review).toHaveProperty("createdAt");
    });
  });

  it("should get stamp rating without authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.getStampRating({ stampId: 1 });

    expect(result).toHaveProperty("average");
    expect(result).toHaveProperty("count");
    expect(typeof result.average).toBe("number");
    expect(typeof result.count).toBe("number");
    expect(result.average).toBeGreaterThanOrEqual(0);
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("should require authentication to create a review", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 5, comment: "Great stamp!" })
    ).rejects.toThrow();
  });

  it("should require authentication to get own reviews", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.reviews.myReviews()).rejects.toThrow();
  });

  it("should allow authenticated user to retrieve their own reviews", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.reviews.myReviews();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should reject rating below minimum (< 1)", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 0 })
    ).rejects.toThrow();
  });

  it("should reject rating above maximum (> 5)", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 6 })
    ).rejects.toThrow();
  });

  it("should accept boundary rating values (1 and 5)", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    // Boundary values should pass Zod validation and only fail at DB layer
    const err1 = await caller.reviews
      .create({ stampId: 1, rating: 1 })
      .catch((e: Error) => e);
    expect(err1).toBeInstanceOf(Error);
    expect((err1 as Error).message).not.toMatch(/too_small|too_big|Invalid/i);

    const err5 = await caller.reviews
      .create({ stampId: 1, rating: 5 })
      .catch((e: Error) => e);
    expect(err5).toBeInstanceOf(Error);
    expect((err5 as Error).message).not.toMatch(/too_small|too_big|Invalid/i);
  });
});
