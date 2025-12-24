import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { randomBytes } from "crypto";
import Stripe from 'stripe';
import { STAMP_PRODUCTS } from './products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
  }),

  // Stamps
  stamps: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        rarity: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllStamps(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStampById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        country: z.string(),
        year: z.number(),
        categoryId: z.number(),
        rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare', 'legendary']),
        price: z.string(),
        imageUrl: z.string().optional(),
        issuedBy: z.string().optional(),
        denomination: z.string().optional(),
        color: z.string().optional(),
        perforation: z.string().optional(),
        watermark: z.string().optional(),
        printingMethod: z.string().optional(),
        designer: z.string().optional(),
        engraver: z.string().optional(),
        quantity: z.number().optional(),
        condition: z.string().optional(),
        certificateUrl: z.string().optional(),
        historicalSignificance: z.string().optional(),
        marketTrend: z.string().optional(),
        estimatedValue: z.string().optional(),
        lastSoldPrice: z.string().optional(),
        lastSoldDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createStamp({
          ...input,
          ownerId: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        country: z.string().optional(),
        year: z.number().optional(),
        categoryId: z.number().optional(),
        rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare', 'legendary']).optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        return await db.updateStamp(id, updateData);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteStamp(input.id);
      }),
  }),

  // Favorites
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserFavorites(ctx.user.id);
    }),
    
    check: protectedProcedure
      .input(z.object({ stampId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.isFavorite(ctx.user.id, input.stampId);
      }),
    
    add: protectedProcedure
      .input(z.object({ stampId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.addFavorite({
          userId: ctx.user.id,
          stampId: input.stampId,
        });
      }),
    
    remove: protectedProcedure
      .input(z.object({ stampId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.removeFavorite(ctx.user.id, input.stampId);
      }),
  }),

  // Transactions
  transactions: router({
    myTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTransactions(ctx.user.id);
    }),
    
    stampHistory: publicProcedure
      .input(z.object({ stampId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStampTransactions(input.stampId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        stampId: z.number(),
        sellerId: z.number(),
        price: z.string(),
        transactionHash: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTransaction({
          ...input,
          buyerId: ctx.user.id,
          status: 'pending',
        });
      }),
  }),

  // Upload
  upload: router({    uploadImage: protectedProcedure
      .input(z.object({
        fileData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const randomSuffix = randomBytes(8).toString('hex');
        const fileKey = `stamps/${ctx.user.id}-${randomSuffix}-${input.fileName}`;
        
        // Convert base64 to buffer
        const base64Data = input.fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload to S3
        const result = await storagePut(fileKey, buffer, input.mimeType);
        
        return {
          url: result.url,
          key: fileKey,
        };
      }),
  }),

  // Stripe Payments
  payments: router({
    createCheckout: protectedProcedure
      .input(z.object({
        stampId: z.number(),
        productId: z.string(),
        paymentMethod: z.enum(['card', 'paypal', 'apple_pay', 'google_pay']).default('card'),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const product = STAMP_PRODUCTS[input.productId];
          
          if (!product) {
            throw new Error('Product not found');
          }

          const origin = ctx.req.headers.origin || 'http://localhost:3000';
          
          const paymentMethodMap: Record<string, string[]> = {
            card: ['card'],
            paypal: ['paypal'],
            apple_pay: ['apple_pay'],
            google_pay: ['google_pay'],
          };
          
          const paymentMethods = paymentMethodMap[input.paymentMethod] || ['card'];

          const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethods as any,
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: product.name,
                    description: product.description,
                  },
                  unit_amount: Math.round(product.price * 100),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${origin}/dashboard?payment=success&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/marketplace?payment=cancelled`,
            customer_email: ctx.user.email || undefined,
            client_reference_id: ctx.user.id.toString(),
            metadata: {
              user_id: ctx.user.id.toString(),
              customer_email: ctx.user.email || '',
              customer_name: ctx.user.name || '',
              stamp_id: input.stampId.toString(),
              product_id: input.productId,
              payment_method: input.paymentMethod,
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
          });

          return {
            url: session.url,
            sessionId: session.id,
            paymentMethod: input.paymentMethod,
          };
        } catch (error: any) {
          console.error('[Payments] Checkout creation failed:', error);
          throw new Error(`Failed to create checkout session: ${error.message}`);
        }
      }),
    
    validateCheckout: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          return {
            status: session.payment_status,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_email,
            metadata: session.metadata,
          };
        } catch (error: any) {
          console.error('[Payments] Session validation failed:', error);
          throw new Error('Invalid session ID');
        }
      }),
    
    getPaymentMethods: publicProcedure.query(async () => {
      return [
        {
          id: 'card',
          name: 'Credit/Debit Card',
          description: 'Visa, Mastercard, American Express, Discover',
          icon: 'CreditCard',
          supported: true,
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Fast and secure payments with PayPal',
          icon: 'PayPal',
          supported: true,
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          description: 'Quick and secure payments with Apple Pay',
          icon: 'Apple',
          supported: true,
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          description: 'Fast checkout with Google Pay',
          icon: 'Google',
          supported: true,
        },
      ];
    }),
  }),

  // Reviews
  reviews: router({    create: protectedProcedure
      .input(z.object({
        stampId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createReview({
          ...input,
          userId: ctx.user.id,
        });
      }),
    
    getStampReviews: publicProcedure
      .input(z.object({ stampId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStampReviews(input.stampId);
      }),
    
    getStampRating: publicProcedure
      .input(z.object({ stampId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStampAverageRating(input.stampId);
      }),
    
    myReviews: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserReviews(ctx.user.id);
    }),
  }),

  // Contact Messages
  contact: router({
    send: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        subject: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.createContactMessage(input);
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admin can view all messages
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await db.getAllContactMessages();
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can mark messages as read
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.markMessageAsRead(input.id);
      }),
  }),

  // Partners
  partners: router({
    list: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        tier: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.status) {
          return await db.getAllPartners(input.status);
        }
        return await db.getAllPartners();
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPartnerById(input.id);
      }),
    
    getByTier: publicProcedure
      .input(z.object({ tier: z.string() }))
      .query(async ({ input }) => {
        return await db.getPartnersByTier(input.tier);
      }),
    
    create: protectedProcedure
      .input(z.object({
        companyName: z.string(),
        companyNameAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        website: z.string().optional(),
        tier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']),
        totalInvestment: z.string(),
        contactPerson: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createPartner({
          ...input,
          userId: ctx.user.id,
          status: 'pending',
        });
      }),
    
    getMyPartner: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPartnerByUserId(ctx.user.id);
    }),
    
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.approvePartner(input.id, ctx.user.id);
      }),
    
    reject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return await db.rejectPartner(input.id, ctx.user.id);
      }),
    
    benefits: router({
      list: publicProcedure
        .input(z.object({ partnerId: z.number() }))
        .query(async ({ input }) => {
          return await db.getPartnerBenefits(input.partnerId);
        }),
      
      create: protectedProcedure
        .input(z.object({
          partnerId: z.number(),
          benefitType: z.enum(['discount', 'commission', 'feature', 'support', 'branding', 'exclusive_access']),
          description: z.string(),
          value: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          return await db.createPartnerBenefit(input);
        }),
    }),
    
    transactions: router({
      list: protectedProcedure
        .input(z.object({ partnerId: z.number() }))
        .query(async ({ input, ctx }) => {
          const partner = await db.getPartnerById(input.partnerId);
          if (!partner || (partner.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
            throw new Error('Unauthorized');
          }
          return await db.getPartnerTransactions(input.partnerId);
        }),
      
      create: protectedProcedure
        .input(z.object({
          partnerId: z.number(),
          type: z.enum(['purchase', 'commission', 'reward', 'refund']),
          amount: z.string(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          return await db.createPartnerTransaction({
            ...input,
            status: 'pending',
          });
        }),
      
      getTotalEarnings: protectedProcedure
        .input(z.object({ partnerId: z.number() }))
        .query(async ({ input, ctx }) => {
          const partner = await db.getPartnerById(input.partnerId);
          if (!partner || (partner.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
            throw new Error('Unauthorized');
          }
          return await db.getPartnerTotalEarnings(input.partnerId);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
