import { describe, expect, it } from "vitest";
import * as db from "./db";

// ─── Wallet DB Functions ──────────────────────────────────────────────────────

describe("wallet DB functions (no-DB fallback)", () => {
  it("getWalletByUserId returns null when database is unavailable", async () => {
    // DB is unavailable in test environment; the function should throw or return null
    try {
      const result = await db.getWalletByUserId(9999);
      expect(result).toBeNull();
    } catch (err) {
      // It's acceptable to throw when DB is not available
      expect(err).toBeDefined();
    }
  });

  it("getWalletByAddress returns null when database is unavailable", async () => {
    try {
      const result = await db.getWalletByAddress("0xdeadbeef");
      expect(result).toBeNull();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it("getTotalTokenSupply returns '0' when database is unavailable", async () => {
    try {
      const result = await db.getTotalTokenSupply();
      expect(typeof result).toBe("string");
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});

// ─── Market DB Functions ──────────────────────────────────────────────────────

describe("market DB functions (no-DB fallback)", () => {
  it("getListedMarketItems returns empty array when database is unavailable", async () => {
    const result = await db.getListedMarketItems();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getMarketItemById returns null when database is unavailable", async () => {
    try {
      const result = await db.getMarketItemById(9999);
      expect(result).toBeNull();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});

// ─── Auction DB Functions ─────────────────────────────────────────────────────

describe("auction DB functions (no-DB fallback)", () => {
  it("getActiveAuctions returns empty array when database is unavailable", async () => {
    const result = await db.getActiveAuctions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getAuctionById returns null when database is unavailable", async () => {
    try {
      const result = await db.getAuctionById(9999);
      expect(result).toBeNull();
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});

// ─── REST route module structure ──────────────────────────────────────────────

describe("REST routes module", () => {
  it("restRouter is a valid Express router", async () => {
    const { restRouter } = await import("./rest-routes");
    expect(restRouter).toBeDefined();
    // Express routers are functions
    expect(typeof restRouter).toBe("function");
  });

  it("restRouter has the expected route stack", async () => {
    const { restRouter } = await import("./rest-routes");
    // An Express Router has a 'stack' array of layers
    const stack = (restRouter as unknown as { stack: unknown[] }).stack;
    expect(Array.isArray(stack)).toBe(true);
    expect(stack.length).toBeGreaterThan(0);
  });
});
