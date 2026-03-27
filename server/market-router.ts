import { Router, Request, Response } from "express";
import {
  addMarketItem,
  getAllMarketItems,
  getMarketItem,
  updateMarketItem,
  purchaseMarketItem,
  removeMarketItem,
  getMarketTransactions,
} from "../market.js";

const marketRouter = Router();

// GET /api/market/items
marketRouter.get("/items", (req: Request, res: Response) => {
  const { status, type, sellerId } = req.query;
  const filter: Record<string, string> = {};
  if (typeof status === "string") filter.status = status;
  if (typeof type === "string") filter.type = type;
  if (typeof sellerId === "string") filter.sellerId = sellerId;
  const items = getAllMarketItems(filter);
  res.json(items);
});

// GET /api/market/items/:itemId
marketRouter.get("/items/:itemId", (req: Request, res: Response) => {
  try {
    const item = getMarketItem(req.params.itemId);
    res.json(item);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Market item not found") {
      res.status(404).json({ error: "Market item not found" });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// POST /api/market/items
marketRouter.post("/items", (req: Request, res: Response) => {
  const { sellerId, ...item } = req.body as {
    sellerId: string;
    name: string;
    description?: string;
    price?: number;
    type?: string;
    imageUrl?: string;
  };
  try {
    const newItem = addMarketItem(sellerId, item);
    res.status(201).json(newItem);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

// PUT /api/market/items/:itemId
marketRouter.put("/items/:itemId", (req: Request, res: Response) => {
  const { userId, ...updates } = req.body as {
    userId: string;
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
  };

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const updatableKeys = ["name", "price", "description", "imageUrl"] as const;
  const hasUpdates = updatableKeys.some(k => updates[k] !== undefined);
  if (!hasUpdates) {
    res.status(400).json({ error: "No updatable fields provided" });
    return;
  }

  if (updates.price !== undefined && (typeof updates.price !== "number" || updates.price < 0)) {
    res.status(400).json({ error: "price must be a non-negative number" });
    return;
  }

  try {
    const item = getMarketItem(req.params.itemId);
    if (item.sellerId !== userId) {
      res.status(403).json({ error: "Only the seller can update this item" });
      return;
    }
    const updated = updateMarketItem(req.params.itemId, updates);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Market item not found") {
      res.status(404).json({ error: "Market item not found" });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// POST /api/market/items/:itemId/buy
marketRouter.post("/items/:itemId/buy", (req: Request, res: Response) => {
  const { buyerId } = req.body as { buyerId: string };
  try {
    const result = purchaseMarketItem(req.params.itemId, buyerId);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Market item not found") {
      res.status(404).json({ error: "Market item not found" });
    } else if (
      message === "Item is not available for purchase" ||
      message === "Cannot purchase your own item"
    ) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// DELETE /api/market/items/:itemId
marketRouter.delete("/items/:itemId", (req: Request, res: Response) => {
  const { userId } = req.body as { userId: string };
  try {
    const result = removeMarketItem(req.params.itemId, userId);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Market item not found") {
      res.status(404).json({ error: "Market item not found" });
    } else if (message.startsWith("Only the seller")) {
      res.status(403).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// GET /api/market/transactions
marketRouter.get("/transactions", (req: Request, res: Response) => {
  const { buyerId, sellerId } = req.query;
  const filter: Record<string, string> = {};
  if (typeof buyerId === "string") filter.buyerId = buyerId;
  if (typeof sellerId === "string") filter.sellerId = sellerId;
  const transactions = getMarketTransactions(filter);
  res.json(transactions);
});

export { marketRouter };
