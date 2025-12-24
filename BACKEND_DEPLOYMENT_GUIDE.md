# StampCoin Backend Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the StampCoin backend to Railway (or alternative platforms).

---

## Prerequisites

- ✅ Railway account (https://railway.app)
- ✅ GitHub repository with backend code
- ✅ Environment variables ready
- ✅ Database URL (TiDB Cloud)

---

## Deployment Options

### Option 1: Railway (Recommended)

**Why Railway?**
- ✅ Easy deployment
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Built-in database support
- ✅ Environment variable management

### Option 2: Render

**Why Render?**
- ✅ Free tier with limitations
- ✅ Auto-deploy from GitHub
- ✅ Good for Node.js apps

### Option 3: Heroku

**Why Heroku?**
- ✅ Mature platform
- ✅ Extensive documentation
- ✅ Many add-ons

---

## Railway Deployment Steps

### Step 1: Prepare Repository

1. **Push code to GitHub:**
   ```bash
   cd /home/ubuntu/stampcoin-platform
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Ensure these files exist:**
   - ✅ `Dockerfile`
   - ✅ `.dockerignore`
   - ✅ `railway.json`
   - ✅ `package.json`

### Step 2: Create Railway Project

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `stampcoin-platform` repository
4. Railway will detect the Dockerfile automatically

### Step 3: Configure Environment Variables

In Railway Dashboard → Variables, add:

```
DATABASE_URL=your_tidb_database_url_here

STRIPE_SECRET_KEY=your_stripe_secret_key_here

STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

SESSION_SECRET=your_session_secret_here

NODE_ENV=production

PORT=3000
```

### Step 4: Deploy

1. Railway will automatically build and deploy
2. Wait for deployment to complete (2-5 minutes)
3. Get your backend URL (e.g., `https://stampcoin-backend.up.railway.app`)

### Step 5: Verify Deployment

Test the backend:
```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{"status": "ok", "timestamp": "2025-12-23T..."}
```

---

## Alternative: Render Deployment

### Step 1: Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name:** stampcoin-backend
   - **Environment:** Node
   - **Build Command:** `pnpm install && pnpm run build`
   - **Start Command:** `node dist/index.js`
   - **Plan:** Free

### Step 3: Add Environment Variables

Same as Railway (see above)

### Step 4: Deploy

Render will automatically deploy on every push to main branch.

---

## Alternative: Heroku Deployment

### Step 1: Install Heroku CLI

```bash
npm install -g heroku
```

### Step 2: Login and Create App

```bash
heroku login
heroku create stampcoin-backend
```

### Step 3: Add Buildpack

```bash
heroku buildpacks:set heroku/nodejs
```

### Step 4: Set Environment Variables

```bash
heroku config:set DATABASE_URL="your_database_url"
heroku config:set STRIPE_SECRET_KEY="your_stripe_key"
# ... add all other variables
```

### Step 5: Deploy

```bash
git push heroku main
```

---

## Files Created for Deployment

### 1. Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### 2. .dockerignore
Excludes unnecessary files from Docker build

### 3. railway.json
Railway-specific configuration

### 4. start-production.sh
Production startup script with validation

---

## Post-Deployment Steps

### 1. Update Frontend

Update frontend to use new backend URL:

**In Netlify:**
1. Go to Site Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
3. Redeploy frontend

### 2. Configure CORS

Ensure backend allows frontend origin:
```typescript
// In server/_core/index.ts
app.use(cors({
  origin: 'https://frolicking-conkies-18edaf.netlify.app',
  credentials: true
}));
```

### 3. Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add new endpoint:
   ```
   https://your-backend-url.railway.app/api/stripe-webhook
   ```
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 4. Test All Features

- ✅ User registration/login
- ✅ Stamp marketplace
- ✅ Payment processing
- ✅ User dashboard
- ✅ Reviews and ratings

---

## Troubleshooting

### Build Fails

**Check:**
- All dependencies in `package.json`
- Node version compatibility
- Build logs for errors

### Database Connection Fails

**Check:**
- DATABASE_URL is correct
- Database is accessible from Railway
- SSL settings are correct

### API Calls Fail

**Check:**
- CORS configuration
- Frontend API URL is correct
- Environment variables are set

---

## Monitoring & Maintenance

### Railway Dashboard

- View logs in real-time
- Monitor resource usage
- Set up alerts

### Health Checks

Add health check endpoint:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Logging

Use structured logging:
```typescript
console.log(JSON.stringify({
  level: 'info',
  message: 'Server started',
  port: PORT
}));
```

---

## Security Best Practices

1. ✅ Use environment variables for secrets
2. ✅ Enable HTTPS only
3. ✅ Implement rate limiting
4. ✅ Validate all inputs
5. ✅ Keep dependencies updated
6. ✅ Monitor for security vulnerabilities

---

## Cost Estimates

### Railway
- **Free Tier:** $5 credit/month
- **Hobby:** $5/month
- **Pro:** $20/month

### Render
- **Free:** Limited resources
- **Starter:** $7/month
- **Standard:** $25/month

### Heroku
- **Free:** Discontinued
- **Eco:** $5/month
- **Basic:** $7/month

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Configure environment variables
3. ✅ Update frontend API URL
4. ✅ Test all features
5. ✅ Set up monitoring
6. ✅ Configure custom domain (optional)

---

## Support

For issues or questions:
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Heroku Docs: https://devcenter.heroku.com

---

**Ready to deploy? Follow the steps above!**
