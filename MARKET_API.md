# Market Institution API (مؤسسة السوق)

## Overview / نظرة عامة

The Market Institution API provides endpoints for managing a digital marketplace where users can list, browse, update, and purchase digital stamps and collectibles.

## Base URL

```
http://localhost:10000/api/market
```

## Endpoints

### 1. Get All Market Items

**GET** `/api/market/items`

Get a list of all items in the market with optional filtering.

**Query Parameters:**

- `status` (optional): Filter by item status (`available`, `sold`)
- `type` (optional): Filter by item type (e.g., `stamp`, `collectible`)
- `sellerId` (optional): Filter by seller user ID

**Example Response:**

```json
[
  {
    "id": "item_1234567890_abc123",
    "sellerId": "user123",
    "name": "Rare Stamp 1",
    "description": "Vintage 1950s stamp",
    "price": 100,
    "type": "stamp",
    "imageUrl": "https://example.com/image.jpg",
    "status": "available",
    "listedAt": "2026-02-07T21:25:31.333Z"
  }
]
```

---

### 2. Get Market Item by ID

**GET** `/api/market/items/:itemId`

**Error Response (404):**

```json
{ "error": "Market item not found" }
```

---

### 3. Add Item to Market

**POST** `/api/market/items`

**Request Body:**

```json
{
  "sellerId": "user123",
  "name": "Rare Stamp 1",
  "description": "Vintage 1950s stamp",
  "price": 100,
  "type": "stamp",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

### 4. Update Market Item

**PUT** `/api/market/items/:itemId`

Only the seller can update their own listing.

**Request Body:**

```json
{
  "userId": "user123",
  "price": 120,
  "description": "Updated description"
}
```

**Error Responses:**

- `400` — `userId` missing or no updatable fields provided
- `403` — caller is not the seller
- `404` — item not found

---

### 5. Purchase Market Item

**POST** `/api/market/items/:itemId/buy`

**Request Body:**

```json
{ "buyerId": "user456" }
```

---

### 6. Remove Market Item

**DELETE** `/api/market/items/:itemId`

**Request Body:**

```json
{ "userId": "user123" }
```

---

### 7. Get Market Transaction History

**GET** `/api/market/transactions`

**Query Parameters:**

- `buyerId` (optional)
- `sellerId` (optional)

---

## See Also

- [WALLET_API.md](WALLET_API.md) — Digital Wallet API documentation
- [BLOCKCHAIN_API.md](BLOCKCHAIN_API.md) — Blockchain API documentation
- [README.md](README.md) — General platform documentation
