#!/usr/bin/env node
/**
 * Seed script to populate the database with sample stamps and categories
 * Run with: tsx server/seed-data.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { categories, stamps } from '../drizzle/schema.js';
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL);

const sampleCategories = [
  { name: 'Vintage', description: 'Classic stamps from the golden age of philately' },
  { name: 'Modern', description: 'Contemporary stamps with innovative designs' },
  { name: 'Historical', description: 'Stamps commemorating important historical events' },
  { name: 'Nature', description: 'Beautiful stamps featuring flora and fauna' },
  { name: 'Art', description: 'Stamps showcasing famous artworks and artists' },
  { name: 'Sports', description: 'Stamps celebrating athletic achievements' },
];

const sampleStamps = [
  {
    title: 'Penny Black 1840',
    description: 'The world\'s first adhesive postage stamp, featuring Queen Victoria. A cornerstone of philatelic history.',
    price: 999.99,
    rarity: 'legendary',
    year: 1840,
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800',
    categoryId: 1,
  },
  {
    title: 'Inverted Jenny 1918',
    description: 'Famous US airmail stamp with inverted airplane print. One of the most valuable stamp errors.',
    price: 1499.99,
    rarity: 'legendary',
    year: 1918,
    country: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800',
    categoryId: 1,
  },
  {
    title: 'Blue Mauritius 1847',
    description: 'Rare colonial stamp from Mauritius, highly sought after by collectors worldwide.',
    price: 899.99,
    rarity: 'very_rare',
    year: 1847,
    country: 'Mauritius',
    imageUrl: 'https://images.unsplash.com/photo-1606041011872-596597976b25?w=800',
    categoryId: 1,
  },
  {
    title: 'Olympic Games Munich 1972',
    description: 'Commemorative stamp series celebrating the Munich Olympics with iconic design.',
    price: 149.99,
    rarity: 'rare',
    year: 1972,
    country: 'Germany',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    categoryId: 6,
  },
  {
    title: 'Moon Landing Apollo 11',
    description: 'Historic stamp commemorating humanity\'s first steps on the moon in 1969.',
    price: 299.99,
    rarity: 'rare',
    year: 1969,
    country: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    categoryId: 3,
  },
  {
    title: 'Mona Lisa Louvre Edition',
    description: 'Beautiful stamp featuring Leonardo da Vinci\'s masterpiece, the Mona Lisa.',
    price: 79.99,
    rarity: 'uncommon',
    year: 2010,
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
    categoryId: 5,
  },
  {
    title: 'Giant Panda Conservation',
    description: 'Modern stamp supporting wildlife conservation, featuring the beloved giant panda.',
    price: 49.99,
    rarity: 'uncommon',
    year: 2020,
    country: 'China',
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
    categoryId: 4,
  },
  {
    title: 'Sakura Cherry Blossom',
    description: 'Elegant Japanese stamp celebrating the beauty of cherry blossoms in spring.',
    price: 39.99,
    rarity: 'common',
    year: 2021,
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800',
    categoryId: 4,
  },
  {
    title: 'Eiffel Tower Centennial',
    description: 'Commemorative stamp marking 100 years of the iconic Eiffel Tower.',
    price: 89.99,
    rarity: 'uncommon',
    year: 1989,
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    categoryId: 3,
  },
  {
    title: 'Taj Mahal Heritage',
    description: 'Stunning stamp showcasing India\'s architectural marvel, the Taj Mahal.',
    price: 59.99,
    rarity: 'common',
    year: 2015,
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    categoryId: 3,
  },
  {
    title: 'Van Gogh Starry Night',
    description: 'Art stamp featuring Vincent van Gogh\'s famous painting, Starry Night.',
    price: 69.99,
    rarity: 'uncommon',
    year: 2018,
    country: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
    categoryId: 5,
  },
  {
    title: 'FIFA World Cup 2018',
    description: 'Official stamp commemorating the 2018 FIFA World Cup in Russia.',
    price: 45.99,
    rarity: 'common',
    year: 2018,
    country: 'Russia',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    categoryId: 6,
  },
  {
    title: 'Great Wall of China',
    description: 'Majestic stamp depicting one of the Seven Wonders of the World.',
    price: 55.99,
    rarity: 'common',
    year: 2016,
    country: 'China',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    categoryId: 3,
  },
  {
    title: 'Butterfly Collection Series',
    description: 'Beautiful nature stamp featuring rare butterfly species from around the world.',
    price: 34.99,
    rarity: 'common',
    year: 2022,
    country: 'Brazil',
    imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800',
    categoryId: 4,
  },
  {
    title: 'Space Exploration Mars',
    description: 'Modern stamp celebrating humanity\'s journey to explore the Red Planet.',
    price: 99.99,
    rarity: 'rare',
    year: 2021,
    country: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800',
    categoryId: 2,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert categories
    console.log('📁 Inserting categories...');
    for (const category of sampleCategories) {
      await db.insert(categories).values(category);
    }
    console.log(`✅ Inserted ${sampleCategories.length} categories`);

    // Insert stamps
    console.log('🖼️  Inserting stamps...');
    for (const stamp of sampleStamps) {
      await db.insert(stamps).values(stamp);
    }
    console.log(`✅ Inserted ${sampleStamps.length} stamps`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
