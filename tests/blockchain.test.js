/**
 * Tests for the blockchain module.
 * File system is mocked so tests run without touching disk.
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

let mockBlockchainStore;

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockImplementation(filePath => {
      return String(filePath).includes("blockchain-state")
        ? !!mockBlockchainStore
        : false;
    }),
    readFileSync: vi.fn().mockImplementation(filePath => {
      if (String(filePath).includes("blockchain-state")) {
        return JSON.stringify(
          mockBlockchainStore || {
            mintedSupply: 0,
            balances: {},
            mintEvents: [],
          }
        );
      }
      return "{}";
    }),
    writeFileSync: vi.fn().mockImplementation((filePath, data) => {
      if (String(filePath).includes("blockchain-state")) {
        mockBlockchainStore = JSON.parse(data);
      }
    }),
  },
}));

describe("blockchain module", () => {
  let bc;

  beforeEach(async () => {
    mockBlockchainStore = { mintedSupply: 0, balances: {}, mintEvents: [] };
    vi.resetModules();
    bc = await import("../blockchain.js");
  });

  // --- getBlockchainInfo ---
  describe("getBlockchainInfo", () => {
    test("returns correct token metadata", () => {
      const info = bc.getBlockchainInfo();
      expect(info.name).toBe("StampCoin");
      expect(info.symbol).toBe("STP");
      expect(info.decimals).toBe(18);
      expect(info.totalSupply).toBe(421000000);
      expect(info.blockchain).toBe("BNB Smart Chain");
      expect(info.consensus).toBe("Proof of Staked Authority (PoSA)");
      expect(info.standard).toBe("BEP-20");
      expect(info.chainId).toBe(56);
    });
  });

  // --- getSupply ---
  describe("getSupply", () => {
    test("returns full remaining supply when nothing is minted", () => {
      const supply = bc.getSupply();
      expect(supply.mintedSupply).toBe(0);
      expect(supply.totalSupply).toBe(421000000);
      expect(supply.remainingSupply).toBe(421000000);
    });

    test("updates remaining supply after minting", () => {
      bc.mintTokens("addr1", 1000000);
      const supply = bc.getSupply();
      expect(supply.mintedSupply).toBe(1000000);
      expect(supply.remainingSupply).toBe(420000000);
    });
  });

  // --- mintTokens ---
  describe("mintTokens", () => {
    test("mints tokens and returns an event record", () => {
      const event = bc.mintTokens("user1", 5000);
      expect(event.type).toBe("mint");
      expect(event.to).toBe("user1");
      expect(event.amount).toBe(5000);
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });

    test("increases recipient balance", () => {
      bc.mintTokens("user1", 3000);
      const bal = bc.getBalance("user1");
      expect(bal.balance).toBe(3000);
    });

    test("accumulates balance on multiple mints to same address", () => {
      bc.mintTokens("user1", 1000);
      bc.mintTokens("user1", 2000);
      expect(bc.getBalance("user1").balance).toBe(3000);
    });

    test("throws when amount is not a positive integer", () => {
      expect(() => bc.mintTokens("user1", 0)).toThrow("positive integer");
      expect(() => bc.mintTokens("user1", -100)).toThrow("positive integer");
      expect(() => bc.mintTokens("user1", 1.5)).toThrow("positive integer");
      expect(() => bc.mintTokens("user1", "abc")).toThrow("positive integer");
    });

    test("throws when address is invalid", () => {
      expect(() => bc.mintTokens("__proto__", 100)).toThrow("Invalid address");
      expect(() => bc.mintTokens("", 100)).toThrow("Invalid address");
      expect(() => bc.mintTokens(null, 100)).toThrow("Invalid address");
    });

    test("throws when minting would exceed total supply cap", () => {
      bc.mintTokens("user1", 421000000);
      expect(() => bc.mintTokens("user1", 1)).toThrow(
        "exceed total supply cap"
      );
    });
  });

  // --- getBalance ---
  describe("getBalance", () => {
    test("returns zero balance for an unknown address", () => {
      const bal = bc.getBalance("unknown_addr");
      expect(bal.balance).toBe(0);
      expect(bal.symbol).toBe("STP");
    });

    test("throws on invalid address", () => {
      expect(() => bc.getBalance("constructor")).toThrow("Invalid address");
      expect(() => bc.getBalance("")).toThrow("Invalid address");
    });
  });

  // --- getMintEvents ---
  describe("getMintEvents", () => {
    test("returns empty array when nothing has been minted", () => {
      expect(bc.getMintEvents()).toEqual([]);
    });

    test("records one event per mint call", () => {
      bc.mintTokens("addr1", 100);
      bc.mintTokens("addr2", 200);
      const events = bc.getMintEvents();
      expect(events.length).toBe(2);
      expect(events[0].to).toBe("addr1");
      expect(events[1].to).toBe("addr2");
    });
  });
});
