/**
 * Blockchain Module for Stampcoin Platform
 *
 * Implements BEP-20-compatible token logic for the STP (StampCoin) token
 * on BNB Smart Chain (BSC) using Proof of Staked Authority (PoSA) consensus.
 */

"use strict";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN = {
  name: "StampCoin",
  symbol: "STP",
  decimals: 18,
  totalSupply: 421000000,
  blockchain: "BNB Smart Chain",
  consensus: "Proof of Staked Authority (PoSA)",
  standard: "BEP-20",
  network: "BSC Mainnet",
  chainId: 56
};

const BLOCKCHAIN_FILE = path.join(__dirname, "blockchain-state.json");

function loadState() {
  try {
    if (fs.existsSync(BLOCKCHAIN_FILE)) {
      const raw = fs.readFileSync(BLOCKCHAIN_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading blockchain state:", e.message);
  }
  return {
    mintedSupply: 0,
    balances: {},
    mintEvents: []
  };
}

function saveState(state) {
  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(state, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving blockchain state:", e.message);
    return false;
  }
}

/**
 * Validate a wallet/token address.
 * @param {*} address - Value to validate
 * @throws {Error} if address is invalid
 */
function validateAddress(address) {
  if (
    typeof address !== "string" ||
    address.trim() === "" ||
    address === "__proto__" ||
    address === "constructor" ||
    address === "prototype"
  ) {
    throw new Error("Invalid address");
  }
}

/**
 * Return static token/blockchain metadata.
 */
function getBlockchainInfo() {
  return {
    ...TOKEN,
    contractAddress: process.env.STP_CONTRACT_ADDRESS || "Pending mainnet deployment"
  };
}

/**
 * Return current token supply metrics.
 */
function getSupply() {
  const state = loadState();
  return {
    totalSupply: TOKEN.totalSupply,
    mintedSupply: state.mintedSupply,
    remainingSupply: TOKEN.totalSupply - state.mintedSupply,
    symbol: TOKEN.symbol,
    decimals: TOKEN.decimals
  };
}

/**
 * Mint new STP tokens to a given address.
 * @param {string} toAddress - Recipient address
 * @param {number} amount - Number of whole STP tokens to mint
 * @returns {object} Mint event record
 */
function mintTokens(toAddress, amount) {
  validateAddress(toAddress);

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error("Mint amount must be a positive integer");
  }

  const state = loadState();

  if (state.mintedSupply + amount > TOKEN.totalSupply) {
    throw new Error(
      `Mint would exceed total supply cap of ${TOKEN.totalSupply} STP ` +
      `(currently minted: ${state.mintedSupply})`
    );
  }

  state.balances[toAddress] = (state.balances[toAddress] || 0) + amount;
  state.mintedSupply += amount;

  const event = {
    id: crypto.randomUUID(),
    type: "mint",
    to: toAddress,
    amount,
    timestamp: new Date().toISOString()
  };
  state.mintEvents.push(event);

  saveState(state);
  return event;
}

/**
 * Get the STP token balance for an address.
 * @param {string} address - Wallet address or user ID
 * @returns {object} Balance info
 */
function getBalance(address) {
  validateAddress(address);
  const state = loadState();
  return {
    address,
    balance: state.balances[address] || 0,
    symbol: TOKEN.symbol
  };
}

/**
 * Get all mint events (audit log).
 * @returns {Array} List of mint events
 */
function getMintEvents() {
  const state = loadState();
  return state.mintEvents;
}

// Initialize state file on module load
loadState();

export {
  getBlockchainInfo,
  getSupply,
  mintTokens,
  getBalance,
  getMintEvents
};
