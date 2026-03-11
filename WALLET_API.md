# Digital Wallet API Documentation

# واجهة برمجة تطبيقات المحفظة الرقمية

## Overview | نظرة عامة

The Digital Wallet API provides endpoints for managing digital wallets, balances, stamps, and peer-to-peer transfers in the Stampcoin platform.

## Base URL

```
http://localhost:10000/api
```

## Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <SYNC_TOKEN>
```

## Endpoints | نقاط النهاية

### 1. Create Wallet | إنشاء محفظة

**POST** `/api/wallet/create`

```json
{ "userId": "user123", "userName": "Ahmed Ali" }
```

**Response (200 OK):**

```json
{
  "userId": "user123",
  "userName": "Ahmed Ali",
  "balance": 0,
  "stamps": [],
  "createdAt": "2026-02-07T18:35:00.000Z",
  "updatedAt": "2026-02-07T18:35:00.000Z"
}
```

---

### 2. Get Wallet | الحصول على المحفظة

**GET** `/api/wallet/:userId`

---

### 3. Get All Wallets (Admin) 🔒

**GET** `/api/wallets`

Requires authentication.

---

### 4. Transfer | التحويل

**POST** `/api/wallet/transfer`

```json
{ "fromUserId": "user123", "toUserId": "user456", "amount": 50 }
```

**Response:**

```json
{
  "id": "transaction-uuid-1",
  "from": "user123",
  "to": "user456",
  "amount": 50,
  "stampId": null,
  "timestamp": "2026-02-07T18:55:00.000Z",
  "status": "completed"
}
```

---

### 5. Get Transaction History | سجل المعاملات

**GET** `/api/wallet/:userId/transactions`

---

### 6. Add Stamp to Wallet 🔒 | إضافة طابع

**POST** `/api/wallet/:userId/stamps`

Requires authentication.

```json
{
  "name": "Olympic Games 2024",
  "value": 75,
  "rarity": "limited",
  "description": "Commemorative Olympic stamp"
}
```

---

### 7. Top Up Balance 🔒 | شحن الرصيد

**POST** `/api/wallet/:userId/topup`

Requires authentication.

```json
{ "amount": 1000 }
```

---

## Error Codes

- **400** Bad Request: Invalid input or business rule violation
- **401** Unauthorized: Missing or invalid authentication token
- **404** Not Found: Wallet not found
- **500** Internal Server Error

---

## See Also

- [MARKET_API.md](MARKET_API.md) — Market Institution API documentation
- [BLOCKCHAIN_API.md](BLOCKCHAIN_API.md) — Blockchain API documentation
- [README.md](README.md) — General platform documentation
