# Stripe Sandbox Testing Guide for StampCoin

**Last Updated:** December 21, 2025  
**Status:** ✅ Ready for Testing

---

## Overview

This guide provides comprehensive instructions for testing the StampCoin payment system using Stripe's test sandbox environment. All payment processing is simulated with no real charges.

---

## Quick Start

### 1. Environment Setup

Your Stripe test environment is already configured with the following:

```bash
STRIPE_SECRET_KEY=sk_test_[your-key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]
```

These are automatically loaded from your environment variables.

### 2. Test Card Numbers

Use these card numbers to test different payment scenarios:

#### Successful Payment
```
Card Number: 4242 4242 4242 4242
Type: Visa
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/34)
ZIP: Any 5 digits (e.g., 12345)
Expected Result: ✅ Payment succeeds
```

#### Payment Requiring Authentication (3D Secure)
```
Card Number: 4000 0025 0000 3155
Type: Visa
CVV: Any 3 digits
Expiry: Any future date
ZIP: Any 5 digits
Expected Result: ✅ Payment succeeds after 3D Secure verification
```

#### Declined Payment (Insufficient Funds)
```
Card Number: 4000 0000 0000 9995
Type: Visa
CVV: Any 3 digits
Expiry: Any future date
ZIP: Any 5 digits
Expected Result: ❌ Payment declined
```

#### Declined Payment (Generic)
```
Card Number: 4000 0000 0000 0002
Type: Visa
CVV: Any 3 digits
Expiry: Any future date
ZIP: Any 5 digits
Expected Result: ❌ Payment declined
```

---

## Testing the Payment Flow

### Step 1: Start the Application

```bash
cd /home/ubuntu/stampcoin-platform
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 2: Navigate to Marketplace

1. Open your browser and go to `http://localhost:3000`
2. Click on "Marketplace" in the navigation menu
3. Browse the available stamps

### Step 3: Initiate Purchase

1. Click "Buy Now" on any stamp
2. You'll be redirected to Stripe Checkout
3. Enter your test card information:
   - **Email:** Any email address
   - **Card Number:** Use one of the test cards above
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **Name:** Any name
   - **Country:** Any country
   - **ZIP:** Any 5 digits

### Step 4: Complete Payment

1. Click "Pay" button
2. For 3D Secure cards, complete the authentication
3. Wait for confirmation
4. You'll be redirected to your Dashboard

### Step 5: Verify Transaction

1. Check your Dashboard for the purchase in "Purchase History"
2. Log in to [Stripe Dashboard](https://dashboard.stripe.com) to verify the test payment
3. Look for the payment in the "Payments" section

---

## Webhook Testing

### Local Development

To test webhooks locally, use Stripe CLI:

#### 1. Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
curl https://files.stripe.com/stripe-cli/install.sh -O
bash install.sh
```

**Windows:**
Download from [Stripe CLI Download](https://stripe.com/docs/stripe-cli)

#### 2. Login to Stripe CLI

```bash
stripe login
```

This will open a browser window to authenticate. Follow the prompts.

#### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output your webhook signing secret. Keep this terminal open.

#### 4. Trigger Test Events

In another terminal:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test payment succeeded
stripe trigger payment_intent.succeeded

# Test payment failed
stripe trigger payment_intent.payment_failed
```

### Webhook Events Handled

The StampCoin platform handles these Stripe events:

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `/api/stripe/webhook` | Process successful payment |
| `payment_intent.succeeded` | `/api/stripe/webhook` | Update transaction status |
| `payment_intent.payment_failed` | `/api/stripe/webhook` | Handle failed payment |

### Webhook Verification

All webhooks are verified using the webhook signing secret:

```typescript
// Verification is automatic in the webhook handler
// Signature is verified before processing the event
```

---

## Monitoring Payments

### Stripe Dashboard

1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Payments** section
3. View all test payments
4. Click on a payment to see details:
   - Payment status
   - Amount
   - Customer information
   - Metadata
   - Timeline

### Webhook Logs

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View event logs:
   - Event type
   - Timestamp
   - Status (succeeded/failed)
   - Response details

### Application Logs

Check your application logs for:
- Webhook receipt
- Event processing
- Database updates
- Error messages

---

## Testing Different Scenarios

### Scenario 1: Successful Purchase

1. Use card: `4242 4242 4242 4242`
2. Complete checkout
3. Verify in Dashboard
4. Check purchase history

**Expected Result:** ✅ Payment succeeds, transaction recorded

### Scenario 2: 3D Secure Authentication

1. Use card: `4000 0025 0000 3155`
2. Complete checkout
3. Complete 3D Secure verification
4. Verify in Dashboard

**Expected Result:** ✅ Payment succeeds after authentication

### Scenario 3: Declined Payment

1. Use card: `4000 0000 0000 9995`
2. Attempt checkout
3. Payment will be declined
4. Check error message

**Expected Result:** ❌ Payment declined, error displayed

### Scenario 4: Multiple Purchases

1. Make several purchases with different cards
2. Verify all in Dashboard
3. Check purchase history shows all transactions

**Expected Result:** ✅ All purchases recorded correctly

### Scenario 5: Webhook Processing

1. Use Stripe CLI to forward webhooks
2. Make a test payment
3. Verify webhook is received
4. Check webhook logs in Stripe Dashboard

**Expected Result:** ✅ Webhook received and processed

---

## Troubleshooting

### Payment Not Processing

**Problem:** Checkout page shows error  
**Solution:**
1. Verify Stripe keys are correct
2. Check browser console for errors
3. Verify webhook endpoint is accessible
4. Check Stripe Dashboard for error details

### Webhook Not Received

**Problem:** Webhook events not triggering  
**Solution:**
1. Verify webhook URL is correct
2. Check Stripe CLI is running
3. Verify webhook signing secret matches
4. Check firewall/network settings

### Card Declined

**Problem:** Test card being declined  
**Solution:**
1. Use correct test card number
2. Verify expiry date is in future
3. Try different test card
4. Check Stripe Dashboard for decline reason

### Session Not Created

**Problem:** Checkout session creation fails  
**Solution:**
1. Verify API keys are correct
2. Check database connection
3. Verify user is authenticated
4. Check server logs for errors

---

## Best Practices

### Testing Checklist

- [ ] Test successful payment with basic card
- [ ] Test 3D Secure payment
- [ ] Test declined payment
- [ ] Test webhook delivery
- [ ] Test error handling
- [ ] Test multiple purchases
- [ ] Test dashboard updates
- [ ] Test transaction history
- [ ] Verify Stripe Dashboard logs
- [ ] Check email notifications (if enabled)

### Security Testing

- [ ] Verify HTTPS is enforced
- [ ] Test webhook signature verification
- [ ] Verify API keys are not exposed
- [ ] Test authentication requirements
- [ ] Verify user data is encrypted
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Verify CSRF protection

### Performance Testing

- [ ] Measure checkout load time
- [ ] Measure webhook processing time
- [ ] Test concurrent payments
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Verify no memory leaks

---

## Production Deployment

### Before Going Live

1. **Complete Stripe Account Verification**
   - Provide business information
   - Complete identity verification
   - Add bank account details

2. **Switch to Live Keys**
   - Update environment variables with live keys
   - Verify keys are correct
   - Test with live cards (small amount)

3. **Update Webhook Endpoints**
   - Configure production webhook URL
   - Update signing secret
   - Test webhook delivery

4. **Security Review**
   - Enable HTTPS
   - Configure SSL certificate
   - Set up firewall rules
   - Enable rate limiting

5. **Monitoring Setup**
   - Configure error tracking
   - Set up payment monitoring
   - Configure alerts
   - Enable logging

### Production Checklist

- [ ] Live Stripe account verified
- [ ] Live API keys configured
- [ ] HTTPS enabled
- [ ] Webhook endpoint configured
- [ ] Database backups configured
- [ ] Error tracking enabled
- [ ] Monitoring alerts set up
- [ ] Support email configured
- [ ] Terms of service updated
- [ ] Privacy policy updated

---

## Additional Resources

### Stripe Documentation
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### StampCoin Documentation
- [Project Completion Report](./PROJECT_COMPLETION_REPORT.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./drizzle/schema.ts)

### Support
- **Stripe Support:** [support.stripe.com](https://support.stripe.com)
- **Stripe Status:** [status.stripe.com](https://status.stripe.com)
- **StampCoin Support:** support@stampcoin.io

---

## Summary

The StampCoin payment system is fully configured and ready for testing. Use this guide to:

1. ✅ Test the payment flow with test cards
2. ✅ Verify webhook delivery
3. ✅ Monitor transactions in Stripe Dashboard
4. ✅ Troubleshoot any issues
5. ✅ Prepare for production deployment

For questions or issues, refer to the troubleshooting section or contact support.

---

**Last Updated:** December 21, 2025  
**Status:** ✅ Ready for Testing  
**Version:** 1.0.0
