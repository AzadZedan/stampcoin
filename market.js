/**
 * Market Institution Module
 * Digital marketplace for stamps and collectibles
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MARKET_FILE = path.join(__dirname, "market-data.json");

// Initialize market data structure
let marketData = {
  items: [],
  transactions: [],
};

// Load market data from file
function loadMarketData() {
  try {
    if (fs.existsSync(MARKET_FILE)) {
      const raw = fs.readFileSync(MARKET_FILE, "utf8");
      marketData = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading market data:", e.message);
  }
}

// Save market data to file
function saveMarketData() {
  try {
    fs.writeFileSync(MARKET_FILE, JSON.stringify(marketData, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving market data:", e.message);
    return false;
  }
}

// Initialize on module load
loadMarketData();

/**
 * Add a new item to the market
 */
function addMarketItem(sellerId, item) {
  if (!sellerId || !item || !item.name) {
    throw new Error("sellerId and item with name are required");
  }

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    sellerId,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    type: item.type || "stamp",
    imageUrl: item.imageUrl || "",
    status: "available",
    listedAt: new Date().toISOString(),
  };

  marketData.items.push(newItem);
  saveMarketData();
  return newItem;
}

/**
 * Get all market items
 */
function getAllMarketItems(filter = {}) {
  let items = [...marketData.items];

  if (filter.status) {
    items = items.filter(item => item.status === filter.status);
  }

  if (filter.type) {
    items = items.filter(item => item.type === filter.type);
  }

  if (filter.sellerId) {
    items = items.filter(item => item.sellerId === filter.sellerId);
  }

  return items;
}

/**
 * Get a specific market item by ID
 */
function getMarketItem(itemId) {
  const item = marketData.items.find(i => i.id === itemId);
  if (!item) {
    throw new Error("Market item not found");
  }
  return item;
}

/**
 * Update a market item
 */
function updateMarketItem(itemId, updates) {
  const itemIndex = marketData.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Market item not found");
  }

  const item = marketData.items[itemIndex];

  if (updates.name !== undefined) item.name = updates.name;
  if (updates.price !== undefined) item.price = updates.price;
  if (updates.description !== undefined) item.description = updates.description;
  if (updates.status !== undefined) item.status = updates.status;
  if (updates.imageUrl !== undefined) item.imageUrl = updates.imageUrl;

  marketData.items[itemIndex] = item;
  saveMarketData();
  return item;
}

/**
 * Purchase an item from the market
 */
function purchaseMarketItem(itemId, buyerId) {
  const item = getMarketItem(itemId);

  if (item.status !== "available") {
    throw new Error("Item is not available for purchase");
  }

  if (item.sellerId === buyerId) {
    throw new Error("Cannot purchase your own item");
  }

  updateMarketItem(itemId, { status: "sold" });

  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    itemId,
    sellerId: item.sellerId,
    buyerId,
    price: item.price,
    timestamp: new Date().toISOString(),
  };

  marketData.transactions.push(transaction);
  saveMarketData();

  return {
    transaction,
    item,
  };
}

/**
 * Remove an item from the market
 */
function removeMarketItem(itemId, userId) {
  const itemIndex = marketData.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Market item not found");
  }

  const item = marketData.items[itemIndex];

  if (item.sellerId !== userId) {
    throw new Error("Only the seller can remove this item");
  }

  marketData.items.splice(itemIndex, 1);
  saveMarketData();
  return { success: true, message: "Item removed from market" };
}

/**
 * Get transaction history
 */
function getMarketTransactions(filter = {}) {
  let transactions = [...marketData.transactions];

  if (filter.buyerId) {
    transactions = transactions.filter(t => t.buyerId === filter.buyerId);
  }

  if (filter.sellerId) {
    transactions = transactions.filter(t => t.sellerId === filter.sellerId);
  }

  return transactions;
}

export {
  addMarketItem,
  getAllMarketItems,
  getMarketItem,
  updateMarketItem,
  purchaseMarketItem,
  removeMarketItem,
  getMarketTransactions,
};
