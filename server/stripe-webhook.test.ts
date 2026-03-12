import { vi, describe, expect, it, beforeEach } from "vitest";
import type { Request, Response } from "express";

// Mock Stripe before importing the webhook handler
const mockConstructEvent = vi.fn();
vi.mock("stripe", () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }));
  return { default: MockStripe };
});

import { handleStripeWebhook } from "./stripe-webhook";

function createMockReq(options: {
  signature?: string | null;
  body?: Buffer | string;
} = {}): Request {
  const headers: Record<string, string> = {};
  if (options.signature !== undefined && options.signature !== null) {
    headers["stripe-signature"] = options.signature;
  }
  return {
    headers,
    body: options.body ?? Buffer.from("{}"),
  } as unknown as Request;
}

// Convenience builder that always includes a valid-looking signature
function createMockReqWithSig(body?: Buffer | string): Request {
  return createMockReq({ signature: "test-sig", body });
}

function createMockRes() {
  const state = {
    statusCode: 200,
    body: undefined as unknown,
    statusCalled: false,
  };
  const res = {
    status(code: number) {
      state.statusCode = code;
      state.statusCalled = true;
      return res;
    },
    json(data: unknown) {
      state.body = data;
      return res;
    },
  } as unknown as Response;
  return { res, state };
}

// Helper that builds a minimal Stripe event object
function makeEvent(
  type: string,
  object: unknown,
  id = "evt_live_123"
): Record<string, unknown> {
  return {
    id,
    type,
    created: Math.floor(Date.now() / 1000),
    data: { object },
  };
}

describe("handleStripeWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";
  });

  // ── Signature validation ──────────────────────────────────────────────────

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = createMockReq();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCode).toBe(400);
    expect(mock.state.body).toMatchObject({ error: "Missing Stripe signature" });
  });

  it("returns error when signature verification fails (invalid signature)", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Signature verification failed");
    });

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCode).toBe(401);
    expect(mock.state.body).toMatchObject({ error: "Invalid webhook signature" });
  });

  it("returns 400 when Stripe reports no signature header in event construction", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signature found in headers");
    });

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCode).toBe(400);
    expect(mock.state.body).toMatchObject({ error: "Missing Stripe signature header" });
  });

  // ── Test events ───────────────────────────────────────────────────────────

  it("returns verified:true for test events (evt_test_ prefix)", async () => {
    const event = makeEvent("checkout.session.completed", {}, "evt_test_abc");
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({ verified: true, message: "Test event received" });
  });

  // ── checkout.session.completed ────────────────────────────────────────────

  it("processes checkout.session.completed successfully", async () => {
    const session = {
      id: "cs_test_abc",
      metadata: { user_id: "42", stamp_id: "7", payment_method: "card" },
      amount_total: 1000,
      currency: "usd",
      customer_email: "buyer@example.com",
    };
    const event = makeEvent("checkout.session.completed", session);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "checkout.session.completed",
      result: { success: true, message: "Checkout session processed successfully" },
    });
  });

  it("returns 500 when checkout session is missing required metadata", async () => {
    const session = {
      id: "cs_test_missing_meta",
      metadata: {},
      amount_total: 500,
      currency: "usd",
      customer_email: null,
    };
    const event = makeEvent("checkout.session.completed", session);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCode).toBe(500);
    expect(mock.state.body).toMatchObject({
      error: "Missing required metadata (user_id or stamp_id)",
    });
  });

  // ── payment_intent.succeeded ──────────────────────────────────────────────

  it("processes payment_intent.succeeded successfully", async () => {
    const paymentIntent = {
      id: "pi_test_abc",
      amount: 2000,
      currency: "usd",
      status: "succeeded",
      client_secret: null,
    };
    const event = makeEvent("payment_intent.succeeded", paymentIntent);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "payment_intent.succeeded",
      result: { success: true, message: "Payment processed successfully" },
    });
  });

  // ── payment_intent.payment_failed ─────────────────────────────────────────

  it("processes payment_intent.payment_failed successfully", async () => {
    const paymentIntent = {
      id: "pi_test_failed",
      amount: 2000,
      currency: "usd",
      last_payment_error: { message: "Your card was declined." },
    };
    const event = makeEvent("payment_intent.payment_failed", paymentIntent);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "payment_intent.payment_failed",
      result: { success: true, message: "Payment failure processed" },
    });
  });

  // ── charge.refunded ───────────────────────────────────────────────────────

  it("processes charge.refunded successfully", async () => {
    const charge = {
      id: "ch_test_abc",
      amount: 1000,
      amount_refunded: 1000,
      refunded: true,
    };
    const event = makeEvent("charge.refunded", charge);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "charge.refunded",
      result: { success: true, message: "Refund processed" },
    });
  });

  // ── charge.dispute.created ────────────────────────────────────────────────

  it("processes charge.dispute.created successfully", async () => {
    const dispute = {
      id: "dp_test_abc",
      charge: "ch_test_abc",
      amount: 1000,
      reason: "fraudulent",
      status: "warning_needs_response",
    };
    const event = makeEvent("charge.dispute.created", dispute);
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "charge.dispute.created",
      result: { success: true, message: "Dispute logged" },
    });
  });

  // ── Unhandled event type ──────────────────────────────────────────────────

  it("acknowledges unhandled event types without error", async () => {
    const event = makeEvent("customer.created", { id: "cus_abc" });
    mockConstructEvent.mockReturnValue(event);

    const req = createMockReqWithSig();
    const mock = createMockRes();

    await handleStripeWebhook(req, mock.res);

    expect(mock.state.statusCalled).toBe(false);
    expect(mock.state.body).toMatchObject({
      received: true,
      eventType: "customer.created",
      result: { success: true },
    });
  });
});
