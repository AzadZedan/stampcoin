import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createTransaction, getTransactionByHash, updateTransaction, updateStamp } from './db';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return _stripe;
}

// Error types
enum WebhookErrorType {
  MISSING_SIGNATURE = 'MISSING_SIGNATURE',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface WebhookError {
  type: WebhookErrorType;
  message: string;
  statusCode: number;
}

// Error handler
function handleWebhookError(error: any): WebhookError {
  if (error.message?.includes('No signature')) {
    return {
      type: WebhookErrorType.MISSING_SIGNATURE,
      message: 'Missing Stripe signature header',
      statusCode: 400,
    };
  }

  if (error.message?.includes('Signature verification')) {
    return {
      type: WebhookErrorType.INVALID_SIGNATURE,
      message: 'Invalid webhook signature',
      statusCode: 401,
    };
  }

  if (error instanceof Error) {
    return {
      type: WebhookErrorType.PROCESSING_ERROR,
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    type: WebhookErrorType.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

// Event handlers
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.user_id;
    const stampId = session.metadata?.stamp_id;
    const paymentMethod = session.metadata?.payment_method || 'card';

    if (!userId || !stampId) {
      throw new Error('Missing required metadata (user_id or stamp_id)');
    }

    const buyerId = parseInt(userId, 10);
    const stampIdNum = parseInt(stampId, 10);

    console.log('[Webhook] Processing checkout completion:', {
      sessionId: session.id,
      userId,
      stampId,
      paymentMethod,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
    });

    // Use payment intent ID as the canonical transaction hash so refunds can be matched
    let transactionHash: string;
    if (typeof session.payment_intent === 'string') {
      transactionHash = session.payment_intent;
    } else {
      // payment_intent should always be present on completed payment-mode sessions.
      // Fall back to the session ID but warn so operators can investigate.
      console.warn('[Webhook] payment_intent not available on completed session; refund matching may fail:', session.id);
      transactionHash = session.id;
    }

    const priceInDollars = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : '0.00';

    // 1. Create transaction record in database
    await createTransaction({
      stampId: stampIdNum,
      buyerId,
      price: priceInDollars,
      status: 'completed',
      transactionHash,
      completedAt: new Date(),
    });

    // 2. Mark stamp as sold and transfer ownership to buyer
    await updateStamp(stampIdNum, {
      isAvailable: false,
      ownerId: buyerId,
    });

    console.log('[Webhook] Transaction recorded and stamp ownership transferred:', {
      transactionHash,
      stampId: stampIdNum,
      buyerId,
    });

    return {
      success: true,
      message: 'Checkout session processed successfully',
    };
  } catch (error: any) {
    console.error('[Webhook] Error processing checkout completion:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('[Webhook] Processing payment success:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    });

    // The checkout.session.completed event handles transaction recording.
    // This event confirms the payment intent itself succeeded.

    return {
      success: true,
      message: 'Payment processed successfully',
    };
  } catch (error: any) {
    console.error('[Webhook] Error processing payment success:', error);
    throw error;
  }
}

async function handlePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('[Webhook] Processing payment failure:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      lastPaymentError: paymentIntent.last_payment_error,
    });

    // Cancel any pending transaction that matches this payment intent
    const existingTransaction = await getTransactionByHash(paymentIntent.id);
    if (existingTransaction && existingTransaction.status === 'pending') {
      await updateTransaction(existingTransaction.id, { status: 'cancelled' });
      console.log('[Webhook] Pending transaction cancelled:', existingTransaction.id);
    }

    return {
      success: true,
      message: 'Payment failure processed',
    };
  } catch (error: any) {
    console.error('[Webhook] Error processing payment failure:', error);
    throw error;
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log('[Webhook] Processing refund:', {
      chargeId: charge.id,
      amount: charge.amount,
      amountRefunded: charge.amount_refunded,
      refunded: charge.refunded,
    });

    // Look up the transaction using the payment intent ID stored as transactionHash
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

    if (paymentIntentId) {
      const existingTransaction = await getTransactionByHash(paymentIntentId);
      if (existingTransaction) {
        // 1. Update transaction status to cancelled (refunded)
        await updateTransaction(existingTransaction.id, {
          status: 'cancelled',
          completedAt: new Date(),
        });

        // 2. Restore stamp availability so it can be purchased again
        await updateStamp(existingTransaction.stampId, {
          isAvailable: true,
          ownerId: null,
        });

        console.log('[Webhook] Refund processed — transaction cancelled and stamp restored:', {
          transactionId: existingTransaction.id,
          stampId: existingTransaction.stampId,
        });
      } else {
        console.warn('[Webhook] No transaction found for payment intent:', paymentIntentId);
      }
    }

    return {
      success: true,
      message: 'Refund processed',
    };
  } catch (error: any) {
    console.error('[Webhook] Error processing refund:', error);
    throw error;
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('[Webhook] Processing dispute:', {
      disputeId: dispute.id,
      chargeId: dispute.charge,
      amount: dispute.amount,
      reason: dispute.reason,
      status: dispute.status,
    });

    // Log the dispute for admin review. Dispute resolution requires manual
    // intervention; flag the transaction if a matching one can be found.
    const chargeId =
      typeof dispute.charge === 'string' ? dispute.charge : null;

    console.warn('[Webhook] Dispute requires admin review:', {
      disputeId: dispute.id,
      chargeId,
      reason: dispute.reason,
      amount: dispute.amount,
      currency: dispute.currency,
    });

    return {
      success: true,
      message: 'Dispute logged',
    };
  } catch (error: any) {
    console.error('[Webhook] Error processing dispute:', error);
    throw error;
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  // Validate signature presence
  if (!sig) {
    console.error('[Webhook] No signature found');
    return res.status(400).json({
      error: 'Missing Stripe signature',
      type: WebhookErrorType.MISSING_SIGNATURE,
    });
  }

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    const error = handleWebhookError(err);
    console.error('[Webhook] Signature verification failed:', error.message);
    return res.status(error.statusCode).json({
      error: error.message,
      type: error.type,
    });
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected:', event.type);
    return res.json({
      verified: true,
      message: 'Test event received',
    });
  }

  console.log('[Webhook] Event received:', {
    eventId: event.id,
    eventType: event.type,
    timestamp: new Date(event.created * 1000).toISOString(),
  });

  try {
    let result: any;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        result = await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        result = await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        result = await handlePaymentIntentPaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        result = await handleChargeRefunded(charge);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        result = await handleChargeDisputeCreated(dispute);
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
        result = {
          success: true,
          message: `Event type ${event.type} received but not processed`,
        };
    }

    console.log('[Webhook] Event processed successfully:', {
      eventId: event.id,
      eventType: event.type,
      result,
    });

    res.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      result,
    });
  } catch (error: any) {
    const webhookError = handleWebhookError(error);
    console.error('[Webhook] Error processing event:', {
      eventId: event.id,
      eventType: event.type,
      error: webhookError,
    });

    res.status(webhookError.statusCode).json({
      error: webhookError.message,
      type: webhookError.type,
      eventId: event.id,
    });
  }
}
