/**
 * Express router for the Blockchain API endpoints.
 *
 * Extracted into its own module so routes can be tested independently
 * of the full server.js startup.
 */

"use strict";

import { Router } from "express";
import * as blockchain from "./blockchain.js";

/**
 * Build and return an Express Router with all blockchain API routes.
 *
 * @param {string} syncToken - Bearer token required for protected endpoints.
 *   Pass an empty string to use development-mode auth bypass.
 * @returns {import("express").Router}
 */
export function createBlockchainRouter(syncToken) {
  const router = Router();

  function requireToken(req, res, next) {
    const auth = req.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!syncToken) {
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.warn("SYNC_TOKEN not configured - authentication disabled (development mode)");
      return next();
    }
    if (token !== syncToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  // GET /info — static token metadata
  router.get("/info", (_req, res) => {
    try {
      res.json(blockchain.getBlockchainInfo());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /supply — current supply metrics
  router.get("/supply", (_req, res) => {
    try {
      res.json(blockchain.getSupply());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /mint — mint new STP tokens (protected)
  router.post("/mint", requireToken, (req, res) => {
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

  // GET /balance/:address — balance for a given address
  router.get("/balance/:address", (req, res) => {
    try {
      res.json(blockchain.getBalance(req.params.address));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // GET /mint/events — full mint audit log (protected)
  router.get("/mint/events", requireToken, (_req, res) => {
    try {
      res.json(blockchain.getMintEvents());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
