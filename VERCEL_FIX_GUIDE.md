# Vercel Deployment Fix Guide

## Problem

The website shows "404: NOT_FOUND" error because Vercel cannot find the built files.

## Root Cause

This is a full-stack application (Frontend + Backend) and requires special configuration for Vercel.

## Solution

### Option 1: Update vercel.json (Recommended)

I've created an optimized `vercel.json` file. Upload it to your GitHub repository:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/dist/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/index.html"
    }
  ]
}
```

### Option 2: Configure in Vercel Dashboard

Go to: **Settings → Build & Development Settings**

Set these values:
- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`
- **Root Directory:** (leave empty)

### Option 3: Deploy as Static Site Only

If you want to deploy only the frontend:

1. Go to Settings → Build & Development Settings
2. Set:
   - **Framework Preset:** Vite
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `npm install`

### Option 4: Split Frontend and Backend

Deploy frontend and backend separately:

**Frontend (Vercel):**
- Deploy only the `client` folder
- Set root directory to `client`
- Framework: Vite

**Backend (Railway/Render):**
- Deploy the server separately
- Update API endpoints in frontend

## Steps to Fix

1. **Upload vercel.json to GitHub:**
   - Go to https://github.com/AzadZedan/stampcoin-platform
   - Create new file: `vercel.json`
   - Copy the content above
   - Commit

2. **Redeploy in Vercel:**
   - Go to Deployments
   - Click "..." → "Redeploy"
   - Wait for build to complete

3. **Check the website:**
   - Visit: https://stampcoin-platform-com.vercel.app
   - Should work now!

## Alternative: Use Vercel CLI

```bash
cd /home/ubuntu/stampcoin-platform
vercel login
vercel --prod
```

## Environment Variables

Don't forget to add these in Vercel Settings → Environment Variables:

```
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SESSION_SECRET=your_session_secret
```

## Troubleshooting

### If still getting 404:

1. Check Build Logs for errors
2. Verify `dist/public/index.html` exists after build
3. Try deploying with different framework preset
4. Contact Vercel support with deployment ID

### If build fails:

1. Check that all dependencies are in `package.json`
2. Verify Node.js version compatibility
3. Check for TypeScript errors
4. Review build command output

## Support

If you need help:
- Vercel Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

**File Location:** `/home/ubuntu/stampcoin-platform/vercel.json`  
**Created:** December 22, 2025
