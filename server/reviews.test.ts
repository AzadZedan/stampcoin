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

describe("reviews API", () => {
  it("should get stamp reviews without authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.getStampReviews({ stampId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get stamp rating without authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.getStampRating({ stampId: 1 });

    expect(result).toHaveProperty("average");
    expect(result).toHaveProperty("count");
    expect(typeof result.average).toBe("number");
    expect(typeof result.count).toBe("number");
  });

  it("should require authentication to create a review", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.reviews.create({ stampId: 1, rating: 5, comment: "Great stamp!" })
    ).rejects.toThrow();
  });

  it("should require authentication to list own reviews", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.reviews.myReviews()).rejects.toThrow();
  });

  it("should allow authenticated user to list their reviews", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.myReviews();

    expect(Array.isArray(result)).toBe(true);
  });
});
