/**
 * HTTP endpoint tests for the Blockchain API routes.
 *
 * Uses a minimal Express app created via createBlockchainRouter so the full
 * server.js startup (database, OAuth, etc.) is not required. The `fs` module
 * is mocked so no real files are written during tests.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import express from "express";
import http from "http";

// ---------------------------------------------------------------------------
// fs mock — must be defined before any module that imports `fs` is loaded
// ---------------------------------------------------------------------------

const TOTAL_SUPPLY = 421000000;

let mockBlockchainStore;

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockImplementation((filePath) => {
      return String(filePath).includes("blockchain-state") ? !!mockBlockchainStore : false;
    }),
    readFileSync: vi.fn().mockImplementation((filePath) => {
      if (String(filePath).includes("blockchain-state")) {
        return JSON.stringify(mockBlockchainStore || { mintedSupply: 0, balances: {}, mintEvents: [] });
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_TOKEN = "test-secret-token";

/** Make a JSON fetch request to the test server. */
function request(server, method, path, opts = {}) {
  const { headers = {}, body } = opts;
  const addr = server.address();
  const url = `http://127.0.0.1:${addr.port}${path}`;
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Shorthand helpers */
const get = (server, path, headers) => request(server, "GET", path, { headers });
const post = (server, path, body, headers) => request(server, "POST", path, { body, headers });
const auth = { Authorization: `Bearer ${TEST_TOKEN}` };

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

let server;

beforeAll(async () => {
  const { createBlockchainRouter } = await import("../blockchain-router.js");

  const app = express();
  app.use(express.json());
  app.use("/api/blockchain", createBlockchainRouter(TEST_TOKEN));

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", resolve);
  });
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  mockBlockchainStore = { mintedSupply: 0, balances: {}, mintEvents: [] };
});

// ---------------------------------------------------------------------------
// GET /api/blockchain/info
// ---------------------------------------------------------------------------

describe("GET /api/blockchain/info", () => {
  test("returns correct token metadata", async () => {
    const res = await get(server, "/api/blockchain/info");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("StampCoin");
    expect(data.symbol).toBe("STP");
    expect(data.decimals).toBe(18);
    expect(data.totalSupply).toBe(TOTAL_SUPPLY);
    expect(data.blockchain).toBe("BNB Smart Chain");
    expect(data.standard).toBe("BEP-20");
    expect(data.chainId).toBe(56);
    expect(data.contractAddress).toBeDefined();
  });

  test("does not require authentication", async () => {
    const res = await get(server, "/api/blockchain/info");
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// GET /api/blockchain/supply
// ---------------------------------------------------------------------------

describe("GET /api/blockchain/supply", () => {
  test("returns supply metrics with nothing minted", async () => {
    const res = await get(server, "/api/blockchain/supply");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalSupply).toBe(TOTAL_SUPPLY);
    expect(data.mintedSupply).toBe(0);
    expect(data.remainingSupply).toBe(TOTAL_SUPPLY);
    expect(data.symbol).toBe("STP");
    expect(data.decimals).toBe(18);
  });

  test("does not require authentication", async () => {
    const res = await get(server, "/api/blockchain/supply");
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /api/blockchain/mint
// ---------------------------------------------------------------------------

describe("POST /api/blockchain/mint", () => {
  test("mints tokens and returns an event record", async () => {
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 500 }, auth);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("mint");
    expect(data.to).toBe("wallet1");
    expect(data.amount).toBe(500);
    expect(data.id).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  test("reflects minted supply in /supply after mint", async () => {
    await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 1000 }, auth);
    const res = await get(server, "/api/blockchain/supply");
    const data = await res.json();
    expect(data.mintedSupply).toBe(1000);
    expect(data.remainingSupply).toBe(TOTAL_SUPPLY - 1000);
  });

  test("returns 401 without a token", async () => {
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 100 });
    expect(res.status).toBe(401);
  });

  test("returns 401 with a wrong token", async () => {
    const res = await post(
      server,
      "/api/blockchain/mint",
      { toAddress: "wallet1", amount: 100 },
      { Authorization: "Bearer wrong-token" },
    );
    expect(res.status).toBe(401);
  });

  test("returns 400 when toAddress is missing", async () => {
    const res = await post(server, "/api/blockchain/mint", { amount: 100 }, auth);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/toAddress/i);
  });

  test("returns 400 when amount is missing", async () => {
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1" }, auth);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/amount/i);
  });

  test("returns 400 for non-integer amount", async () => {
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 1.5 }, auth);
    expect(res.status).toBe(400);
  });

  test("returns 400 for non-positive amount", async () => {
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 0 }, auth);
    expect(res.status).toBe(400);
  });

  test("returns 400 when mint would exceed total supply cap", async () => {
    mockBlockchainStore = { mintedSupply: TOTAL_SUPPLY, balances: {}, mintEvents: [] };
    const res = await post(server, "/api/blockchain/mint", { toAddress: "wallet1", amount: 1 }, auth);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/exceed total supply cap/i);
  });
});

// ---------------------------------------------------------------------------
// GET /api/blockchain/balance/:address
// ---------------------------------------------------------------------------

describe("GET /api/blockchain/balance/:address", () => {
  test("returns zero balance for unknown address", async () => {
    const res = await get(server, "/api/blockchain/balance/unknown123");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.address).toBe("unknown123");
    expect(data.balance).toBe(0);
    expect(data.symbol).toBe("STP");
  });

  test("returns correct balance after minting", async () => {
    await post(server, "/api/blockchain/mint", { toAddress: "wallet2", amount: 250 }, auth);
    const res = await get(server, "/api/blockchain/balance/wallet2");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.balance).toBe(250);
  });

  test("does not require authentication", async () => {
    const res = await get(server, "/api/blockchain/balance/someaddress");
    expect(res.status).toBe(200);
  });

  test("returns 400 for invalid address", async () => {
    const res = await get(server, "/api/blockchain/balance/__proto__");
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/blockchain/mint/events
// ---------------------------------------------------------------------------

describe("GET /api/blockchain/mint/events", () => {
  test("returns empty array when nothing has been minted", async () => {
    const res = await get(server, "/api/blockchain/mint/events", auth);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test("returns mint events after minting", async () => {
    await post(server, "/api/blockchain/mint", { toAddress: "addr1", amount: 100 }, auth);
    await post(server, "/api/blockchain/mint", { toAddress: "addr2", amount: 200 }, auth);
    const res = await get(server, "/api/blockchain/mint/events", auth);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(2);
    expect(data[0].to).toBe("addr1");
    expect(data[0].type).toBe("mint");
    expect(data[1].to).toBe("addr2");
  });

  test("returns 401 without a token", async () => {
    const res = await get(server, "/api/blockchain/mint/events");
    expect(res.status).toBe(401);
  });

  test("returns 401 with a wrong token", async () => {
    const res = await get(server, "/api/blockchain/mint/events", { Authorization: "Bearer bad" });
    expect(res.status).toBe(401);
  });
});
