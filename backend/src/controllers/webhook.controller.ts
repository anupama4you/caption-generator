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
      const event = stripeService.constructWebhookEvent(
        req.body,
        signature as string
      );

      console.log(`Webhook received: ${event.type}`);

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

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
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
   * Supports both trial and immediate-payment checkouts
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

    // Retrieve subscription to check if it's a trial
    const subscription = await stripeService.getSubscription(subscriptionId);
    const isTrialing = subscription.status === 'trialing';

    const now = new Date();
    const trialEndsAt = isTrialing && subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    const tier = isTrialing ? 'TRIAL' : 'PREMIUM';
    const periodEnd = subscription.items.data[0]?.current_period_end;
    const subscriptionEnd = isTrialing
      ? trialEndsAt
      : periodEnd ? new Date(periodEnd * 1000) : new Date();

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStart: now,
        subscriptionEnd,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        trialEndsAt,
        trialActivated: true,
      },
    });

    // Update usage tracking to Premium limits
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
      update: { monthlyLimit: premiumLimit },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        captionsGenerated: 0,
        monthlyLimit: premiumLimit,
      },
    });

    console.log(`User ${userId} ${isTrialing ? 'started TRIAL' : 'upgraded to PREMIUM'}`);
  }

  /**
   * Handle subscription updates
   * Key: detects trial → active (paid) transition
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);

    if (subscription.status === 'active') {
      // Trial ended and payment succeeded → upgrade to PREMIUM
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.subscriptionTier === 'TRIAL') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'PREMIUM',
            subscriptionEnd: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000)
              : new Date(),
            trialEndsAt: null,
          },
        });
        console.log(`User ${userId} trial converted to PREMIUM`);
      }
    } else if (subscription.status === 'past_due') {
      // Payment failed after trial - Stripe will retry automatically
      console.log(`Payment past due for user ${userId} - Stripe will retry`);
    }
  }

  /**
   * Handle subscription cancellation/deletion
   * Covers: trial cancel, paid cancel, payment failure exhaustion
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
        trialEndsAt: null,
      },
    });

    // Update usage limit
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const freeLimit = getMonthlyLimit('FREE');

    await prisma.usageTracking.upsert({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: { monthlyLimit: freeLimit },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        captionsGenerated: 0,
        monthlyLimit: freeLimit,
      },
    });

    console.log(`User ${userId} downgraded to FREE`);
  }

  /**
   * Handle trial ending soon (fires 3 days before trial ends)
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    console.log(`Trial ending soon for user ${userId}`);
    // Future: send reminder email via email.service.ts
  }

  /**
   * Handle successful payment (monthly renewal)
   * Extends subscriptionEnd by 1 month so user stays PREMIUM
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Payment succeeded for invoice ${invoice.id}`);

    // Only handle subscription renewals (not the first payment - that's handled by checkout.session.completed)
    const sub = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof sub === 'string' ? sub : sub?.id;
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

    const sub = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof sub === 'string' ? sub : sub?.id;
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
