import { vi, describe, expect, it, beforeAll } from "vitest";

vi.mock("stripe", () => {
  const mockSessionCreate = vi.fn().mockResolvedValue({
    id: "cs_test_mock_session_123",
    url: "https://checkout.stripe.com/pay/cs_test_mock_session_123",
    payment_status: "unpaid",
    customer_email: null,
    metadata: {},
  });
  const mockSessionRetrieve = vi.fn().mockResolvedValue({
    id: "cs_test_mock_session_123",
    payment_status: "paid",
    customer_email: "sample@example.com",
    metadata: { user_id: "1", stamp_id: "1" },
  });
  const MockStripe = vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: mockSessionCreate, retrieve: mockSessionRetrieve },
    },
  }));
  return { default: MockStripe };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_tests";
});

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

describe("payments.validateCheckout", () => {
  it("returns payment status for a valid session", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.validateCheckout({
      sessionId: "cs_test_mock_session_123",
    });

    expect(result).toHaveProperty("paymentStatus");
    expect(result.paymentStatus).toBe("paid");
    expect(result.customerEmail).toBe("sample@example.com");
  });

  it("throws error for invalid session ID", async () => {
    const { default: MockStripe } = await import("stripe");
    const instance = (MockStripe as any).mock.results[0].value;
    instance.checkout.sessions.retrieve.mockRejectedValueOnce(
      new Error("No such checkout.session")
    );

    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payments.validateCheckout({ sessionId: "invalid_session" })
    ).rejects.toThrow("Invalid session ID");
  });
});
