# Blockchain API Documentation
# واجهة برمجة تطبيقات البلوك تشين

## Overview | نظرة عامة

The Blockchain API provides endpoints for interacting with the STP (StampCoin) BEP-20 token on BNB Smart Chain. It supports querying token metadata, supply metrics, minting tokens, and checking address balances.

## Base URL

```
http://localhost:10000/api
```

## Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <SYNC_TOKEN>
```

> **Note:** In development mode (`NODE_ENV` is not `production` and `SYNC_TOKEN` is unset), authentication is bypassed automatically. **Always set `SYNC_TOKEN` and `NODE_ENV=production` in production deployments to enforce authentication.**

---

## Endpoints | نقاط النهاية

### 1. Get Blockchain Info | معلومات البلوك تشين

**GET** `/api/blockchain/info`

Returns static token and blockchain metadata.

**Response:**
```json
{
  "name": "StampCoin",
  "symbol": "STP",
  "decimals": 18,
  "totalSupply": 421000000,
  "blockchain": "BNB Smart Chain",
  "consensus": "Proof of Staked Authority (PoSA)",
  "standard": "BEP-20",
  "network": "BSC Mainnet",
  "chainId": 56,
  "contractAddress": "Pending mainnet deployment"
}
```

---

### 2. Get Token Supply | إحصائيات الإمداد

**GET** `/api/blockchain/supply`

Returns current token supply metrics.

**Response:**
```json
{
  "totalSupply": 421000000,
  "mintedSupply": 1000,
  "remainingSupply": 420999000,
  "symbol": "STP",
  "decimals": 18
}
```

---

### 3. Mint Tokens 🔒 | سك الرموز

**POST** `/api/blockchain/mint`

Mint new STP tokens to a specified address. Requires authentication.

**Request Body:**
```json
{
  "toAddress": "wallet_address_here",
  "amount": 1000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toAddress` | string | ✅ | Recipient wallet address |
| `amount` | integer | ✅ | Number of whole STP tokens to mint (positive integer) |

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "type": "mint",
  "to": "wallet_address_here",
  "amount": 1000,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` — Missing or invalid `toAddress` / `amount`
- `400` — Mint would exceed total supply cap
- `401` — Missing or invalid token

---

### 4. Get Address Balance | رصيد العنوان

**GET** `/api/blockchain/balance/:address`

Get the STP token balance for a specific address.

**Response:**
```json
{
  "address": "wallet_address_here",
  "balance": 1000,
  "symbol": "STP"
}
```

**Error Responses:**
- `400` — Invalid address

---

### 5. Get Mint Events 🔒 | سجل السك

**GET** `/api/blockchain/mint/events`

Get the complete mint audit log. Requires authentication.

**Response:**
```json
[
  {
    "id": "uuid-here",
    "type": "mint",
    "to": "wallet_address_here",
    "amount": 1000,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` — Missing or invalid token

---

## Token Details | تفاصيل الرمز

| Property | Value |
|----------|-------|
| **Name** | StampCoin |
| **Symbol** | STP |
| **Decimals** | 18 |
| **Total Supply** | 421,000,000 STP |
| **Blockchain** | BNB Smart Chain (BSC) |
| **Standard** | BEP-20 |
| **Consensus** | Proof of Staked Authority (PoSA) |
| **Chain ID** | 56 |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SYNC_TOKEN` | Bearer token for protected endpoints |
| `STP_CONTRACT_ADDRESS` | On-chain contract address (defaults to `"Pending mainnet deployment"`) |
