/**
 * Stamp products and prices for Stripe integration
 * Define all available stamp products here for centralized management
 */

export interface StampProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  stripePriceId?: string; // Will be set when creating products in Stripe
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  imageUrl?: string;
}

/**
 * Available stamp products
 * These will be created as products in Stripe
 */
export const STAMP_PRODUCTS: Record<string, StampProduct> = {
  COMMON_STAMP: {
    id: 'common_stamp',
    name: 'Common Digital Stamp',
    description: 'A beautiful common digital stamp for your collection',
    price: 9.99,
    rarity: 'common',
  },
  UNCOMMON_STAMP: {
    id: 'uncommon_stamp',
    name: 'Uncommon Digital Stamp',
    description: 'A rare uncommon digital stamp with unique design',
    price: 29.99,
    rarity: 'uncommon',
  },
  RARE_STAMP: {
    id: 'rare_stamp',
    name: 'Rare Digital Stamp',
    description: 'A highly sought-after rare digital stamp',
    price: 99.99,
    rarity: 'rare',
  },
  VERY_RARE_STAMP: {
    id: 'very_rare_stamp',
    name: 'Very Rare Digital Stamp',
    description: 'An extremely rare digital stamp for serious collectors',
    price: 299.99,
    rarity: 'very_rare',
  },
  LEGENDARY_STAMP: {
    id: 'legendary_stamp',
    name: 'Legendary Digital Stamp',
    description: 'The ultimate legendary digital stamp - a true masterpiece',
    price: 999.99,
    rarity: 'legendary',
  },
};

/**
 * Get product by ID
 */
export function getProduct(productId: string): StampProduct | undefined {
  return STAMP_PRODUCTS[productId];
}

/**
 * Get all products
 */
export function getAllProducts(): StampProduct[] {
  return Object.values(STAMP_PRODUCTS);
}

/**
 * Get product by rarity
 */
export function getProductsByRarity(rarity: StampProduct['rarity']): StampProduct[] {
  return getAllProducts().filter(product => product.rarity === rarity);
}
