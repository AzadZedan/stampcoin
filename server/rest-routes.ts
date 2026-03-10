import crypto from "crypto";
import { Router, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import * as db from "./db";

const router = Router();

// ─── Token constants ──────────────────────────────────────────────────────────
const TOKEN_NAME = "StampCoin";
const TOKEN_SYMBOL = "STAMP";
const TOKEN_DECIMALS = 18;
const TOKEN_MAX_SUPPLY = "21000000";
const CHAIN_ID = 1337;
const CHAIN_NAME = "StampChain";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateWalletAddress(): string {
  return "0x" + crypto.randomBytes(20).toString("hex");
}

function generateTransactionHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

async function requireAuth(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    return user;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

async function requireAdmin(req: Request, res: Response) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin access required" });
    return null;
  }
  return user;
}

// ─── GET /api/token ───────────────────────────────────────────────────────────

router.get("/token", async (_req: Request, res: Response) => {
  const totalSupply = await db.getTotalTokenSupply();
  res.json({
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    totalSupply,
    maxSupply: TOKEN_MAX_SUPPLY,
    chainId: CHAIN_ID,
  });
});

// ─── POST /api/users/register ─────────────────────────────────────────────────

router.post("/users/register", async (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  const openId = "reg_" + crypto.randomBytes(16).toString("hex");

  await db.upsertUser({ openId, name, email, loginMethod: "registration" });
  const user = await db.getUserByOpenId(openId);

  res.status(201).json({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    openId: user?.openId,
    createdAt: user?.createdAt,
  });
});

// ─── POST /api/wallet/create ──────────────────────────────────────────────────

router.post("/wallet/create", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const existing = await db.getWalletByUserId(user.id);
  if (existing) {
    res.status(409).json({ error: "Wallet already exists for this user" });
    return;
  }

  const address = generateWalletAddress();
  const wallet = await db.createWallet({ userId: user.id, address, balance: "0" });

  res.status(201).json(wallet);
});

// ─── POST /api/wallet/transfer ────────────────────────────────────────────────

router.post("/wallet/transfer", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { to, amount } = req.body as { to?: string; amount?: string };

  if (!to || !amount) {
    res.status(400).json({ error: "to and amount are required" });
    return;
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  const senderWallet = await db.getWalletByUserId(user.id);
  if (!senderWallet) {
    res.status(404).json({ error: "Sender wallet not found" });
    return;
  }

  const senderBalance = parseFloat(senderWallet.balance);
  if (senderBalance < amountNum) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const recipientWallet = await db.getWalletByAddress(to);
  if (!recipientWallet) {
    res.status(404).json({ error: "Recipient wallet not found" });
    return;
  }

  const newSenderBalance = (senderBalance - amountNum).toFixed(8);
  const newRecipientBalance = (parseFloat(recipientWallet.balance) + amountNum).toFixed(8);

  await db.updateWalletBalance(senderWallet.address, newSenderBalance);
  await db.updateWalletBalance(recipientWallet.address, newRecipientBalance);

  const txHash = generateTransactionHash();

  res.json({
    success: true,
    transactionHash: txHash,
    from: senderWallet.address,
    to: recipientWallet.address,
    amount: amountNum,
    senderBalance: newSenderBalance,
    recipientBalance: newRecipientBalance,
  });
});

// ─── GET /api/blockchain/info ─────────────────────────────────────────────────

router.get("/blockchain/info", async (_req: Request, res: Response) => {
  const totalSupply = await db.getTotalTokenSupply();
  res.json({
    name: CHAIN_NAME,
    symbol: TOKEN_SYMBOL,
    chainId: CHAIN_ID,
    consensus: "PoA",
    nativeCurrency: {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      decimals: TOKEN_DECIMALS,
    },
    totalSupply,
  });
});

// ─── GET /api/blockchain/supply ───────────────────────────────────────────────

router.get("/blockchain/supply", async (_req: Request, res: Response) => {
  const totalSupply = await db.getTotalTokenSupply();
  res.json({
    totalSupply,
    maxSupply: TOKEN_MAX_SUPPLY,
    symbol: TOKEN_SYMBOL,
  });
});

// ─── POST /api/blockchain/mint (🔒 admin) ────────────────────────────────────

router.post("/blockchain/mint", async (req: Request, res: Response) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const { address, amount } = req.body as { address?: string; amount?: string };

  if (!address || !amount) {
    res.status(400).json({ error: "address and amount are required" });
    return;
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  const wallet = await db.getWalletByAddress(address);
  if (!wallet) {
    res.status(404).json({ error: "Wallet not found for address" });
    return;
  }

  const newBalance = (parseFloat(wallet.balance) + amountNum).toFixed(8);
  const updated = await db.updateWalletBalance(address, newBalance);

  const txHash = generateTransactionHash();

  res.json({
    success: true,
    transactionHash: txHash,
    address,
    minted: amountNum,
    balance: updated?.balance,
  });
});

// ─── GET /api/blockchain/balance/:addr ────────────────────────────────────────

router.get("/blockchain/balance/:addr", async (req: Request, res: Response) => {
  const { addr } = req.params;

  const wallet = await db.getWalletByAddress(addr);
  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  res.json({
    address: wallet.address,
    balance: wallet.balance,
    symbol: TOKEN_SYMBOL,
  });
});

// ─── POST /api/market/items ───────────────────────────────────────────────────

router.post("/market/items", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { stampId, price } = req.body as { stampId?: number; price?: number };

  if (!stampId || price === undefined) {
    res.status(400).json({ error: "stampId and price are required" });
    return;
  }

  if (price <= 0) {
    res.status(400).json({ error: "price must be a positive number" });
    return;
  }

  const stamp = await db.getStampById(stampId);
  if (!stamp) {
    res.status(404).json({ error: "Stamp not found" });
    return;
  }

  const item = await db.createMarketItem({
    stampId,
    sellerId: user.id,
    price: String(price),
    status: "listed",
  });

  res.status(201).json(item);
});

// ─── POST /api/market/items/:id/buy ──────────────────────────────────────────

router.post("/market/items/:id/buy", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid market item id" });
    return;
  }

  const item = await db.getMarketItemById(id);
  if (!item) {
    res.status(404).json({ error: "Market item not found" });
    return;
  }

  if (item.status !== "listed") {
    res.status(409).json({ error: "Market item is no longer available" });
    return;
  }

  if (item.sellerId === user.id) {
    res.status(400).json({ error: "Cannot buy your own listing" });
    return;
  }

  const updated = await db.updateMarketItemStatus(id, "sold", user.id);

  res.json({
    success: true,
    marketItem: updated,
    buyer: { id: user.id, name: user.name },
  });
});

// ─── POST /api/auctions ───────────────────────────────────────────────────────

router.post("/auctions", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { stampId, startPrice, endTime } = req.body as {
    stampId?: number;
    startPrice?: number;
    endTime?: string;
  };

  if (!stampId || startPrice === undefined || !endTime) {
    res.status(400).json({ error: "stampId, startPrice, and endTime are required" });
    return;
  }

  if (startPrice <= 0) {
    res.status(400).json({ error: "startPrice must be a positive number" });
    return;
  }

  const endTimeDate = new Date(endTime);
  const now = new Date();
  if (isNaN(endTimeDate.getTime()) || endTimeDate <= now) {
    res.status(400).json({ error: "endTime must be a valid future date" });
    return;
  }

  const stamp = await db.getStampById(stampId);
  if (!stamp) {
    res.status(404).json({ error: "Stamp not found" });
    return;
  }

  const auction = await db.createAuction({
    stampId,
    sellerId: user.id,
    startPrice: String(startPrice),
    endTime: endTimeDate,
    status: "active",
  });

  res.status(201).json(auction);
});

// ─── POST /api/nft/mint ───────────────────────────────────────────────────────

router.post("/nft/mint", async (req: Request, res: Response) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { title, description, imageUrl, categoryId, country, year, price } = req.body as {
    title?: string;
    description?: string;
    imageUrl?: string;
    categoryId?: number;
    country?: string;
    year?: number;
    price?: number;
  };

  if (!title || !categoryId) {
    res.status(400).json({ error: "title and categoryId are required" });
    return;
  }

  const effectivePrice = price ?? 0;

  const stamp = await db.createStamp({
    title,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
    categoryId,
    country: country ?? null,
    year: year ?? null,
    price: String(effectivePrice),
    rarity: "common",
    ownerId: user.id,
    isAvailable: true,
  });

  const insertId = (stamp as unknown as { insertId: number }).insertId ?? 0;
  const created = insertId ? await db.getStampById(insertId) : null;

  res.status(201).json(created ?? { success: true });
});

export { router as restRouter };
