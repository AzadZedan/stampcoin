import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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
      headers: {
        origin: "https://example.com",
      },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("payments.createCheckout", () => {
  it("creates a checkout session for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.createCheckout({
      stampId: 1,
      productId: "COMMON_STAMP",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
    expect(result.url).toContain("checkout.stripe.com");
  });

  it("throws error for invalid product ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payments.createCheckout({
        stampId: 1,
        productId: "INVALID_PRODUCT",
      })
    ).rejects.toThrow("Product not found");
  });
});
