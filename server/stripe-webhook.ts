import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

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

    console.log('[Webhook] Processing checkout completion:', {
      sessionId: session.id,
      userId,
      stampId,
      paymentMethod,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
    });

    // TODO: Implement transaction recording
    // 1. Create transaction record in database
    // 2. Grant access to purchased stamp
    // 3. Send confirmation email
    // 4. Update user purchase history

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

    // TODO: Implement payment success handling
    // 1. Update transaction status
    // 2. Send success notification
    // 3. Log payment details

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

    // TODO: Implement payment failure handling
    // 1. Update transaction status to failed
    // 2. Send failure notification to user
    // 3. Log failure details for debugging
    // 4. Trigger retry mechanism if applicable

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

    // TODO: Implement refund handling
    // 1. Update transaction status to refunded
    // 2. Revoke access to purchased stamp
    // 3. Send refund confirmation email
    // 4. Log refund details

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

    // TODO: Implement dispute handling
    // 1. Log dispute details
    // 2. Notify admin
    // 3. Flag transaction for review
    // 4. Prepare response documentation

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
    event = stripe.webhooks.constructEvent(
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
