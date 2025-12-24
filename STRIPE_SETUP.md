# Stripe Integration Setup Guide

## Current Status

✅ **Stripe Integration Implemented**
- Payment checkout API configured
- Webhook handler created for payment events
- Test sandbox environment available

✅ **Action Required: Claim Your Stripe Test Sandbox**

**Activation Status:** In Progress - Attempting to claim the sandbox now.

## Step 1: Claim Your Stripe Test Sandbox

Your Stripe test sandbox has been created but needs to be claimed before you can process test payments.

**Claim URL:** https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU2dDdDRLM2ppWXB4VTZXLDE3NjY4Nzg5MTkv100GDaWZ0Hf

**Expiration Date:** February 18, 2026

### How to Claim:

1. Visit the claim URL above
2. Follow the Stripe instructions to activate your test account
3. Once claimed, you'll have access to:
   - Test API keys (already configured in your project)
   - Stripe Dashboard for monitoring payments
   - Test card numbers for simulating transactions

## Step 2: Test Payment Flow

Once your sandbox is claimed, you can test the payment system:

### Test Card Numbers

Use these test cards in your checkout flow:

| Card Number | Description | Expected Result |
|------------|-------------|-----------------|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0025 0000 3155` | Visa (requires authentication) | Success with 3D Secure |
| `4000 0000 0000 9995` | Visa | Declined (insufficient funds) |
| `4000 0000 0000 0002` | Visa | Declined (generic decline) |

**CVV:** Any 3 digits (e.g., `123`)  
**Expiry:** Any future date (e.g., `12/34`)  
**ZIP:** Any 5 digits (e.g., `12345`)

### Testing the Checkout

1. Navigate to the Marketplace page
2. Click "Buy Now" on any stamp
3. You'll be redirected to Stripe Checkout
4. Use one of the test card numbers above
5. Complete the payment
6. You'll be redirected back to your Dashboard

## Step 3: Monitor Webhooks

### Webhook Endpoint

Your webhook is configured at: `/api/stripe/webhook`

### Supported Events

The system currently handles these Stripe events:

- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Payment processing complete
- `payment_intent.payment_failed` - Payment failed

### Testing Webhooks Locally

To test webhooks in development:

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or download from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Step 4: View Payments in Dashboard

After claiming your sandbox, visit the [Stripe Dashboard](https://dashboard.stripe.com) to:

- View all test payments
- Monitor webhook delivery
- Check payment logs
- Test refunds and disputes

## Environment Variables

The following Stripe environment variables are automatically configured:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (server-side)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (client-side)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret for security

## Product Pricing

Current stamp products configured in the system:

| Product | Price | Rarity |
|---------|-------|--------|
| Common Digital Stamp | $9.99 | Common |
| Uncommon Digital Stamp | $29.99 | Uncommon |
| Rare Digital Stamp | $99.99 | Rare |
| Very Rare Digital Stamp | $299.99 | Very Rare |
| Legendary Digital Stamp | $999.99 | Legendary |

## Security Notes

- ✅ Webhook signature verification is enabled
- ✅ Raw body parsing configured for webhooks
- ✅ Test mode keys are being used (no real charges)
- ✅ HTTPS required for production webhooks

## Troubleshooting

### Payment Not Completing

1. Check browser console for errors
2. Verify Stripe keys are configured
3. Check webhook logs in Stripe Dashboard
4. Ensure webhook endpoint is accessible

### Webhook Not Receiving Events

1. Verify webhook URL is correct
2. Check Stripe Dashboard webhook logs
3. Ensure webhook secret matches
4. Test with Stripe CLI locally

## Going to Production

When ready to accept real payments:

1. Complete Stripe account verification
2. Switch from test keys to live keys
3. Update webhook endpoints to production URL
4. Enable additional payment methods if needed
5. Configure tax settings
6. Set up payout schedule

## Support

For Stripe-specific issues, visit:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For StampCoin platform issues, contact the development team.
