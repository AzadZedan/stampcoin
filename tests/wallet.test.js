/**
 * Tests for the wallet module.
 * File system is mocked so tests run without touching disk.
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

let mockWalletStore;
let mockTxStore;

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockImplementation((filePath) => {
      const p = String(filePath);
      if (p.includes("wallets")) return JSON.stringify(mockWalletStore);
      if (p.includes("transactions")) return JSON.stringify(mockTxStore);
      return "{}";
    }),
    writeFileSync: vi.fn().mockImplementation((filePath, data) => {
      const p = String(filePath);
      if (p.includes("wallets")) mockWalletStore = JSON.parse(data);
      if (p.includes("transactions")) mockTxStore = JSON.parse(data);
    }),
  },
}));

describe("wallet module", () => {
  let walletModule;

  beforeEach(async () => {
    mockWalletStore = {};
    mockTxStore = [];
    vi.resetModules();
    // Re-import after resetting modules so initializeStorage runs fresh
    walletModule = await import("../wallet.js");
  });

  // --- createWallet ---
  describe("createWallet", () => {
    test("creates a wallet with correct initial state", () => {
      const w = walletModule.createWallet("user1", "Alice");
      expect(w.userId).toBe("user1");
      expect(w.userName).toBe("Alice");
      expect(w.balance).toBe(0);
      expect(Array.isArray(w.stamps)).toBe(true);
      expect(w.stamps.length).toBe(0);
    });

    test("throws if wallet already exists", () => {
      walletModule.createWallet("user1", "Alice");
      expect(() => walletModule.createWallet("user1", "Alice Again")).toThrow("Wallet already exists");
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.createWallet("__proto__", "x")).toThrow("Invalid userId");
      expect(() => walletModule.createWallet("", "x")).toThrow("Invalid userId");
      expect(() => walletModule.createWallet(123, "x")).toThrow("Invalid userId");
    });

    test("throws on invalid userName", () => {
      expect(() => walletModule.createWallet("user1", "")).toThrow("Invalid userName");
      expect(() => walletModule.createWallet("user1", 42)).toThrow("Invalid userName");
    });
  });

  // --- getWallet ---
  describe("getWallet", () => {
    test("returns existing wallet", () => {
      walletModule.createWallet("user1", "Alice");
      const w = walletModule.getWallet("user1");
      expect(w).not.toBeNull();
      expect(w.userId).toBe("user1");
    });

    test("returns null for unknown user", () => {
      expect(walletModule.getWallet("nobody")).toBeNull();
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.getWallet("constructor")).toThrow("Invalid userId");
    });
  });

  // --- updateBalance ---
  describe("updateBalance", () => {
    test("increases balance", () => {
      walletModule.createWallet("user1", "Alice");
      const w = walletModule.updateBalance("user1", 500);
      expect(w.balance).toBe(500);
    });

    test("decreases balance", () => {
      walletModule.createWallet("user1", "Alice");
      walletModule.updateBalance("user1", 500);
      const w = walletModule.updateBalance("user1", -200);
      expect(w.balance).toBe(300);
    });

    test("throws on insufficient balance", () => {
      walletModule.createWallet("user1", "Alice");
      expect(() => walletModule.updateBalance("user1", -1)).toThrow("Insufficient balance");
    });

    test("throws for unknown user", () => {
      expect(() => walletModule.updateBalance("nobody", 100)).toThrow("Wallet not found");
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.updateBalance("prototype", 100)).toThrow("Invalid userId");
    });
  });

  // --- transfer ---
  describe("transfer", () => {
    beforeEach(() => {
      walletModule.createWallet("alice", "Alice");
      walletModule.createWallet("bob", "Bob");
      walletModule.updateBalance("alice", 1000);
    });

    test("transfers balance between wallets", () => {
      const tx = walletModule.transfer("alice", "bob", 300);
      expect(tx.from).toBe("alice");
      expect(tx.to).toBe("bob");
      expect(tx.amount).toBe(300);
      expect(tx.status).toBe("completed");
      expect(walletModule.getWallet("alice").balance).toBe(700);
      expect(walletModule.getWallet("bob").balance).toBe(300);
    });

    test("throws on insufficient balance", () => {
      expect(() => walletModule.transfer("alice", "bob", 9999)).toThrow("Insufficient balance");
    });

    test("throws when wallets do not exist", () => {
      expect(() => walletModule.transfer("alice", "ghost", 10)).toThrow("One or both wallets not found");
    });

    test("throws on non-positive amount without stampId", () => {
      expect(() => walletModule.transfer("alice", "bob", 0)).toThrow();
      expect(() => walletModule.transfer("alice", "bob", -5)).toThrow();
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.transfer("__proto__", "bob", 10)).toThrow("Invalid userId");
      expect(() => walletModule.transfer("alice", "__proto__", 10)).toThrow("Invalid userId");
    });

    test("records transaction in history", () => {
      walletModule.transfer("alice", "bob", 100);
      const history = walletModule.getTransactionHistory("alice");
      expect(history.length).toBe(1);
      expect(history[0].amount).toBe(100);
    });
  });

  // --- addStamp ---
  describe("addStamp", () => {
    test("adds a stamp to wallet", () => {
      walletModule.createWallet("user1", "Alice");
      const w = walletModule.addStamp("user1", { name: "Rare Stamp", year: 1920 });
      expect(w.stamps.length).toBe(1);
      expect(w.stamps[0].name).toBe("Rare Stamp");
      expect(w.stamps[0].id).toBeDefined();
    });

    test("throws for unknown user", () => {
      expect(() => walletModule.addStamp("nobody", { name: "x" })).toThrow("Wallet not found");
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.addStamp("constructor", { name: "x" })).toThrow("Invalid userId");
    });
  });

  // --- getTransactionHistory ---
  describe("getTransactionHistory", () => {
    test("returns only transactions involving the user", () => {
      walletModule.createWallet("alice", "Alice");
      walletModule.createWallet("bob", "Bob");
      walletModule.createWallet("carol", "Carol");
      walletModule.updateBalance("alice", 500);
      walletModule.updateBalance("bob", 500);
      walletModule.transfer("alice", "bob", 100);
      walletModule.transfer("bob", "carol", 50);
      const aliceHistory = walletModule.getTransactionHistory("alice");
      expect(aliceHistory.length).toBe(1);
    });

    test("throws on invalid userId", () => {
      expect(() => walletModule.getTransactionHistory("")).toThrow("Invalid userId");
    });
  });
});
