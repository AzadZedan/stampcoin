/**
 * Tests for the market module.
 * File system is mocked so tests run without touching disk.
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

let mockMarketStore;

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockImplementation(filePath => {
      // Simulate the market data file always existing after first write
      return String(filePath).includes("market-data")
        ? !!mockMarketStore
        : false;
    }),
    readFileSync: vi.fn().mockImplementation(filePath => {
      if (String(filePath).includes("market-data")) {
        return JSON.stringify(
          mockMarketStore || { items: [], transactions: [] }
        );
      }
      return "{}";
    }),
    writeFileSync: vi.fn().mockImplementation((filePath, data) => {
      if (String(filePath).includes("market-data")) {
        mockMarketStore = JSON.parse(data);
      }
    }),
  },
}));

describe("market module", () => {
  let marketModule;

  beforeEach(async () => {
    mockMarketStore = { items: [], transactions: [] };
    vi.resetModules();
    marketModule = await import("../market.js");
  });

  // --- addMarketItem ---
  describe("addMarketItem", () => {
    test("adds an item with required fields", () => {
      const item = marketModule.addMarketItem("seller1", {
        name: "Blue Penny",
        price: 100,
      });
      expect(item.id).toBeDefined();
      expect(item.sellerId).toBe("seller1");
      expect(item.name).toBe("Blue Penny");
      expect(item.price).toBe(100);
      expect(item.status).toBe("available");
    });

    test("defaults missing optional fields", () => {
      const item = marketModule.addMarketItem("seller1", {
        name: "Test Stamp",
      });
      expect(item.description).toBe("");
      expect(item.price).toBe(0);
      expect(item.type).toBe("stamp");
      expect(item.imageUrl).toBe("");
    });

    test("throws when sellerId is missing", () => {
      expect(() => marketModule.addMarketItem(null, { name: "x" })).toThrow();
    });

    test("throws when item name is missing", () => {
      expect(() => marketModule.addMarketItem("seller1", {})).toThrow();
    });
  });

  // --- getAllMarketItems ---
  describe("getAllMarketItems", () => {
    beforeEach(() => {
      marketModule.addMarketItem("s1", {
        name: "Stamp A",
        type: "stamp",
        price: 50,
      });
      marketModule.addMarketItem("s2", {
        name: "Coin B",
        type: "coin",
        price: 200,
      });
    });

    test("returns all items with no filter", () => {
      const items = marketModule.getAllMarketItems();
      expect(items.length).toBe(2);
    });

    test("filters by type", () => {
      const items = marketModule.getAllMarketItems({ type: "coin" });
      expect(items.length).toBe(1);
      expect(items[0].name).toBe("Coin B");
    });

    test("filters by status", () => {
      const allItems = marketModule.getAllMarketItems();
      const id = allItems[0].id;
      // purchase to mark as sold (no wallet check inside market module)
      marketModule.purchaseMarketItem(id, "buyer1");
      const available = marketModule.getAllMarketItems({ status: "available" });
      expect(available.length).toBe(1);
    });
  });

  // --- getMarketItem ---
  describe("getMarketItem", () => {
    test("returns item by id", () => {
      const created = marketModule.addMarketItem("s1", { name: "Stamp X" });
      const fetched = marketModule.getMarketItem(created.id);
      expect(fetched.name).toBe("Stamp X");
    });

    test("throws for unknown id", () => {
      expect(() => marketModule.getMarketItem("nonexistent-id")).toThrow(
        "Market item not found"
      );
    });
  });

  // --- updateMarketItem ---
  describe("updateMarketItem", () => {
    test("updates allowed fields", () => {
      const item = marketModule.addMarketItem("s1", {
        name: "Old Name",
        price: 10,
      });
      const updated = marketModule.updateMarketItem(item.id, {
        price: 99,
        description: "Updated",
      });
      expect(updated.price).toBe(99);
      expect(updated.description).toBe("Updated");
    });

    test("throws for unknown id", () => {
      expect(() =>
        marketModule.updateMarketItem("bad-id", { price: 1 })
      ).toThrow("Market item not found");
    });
  });

  // --- purchaseMarketItem ---
  describe("purchaseMarketItem", () => {
    test("marks item as sold and records transaction", () => {
      const item = marketModule.addMarketItem("seller1", {
        name: "Stamp",
        price: 50,
      });
      const result = marketModule.purchaseMarketItem(item.id, "buyer1");
      expect(result.transaction.buyerId).toBe("buyer1");
      expect(result.transaction.sellerId).toBe("seller1");
      expect(result.transaction.price).toBe(50);
      // Item should now be sold
      expect(() => marketModule.purchaseMarketItem(item.id, "buyer2")).toThrow(
        "not available"
      );
    });

    test("throws when buyer is the seller", () => {
      const item = marketModule.addMarketItem("user1", {
        name: "Stamp",
        price: 10,
      });
      expect(() => marketModule.purchaseMarketItem(item.id, "user1")).toThrow(
        "Cannot purchase your own item"
      );
    });
  });

  // --- removeMarketItem ---
  describe("removeMarketItem", () => {
    test("removes item when called by the seller", () => {
      const item = marketModule.addMarketItem("seller1", { name: "Stamp" });
      const result = marketModule.removeMarketItem(item.id, "seller1");
      expect(result.success).toBe(true);
      expect(marketModule.getAllMarketItems().length).toBe(0);
    });

    test("throws when called by non-seller", () => {
      const item = marketModule.addMarketItem("seller1", { name: "Stamp" });
      expect(() => marketModule.removeMarketItem(item.id, "hacker")).toThrow(
        "Only the seller"
      );
    });

    test("throws for unknown item", () => {
      expect(() => marketModule.removeMarketItem("bad-id", "s1")).toThrow(
        "Market item not found"
      );
    });
  });

  // --- getMarketTransactions ---
  describe("getMarketTransactions", () => {
    test("returns all transactions without filter", () => {
      const item = marketModule.addMarketItem("seller1", {
        name: "Stamp",
        price: 10,
      });
      marketModule.purchaseMarketItem(item.id, "buyer1");
      const txns = marketModule.getMarketTransactions();
      expect(txns.length).toBe(1);
    });

    test("filters by buyerId", () => {
      const item1 = marketModule.addMarketItem("seller1", {
        name: "Stamp 1",
        price: 10,
      });
      const item2 = marketModule.addMarketItem("seller1", {
        name: "Stamp 2",
        price: 20,
      });
      marketModule.purchaseMarketItem(item1.id, "buyer1");
      marketModule.purchaseMarketItem(item2.id, "buyer2");
      const txns = marketModule.getMarketTransactions({ buyerId: "buyer1" });
      expect(txns.length).toBe(1);
      expect(txns[0].buyerId).toBe("buyer1");
    });
  });
});
