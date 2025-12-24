import { describe, expect, it } from "vitest";
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

describe("stamps API", () => {
  it("should list stamps without authentication", async () => {
    const publicCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.stamps.list({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get categories without authentication", async () => {
    const publicCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(publicCtx);
    const result = await caller.categories.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should require authentication to add favorite", async () => {
    const publicCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(publicCtx);

    await expect(
      caller.favorites.add({ stampId: 1 })
    ).rejects.toThrow();
  });

  it("should allow authenticated user to check favorites", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorites.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("contact API", () => {
  it("should allow sending contact message without authentication", async () => {
    const publicCtx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(publicCtx);
    
    const result = await caller.contact.send({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test message content"
    });

    expect(result).toBeDefined();
  });

  it("should require admin role to view all messages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.list()
    ).rejects.toThrow("Unauthorized");
  });
});
