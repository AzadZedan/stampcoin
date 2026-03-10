// Digital Wallet Module for Stampcoin Platform
// Module for managing digital wallets, balances, and transactions

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WALLETS_FILE = path.join(__dirname, "wallets.json");
const TRANSACTIONS_FILE = path.join(__dirname, "transactions.json");

/**
 * Validate a userId to prevent prototype-pollution and injection attacks.
 * @param {*} userId - Value to validate
 * @throws {Error} if userId is invalid
 */
function validateUserId(userId) {
  if (
    typeof userId !== "string" ||
    userId.trim() === "" ||
    userId === "__proto__" ||
    userId === "constructor" ||
    userId === "prototype"
  ) {
    throw new Error("Invalid userId");
  }
}

/**
 * Initialize wallet storage files if they don't exist
 */
function initializeStorage() {
  if (!fs.existsSync(WALLETS_FILE)) {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify({}, null, 2), "utf8");
  }
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

/**
 * Read wallets from storage
 */
function readWallets() {
  try {
    const data = fs.readFileSync(WALLETS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    console.error("Error reading wallets:", error.message);
    throw error;
  }
}

/**
 * Write wallets to storage
 */
function writeWallets(wallets) {
  try {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing wallets:", error.message);
    return false;
  }
}

/**
 * Read transactions from storage
 */
function readTransactions() {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Error reading transactions:", error.message);
    throw error;
  }
}

/**
 * Write transactions to storage
 */
function writeTransactions(transactions) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing transactions:", error.message);
    return false;
  }
}

/**
 * Create a new wallet for a user
 * @param {string} userId - Unique user identifier
 * @param {string} userName - User's display name
 * @returns {object} The created wallet object
 */
function createWallet(userId, userName) {
  validateUserId(userId);
  if (typeof userName !== "string" || userName.trim() === "") {
    throw new Error("Invalid userName");
  }
  const wallets = readWallets();

  if (wallets[userId]) {
    throw new Error("Wallet already exists for this user");
  }

  const wallet = {
    userId,
    userName,
    balance: 0,
    stamps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

/**
 * Get wallet by user ID
 * @param {string} userId - User identifier
 * @returns {object|null} Wallet object or null if not found
 */
function getWallet(userId) {
  validateUserId(userId);
  const wallets = readWallets();
  return wallets[userId] || null;
}

/**
 * Get all wallets
 * @returns {object} All wallets
 */
function getAllWallets() {
  return readWallets();
}

/**
 * Update wallet balance
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @returns {object} Updated wallet
 */
function updateBalance(userId, amount) {
  validateUserId(userId);

  const wallets = readWallets();
  const wallet = wallets[userId];

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const newBalance = wallet.balance + amount;
  if (newBalance < 0) {
    throw new Error("Insufficient balance");
  }

  wallet.balance = newBalance;
  wallet.updatedAt = new Date().toISOString();

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

/**
 * Add a stamp to wallet
 * @param {string} userId - User identifier
 * @param {object} stamp - Stamp object to add
 * @returns {object} Updated wallet
 */
function addStamp(userId, stamp) {
  validateUserId(userId);
  const wallets = readWallets();
  const wallet = wallets[userId];

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const stampWithId = {
    id: crypto.randomUUID(),
    ...stamp,
    addedAt: new Date().toISOString()
  };

  wallet.stamps.push(stampWithId);
  wallet.updatedAt = new Date().toISOString();

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

/**
 * Transfer stamps or balance between wallets
 * @param {string} fromUserId - Sender's user ID
 * @param {string} toUserId - Receiver's user ID
 * @param {number} amount - Amount to transfer (must be positive if transferring balance)
 * @param {string} stampId - Stamp ID to transfer (optional)
 * @returns {object} Transaction record
 */
function transfer(fromUserId, toUserId, amount = 0, stampId = null) {
  validateUserId(fromUserId);
  validateUserId(toUserId);
  if (!stampId && (!amount || amount <= 0)) {
    throw new Error("Transfer amount must be a positive number when transferring balance");
  }

  const wallets = readWallets();
  const fromWallet = wallets[fromUserId];
  const toWallet = wallets[toUserId];

  if (!fromWallet || !toWallet) {
    throw new Error("One or both wallets not found");
  }

  const transactionId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (amount > 0) {
    if (fromWallet.balance < amount) {
      throw new Error("Insufficient balance");
    }
    fromWallet.balance -= amount;
    toWallet.balance += amount;
  }

  if (stampId) {
    const stampIndex = fromWallet.stamps.findIndex(s => s.id === stampId);
    if (stampIndex === -1) {
      throw new Error("Stamp not found in sender wallet");
    }
    const stamp = fromWallet.stamps.splice(stampIndex, 1)[0];
    toWallet.stamps.push({
      ...stamp,
      transferredAt: timestamp
    });
  }

  fromWallet.updatedAt = timestamp;
  toWallet.updatedAt = timestamp;

  wallets[fromUserId] = fromWallet;
  wallets[toUserId] = toWallet;
  writeWallets(wallets);

  const transaction = {
    id: transactionId,
    from: fromUserId,
    to: toUserId,
    amount,
    stampId,
    timestamp,
    status: "completed"
  };

  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);

  return transaction;
}

/**
 * Get transaction history for a user
 * @param {string} userId - User identifier
 * @returns {array} Array of transactions
 */
function getTransactionHistory(userId) {
  validateUserId(userId);
  const transactions = readTransactions();
  return transactions.filter(t => t.from === userId || t.to === userId);
}

/**
 * Get all transactions
 * @returns {array} Array of all transactions
 */
function getAllTransactions() {
  return readTransactions();
}

// Initialize storage on module load
initializeStorage();

export {
  createWallet,
  getWallet,
  getAllWallets,
  updateBalance,
  addStamp,
  transfer,
  getTransactionHistory,
  getAllTransactions
};
