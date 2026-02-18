import { Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import prisma from '../config/database';
import Stripe from 'stripe';
import { getMonthlyLimit } from '../config/subscription.config';

export class WebhookController {
  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(req: Request, res: Response): Promise<Response> {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      // Construct the event from the raw body
      const event = stripeService.constructWebhookEvent(
        req.body,
        signature as string
      );

      console.log(`Webhook received: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle successful checkout session
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!userId) {
      console.error('No userId found in checkout session');
      return;
    }

    console.log(`Checkout completed for user ${userId}`);

    // Calculate subscription dates
    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'PREMIUM',
        subscriptionStart: now,
        subscriptionEnd: subscriptionEnd,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    // Update usage tracking for current month
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const premiumLimit = getMonthlyLimit('PREMIUM');
    await prisma.usageTracking.upsert({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        monthlyLimit: premiumLimit,
      },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        captionsGenerated: 0,
        monthlyLimit: premiumLimit,
      },
    });

    console.log(`User ${userId} upgraded to PREMIUM`);
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    console.log(`Subscription updated for user ${userId}`);

    // Log subscription update for monitoring
    // The subscription dates are managed during checkout completion
    // This handler can be extended for additional subscription update logic
  }

  /**
   * Handle subscription cancellation/deletion
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    console.log(`Subscription deleted for user ${userId}`);

    // Downgrade to FREE
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStart: null,
        subscriptionEnd: null,
        stripeSubscriptionId: null,
      },
    });

    // Update usage limit
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await prisma.usageTracking.upsert({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        monthlyLimit: getMonthlyLimit('FREE'),
      },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        captionsGenerated: 0,
        monthlyLimit: getMonthlyLimit('FREE'),
      },
    });

    console.log(`User ${userId} downgraded to FREE`);
  }

  /**
   * Handle successful payment (monthly renewal)
   * Extends subscriptionEnd by 1 month so user stays PREMIUM
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Payment succeeded for invoice ${invoice.id}`);

    // Only handle subscription renewals (not the first payment - that's handled by checkout.session.completed)
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId || invoice.billing_reason === 'subscription_create') {
      return;
    }

    // Find the user by stripeSubscriptionId
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!user) {
      console.error(`No user found for subscription ${subscriptionId}`);
      return;
    }

    // Extend subscription by 1 month from current end date (or now if expired)
    const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
    const newEnd = new Date(currentEnd);
    newEnd.setMonth(newEnd.getMonth() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'PREMIUM',
        subscriptionEnd: newEnd,
      },
    });

    // Reset monthly caption count for the new billing period
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await prisma.usageTracking.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        monthlyLimit: getMonthlyLimit('PREMIUM'),
      },
      create: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        captionsGenerated: 0,
        monthlyLimit: getMonthlyLimit('PREMIUM'),
      },
    });

    console.log(`Subscription renewed for user ${user.id} until ${newEnd.toISOString()}`);
  }

  /**
   * Handle failed payment - downgrade user after failed renewal
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`Payment failed for invoice ${invoice.id}`);

    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!user) return;

    // Log for monitoring - Stripe will retry automatically
    // After all retries fail, customer.subscription.deleted will fire and downgrade the user
    console.log(`Payment failed for user ${user.id} - Stripe will retry automatically`);
  }
}
