# StampCoin Platform - Deployment Instructions

**Date:** December 21, 2025  
**Status:** Ready for Deployment

---

## Quick Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Navigate to project directory
cd /home/ubuntu/stampcoin-platform

# Login to Vercel (opens browser)
npx vercel login

# Deploy to production
npx vercel --prod
```

### Option 2: Vercel Dashboard (Web Interface)

1. Go to https://vercel.com/new
2. Import Git Repository or upload project
3. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables (see below)
5. Click "Deploy"

### Option 3: GitHub Integration

1. Push code to GitHub repository
2. Connect GitHub to Vercel
3. Import repository from Vercel dashboard
4. Configure and deploy

---

## Environment Variables Required

Add these environment variables in Vercel dashboard:

```env
# Database
DATABASE_URL=your_database_url_here

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Session
SESSION_SECRET=your_random_session_secret

# Environment
NODE_ENV=production
```

---

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] All features implemented
- [x] All tests passing (9/9)
- [x] No TypeScript errors
- [x] Code committed to Git

### ✅ Database Setup
- [ ] Production database created
- [ ] DATABASE_URL configured
- [ ] Migrations run
- [ ] Sample data seeded (optional)

### ✅ Stripe Configuration
- [ ] Stripe account verified
- [ ] Live API keys obtained
- [ ] Webhook endpoint configured
- [ ] Products created in Stripe

### ✅ Domain Setup (Optional)
- [ ] Custom domain purchased
- [ ] DNS configured
- [ ] SSL certificate (automatic with Vercel)

---

## Step-by-Step Deployment Guide

### Step 1: Prepare Database

```bash
# Create production database (example with Railway)
# Or use any provider: PlanetScale, Supabase, Neon, etc.

# Set DATABASE_URL in .env.production
DATABASE_URL="postgresql://user:password@host:5432/stampcoin"

# Run migrations
npm run db:push
```

### Step 2: Configure Stripe

1. Go to https://dashboard.stripe.com
2. Switch to "Live mode" (toggle in top right)
3. Get your live API keys:
   - Developers → API keys
   - Copy "Secret key"
4. Create webhook:
   - Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy "Signing secret"

### Step 3: Deploy to Vercel

#### Via CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? stampcoin-platform
# - Directory? ./
# - Override settings? No
```

#### Via Dashboard:

1. Visit https://vercel.com/new
2. Click "Import Project"
3. Select "Import Git Repository" or "Upload"
4. Configure:
   - Project Name: `stampcoin-platform`
   - Framework: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Click "Deploy"

### Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add all required variables:
   - DATABASE_URL
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - SESSION_SECRET
   - NODE_ENV=production

### Step 5: Update Stripe Webhook

After deployment:
1. Copy your Vercel URL (e.g., `stampcoin-platform.vercel.app`)
2. Go to Stripe Dashboard → Webhooks
3. Update endpoint URL to: `https://stampcoin-platform.vercel.app/api/stripe-webhook`
4. Save changes

### Step 6: Test Deployment

1. Visit your deployed URL
2. Test key features:
   - Browse marketplace
   - View stamp details
   - Add to favorites
   - Test payment flow (use Stripe test cards in test mode first)
   - Check reviews system
   - Test partner application

### Step 7: Custom Domain (Optional)

1. In Vercel Dashboard, go to Project Settings → Domains
2. Add your custom domain (e.g., `stampcoin.io`)
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate will be automatically provisioned

---

## Alternative Deployment Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Render

1. Go to https://render.com
2. New → Web Service
3. Connect repository
4. Configure build settings
5. Add environment variables
6. Deploy

---

## Post-Deployment Tasks

### 1. Monitor Performance
- Check Vercel Analytics
- Monitor error logs
- Track response times

### 2. SEO Optimization
- Submit sitemap to Google Search Console
- Configure meta tags
- Set up Google Analytics

### 3. Security
- Enable Vercel firewall
- Configure CORS if needed
- Set up rate limiting

### 4. Backup
- Set up database backups
- Export Stripe data regularly
- Version control all code

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
**Solution:** Check package.json dependencies, run `npm install`

**Error:** `TypeScript errors`
**Solution:** Run `npm run check` locally, fix errors

### Database Connection Issues

**Error:** `Connection timeout`
**Solution:** 
- Check DATABASE_URL is correct
- Verify database allows connections from Vercel IPs
- Check firewall rules

### Stripe Webhook Not Working

**Error:** `Webhook signature verification failed`
**Solution:**
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint URL
- Ensure webhook is in live mode (not test mode)

### Environment Variables Not Loading

**Solution:**
- Redeploy after adding environment variables
- Check variable names match exactly
- Verify no extra spaces in values

---

## Deployment Checklist

Before going live:

- [ ] All tests passing
- [ ] Database configured and migrated
- [ ] Stripe live keys configured
- [ ] Webhook endpoint set up
- [ ] Environment variables added
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Payment flow tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Stripe Documentation:** https://stripe.com/docs
- **Project Repository:** (Add your GitHub URL here)
- **Support Email:** azadzedan13@gmail.com

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Type check
npm run check

# Database push
npm run db:push

# Deploy to Vercel
npx vercel --prod

# View deployment logs
npx vercel logs

# View environment variables
npx vercel env ls
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** December 21, 2025  
**Status:** ✅ Ready for Production

