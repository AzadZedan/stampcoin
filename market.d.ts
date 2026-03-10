export interface MarketItem {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  type: string;
  imageUrl: string;
  status: "available" | "sold";
  listedAt: string;
}

export interface MarketTransaction {
  id: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
  price: number;
  timestamp: string;
}

export interface MarketItemFilter {
  status?: string;
  type?: string;
  sellerId?: string;
}

export interface MarketTransactionFilter {
  buyerId?: string;
  sellerId?: string;
}

export function addMarketItem(
  sellerId: string,
  item: {
    name: string;
    description?: string;
    price?: number;
    type?: string;
    imageUrl?: string;
  },
): MarketItem;

export function getAllMarketItems(filter?: MarketItemFilter): MarketItem[];

export function getMarketItem(itemId: string): MarketItem;

export function updateMarketItem(
  itemId: string,
  updates: {
    name?: string;
    price?: number;
    description?: string;
    status?: string;
    imageUrl?: string;
  },
): MarketItem;

export function purchaseMarketItem(
  itemId: string,
  buyerId: string,
): { transaction: MarketTransaction; item: MarketItem };

export function removeMarketItem(
  itemId: string,
  userId: string,
): { success: boolean; message: string };

export function getMarketTransactions(
  filter?: MarketTransactionFilter,
): MarketTransaction[];
