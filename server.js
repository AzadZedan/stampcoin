import express from "express";
import { promises as fsPromises } from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import * as wallet from "./wallet.js";
import * as market from "./market.js";
import * as blockchain from "./blockchain.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:8080", "http://localhost:3000", "http://localhost:10000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development mode, allow all origins for easier local testing
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");
const SYNC_TOKEN = process.env.SYNC_TOKEN || "";

function requireToken(req, res, next) {
  const auth = req.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!SYNC_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.warn("SYNC_TOKEN not configured - authentication disabled (development mode)");
    return next();
  }
  if (token !== SYNC_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- Wallet API ---

// Create wallet
app.post("/api/wallet/create", (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId || !userName) return res.status(400).json({ error: "userId and userName are required" });
    const w = wallet.createWallet(userId, userName);
    res.json(w);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get wallet by userId
app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = wallet.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    res.json(w);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Transfer balance between wallets
app.post("/api/wallet/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    if (!fromUserId || !toUserId || amount == null) {
      return res.status(400).json({ error: "fromUserId, toUserId, and amount are required" });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }
    const tx = wallet.transfer(fromUserId, toUserId, numAmount);
    res.json(tx);
  } catch (e) {
    if (e.message === "One or both wallets not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// Get transaction history for a user
app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    const txs = wallet.getTransactionHistory(req.params.userId);
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add stamp to wallet (token-protected to prevent unauthorized stamp minting)
app.post("/api/wallet/:userId/stamps", requireToken, (req, res) => {
  try {
    const stamp = req.body;
    if (!stamp || !stamp.name) return res.status(400).json({ error: "stamp name is required" });
    if (stamp.value === undefined || stamp.value === null) return res.status(400).json({ error: "stamp value is required" });
    if (!stamp.rarity) return res.status(400).json({ error: "stamp rarity is required" });
    const w = wallet.addStamp(req.params.userId, stamp);
    res.json(w);
  } catch (e) {
    if (e.message === "Wallet not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// List all wallets (admin endpoint, token-protected)
app.get("/api/wallets", requireToken, (_req, res) => {
  try {
    res.json(Object.values(wallet.getAllWallets()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Top-up wallet balance (token-protected)
app.post("/api/wallet/:userId/topup", requireToken, (req, res) => {
  try {
    const { amount } = req.body || {};
    if (amount == null) return res.status(400).json({ error: "amount is required" });
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: "amount must be a positive number" });
    const w = wallet.updateBalance(req.params.userId, numAmount);
    res.json(w);
  } catch (e) {
    if (e.message === "Wallet not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// --- Market API ---

// Get all market items (with optional filters)
app.get("/api/market/items", (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    res.json(market.getAllMarketItems(filter));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List a new item on the market
app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, name, description, price, type, imageUrl } = req.body;
    if (!sellerId || !name) return res.status(400).json({ error: "sellerId and name are required" });
    const item = market.addMarketItem(sellerId, { name, description, price, type, imageUrl });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get a specific market item by ID
app.get("/api/market/items/:itemId", (req, res) => {
  try {
    res.json(market.getMarketItem(req.params.itemId));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// Update a market item (seller only)
app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId, price, description, status, imageUrl } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const item = market.getMarketItem(req.params.itemId);
    if (item.sellerId !== userId) return res.status(403).json({ error: "Only the seller can update this item" });
    const updates = {};
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updatable fields provided" });
    res.json(market.updateMarketItem(req.params.itemId, updates));
  } catch (e) {
    if (e.message === "Market item not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// Purchase a market item
app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId } = req.body;
    if (!buyerId) return res.status(400).json({ error: "buyerId is required" });
    const item = market.getMarketItem(req.params.itemId);
    if (item.price > 0) {
      wallet.transfer(buyerId, item.sellerId, item.price);
    }
    const result = market.purchaseMarketItem(req.params.itemId, buyerId);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Remove a market item (seller only)
app.delete("/api/market/items/:itemId", (req, res) => {
  try {
    const userId = (req.body && req.body.userId) || req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    res.json(market.removeMarketItem(req.params.itemId, userId));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get market transaction history (with optional buyer/seller filters)
app.get("/api/market/transactions", (req, res) => {
  try {
    const filter = {};
    if (req.query.buyerId) filter.buyerId = req.query.buyerId;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    res.json(market.getMarketTransactions(filter));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Token Info API ---
app.get("/api/token", (req, res) => {
  res.json({
    name: "StampCoin",
    symbol: "STP",
    totalSupply: 421000000,
    icoPrice: 1.65,
    icoUnit: "USD",
    decimals: 18,
    license: "MIT",
    website: "https://ecostamp.net",
    github: "https://github.com/zedanazad43/stp",
    contact: "stampcoin.contact@gmail.com",
    distribution: [
      { label: "Public ICO Sale",       percent: 20, amount: 84200000 },
      { label: "Ecosystem & Partners",  percent: 20, amount: 84200000 },
      { label: "Community & Rewards",   percent: 20, amount: 84200000 },
      { label: "Liquidity Pool",        percent: 15, amount: 63150000 },
      { label: "Team & Founders",       percent: 15, amount: 63150000 },
      { label: "Reserve",               percent: 10, amount: 42100000 }
    ],
    contractAddress: process.env.STP_CONTRACT_ADDRESS || "Pending mainnet deployment",
    network: "EVM-compatible"
  });
});

// --- Blockchain API ---

app.get("/api/blockchain/info", (req, res) => {
  try {
    res.json(blockchain.getBlockchainInfo());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blockchain/supply", (req, res) => {
  try {
    res.json(blockchain.getSupply());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/blockchain/mint", requireToken, (req, res) => {
  try {
    const { toAddress, amount } = req.body || {};
    if (!toAddress) return res.status(400).json({ error: "toAddress is required" });
    if (amount === undefined || amount === null) return res.status(400).json({ error: "amount is required" });
    const event = blockchain.mintTokens(toAddress, Number(amount));
    res.json(event);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/balance/:address", (req, res) => {
  try {
    res.json(blockchain.getBalance(req.params.address));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/mint/events", requireToken, (req, res) => {
  try {
    res.json(blockchain.getMintEvents());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Auctions API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const auctions = new Map();

app.get("/api/auctions", (req, res) => {
  try {
    const list = Array.from(auctions.values()).filter(a => a.status !== "cancelled");
    const { status } = req.query;
    res.json(status ? list.filter(a => a.status === status) : list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions", (req, res) => {
  try {
    const { sellerId, stampName, description, startingBid, durationHours } = req.body;
    if (!sellerId || !stampName || !startingBid) {
      return res.status(400).json({ error: "sellerId, stampName, and startingBid are required" });
    }
    const id = "auction_" + Date.now();
    const auction = {
      id,
      sellerId,
      stampName,
      description: description || "",
      currentBid: Number(startingBid),
      startingBid: Number(startingBid),
      bids: [],
      status: "active",
      endsAt: Date.now() + (Number(durationHours) || 24) * 3600 * 1000,
      createdAt: new Date().toISOString(),
    };
    auctions.set(id, auction);
    res.status(201).json(auction);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/auctions/:id", (req, res) => {
  try {
    const auction = auctions.get(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions/:id/bid", (req, res) => {
  try {
    const auction = auctions.get(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "active") return res.status(400).json({ error: "Auction is not active" });
    if (Date.now() > auction.endsAt) {
      auction.status = "ended";
      return res.status(400).json({ error: "Auction has ended" });
    }
    const { bidderId, amount } = req.body;
    if (!bidderId || !amount) return res.status(400).json({ error: "bidderId and amount are required" });
    if (Number(amount) <= auction.currentBid) {
      return res.status(400).json({ error: `Bid must be greater than current bid of ${auction.currentBid}` });
    }
    const bid = { bidderId, amount: Number(amount), timestamp: new Date().toISOString() };
    auction.bids.push(bid);
    auction.currentBid = Number(amount);
    res.json({ auction, bid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- NFT Stamps API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const nftStamps = new Map();

app.get("/api/nft/stamps", (req, res) => {
  try {
    const list = Array.from(nftStamps.values());
    const { ownerId } = req.query;
    res.json(ownerId ? list.filter(s => s.ownerId === ownerId) : list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/nft/mint", (req, res) => {
  try {
    const { ownerId, name, country, year, description, rarity, imageUrl } = req.body;
    if (!ownerId || !name) return res.status(400).json({ error: "ownerId and name are required" });
    const tokenId = "STP-" + Date.now().toString(36).toUpperCase();
    const stamp = {
      tokenId,
      ownerId,
      name,
      country: country || "",
      year: year || null,
      description: description || "",
      rarity: rarity || "common",
      imageUrl: imageUrl || null,
      mintedAt: new Date().toISOString(),
      status: "minted",
      mintCost: 50,
    };
    nftStamps.set(tokenId, stamp);
    res.status(201).json(stamp);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/nft/stamps/:tokenId", (req, res) => {
  try {
    const stamp = nftStamps.get(req.params.tokenId);
    if (!stamp) return res.status(404).json({ error: "NFT stamp not found" });
    res.json(stamp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Users / Registration API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const users = new Map();

app.post("/api/users/register", (req, res) => {
  try {
    const { userId, userName, email } = req.body;
    if (!userId || !userName) return res.status(400).json({ error: "userId and userName are required" });
    if (users.has(userId)) return res.status(409).json({ error: "User already registered" });
    const user = {
      userId,
      userName,
      email: email || null,
      registeredAt: new Date().toISOString(),
      role: "user",
    };
    users.set(userId, user);
    // Also create wallet for the user
    let walletData = null;
    try { walletData = wallet.createWallet(userId, userName); } catch (e) {
      // Wallet may already exist for this userId — that is acceptable
      if (!e.message.includes("already exists")) {
        console.error("Wallet creation error during registration:", e.message);
      }
    }
    res.status(201).json({ user, wallet: walletData });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/users/:userId", (req, res) => {
  try {
    const user = users.get(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Sync API ---
async function readData() {
  try {
    const raw = await fsPromises.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading data file:", e.message);
    return [];
  }
}

async function writeData(todos) {
  try {
    await fsPromises.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Write error:", e);
    return false;
  }
}

app.get("/sync", requireToken, async (req, res) => {
  const todos = await readData();
  res.json({ todos });
});

app.post("/sync", requireToken, async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.todos)) {
    return res.status(400).json({ error: "Invalid payload, expected { todos: [...] }" });
  }
  const ok = await writeData(payload.todos);
  if (!ok) return res.status(500).json({ error: "Failed to store data" });
  res.json({ ok: true });
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Stampcoin Platform server listening on port ${port}`);
});
