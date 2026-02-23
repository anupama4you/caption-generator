import Stripe from 'stripe';
import { config } from '../config/env';
import { TRIAL_DURATION_DAYS } from '../config/subscription.config';

if (!config.stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(config.stripeSecretKey, {
  // Use a stable, current API version
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export class StripeService {
  /**
   * Create a checkout session for Premium subscription
   */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string,
    billingInterval: 'monthly' | 'yearly' = 'monthly',
    includeTrial: boolean = false
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Select the correct price ID based on billing interval
      const priceId = billingInterval === 'yearly'
        ? config.stripePriceIdYearly
        : config.stripePriceIdMonthly;

      if (!priceId) {
        throw new Error(`No price ID configured for ${billingInterval} billing`);
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
          userId,
          billingInterval,
        },
        subscription_data: {
          metadata: {
            userId,
            billingInterval,
          },
          ...(includeTrial ? { trial_period_days: TRIAL_DURATION_DAYS } : {}),
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Cancel a subscription at the end of the billing period (for paid subscribers)
   */
  async cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } catch (error) {
      console.error('Error scheduling subscription cancellation:', error);
      throw new Error('Failed to schedule subscription cancellation');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripeWebhookSecret
      );
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Retrieve a checkout session (used for post-payment verification)
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
  }

  /**
   * Get Premium price details from Stripe (both monthly and yearly)
   */
  async getPremiumPricing(): Promise<{
    monthly: { amount: number; currency: string; interval: string; productName: string };
    yearly: { amount: number; currency: string; interval: string; productName: string };
  }> {
    try {
      // Fetch both monthly and yearly prices
      const [monthlyPrice, yearlyPrice] = await Promise.all([
        stripe.prices.retrieve(config.stripePriceIdMonthly, { expand: ['product'] }),
        config.stripePriceIdYearly
          ? stripe.prices.retrieve(config.stripePriceIdYearly, { expand: ['product'] })
          : null,
      ]);

      const monthlyProduct = monthlyPrice.product as Stripe.Product;
      const yearlyProduct = yearlyPrice?.product as Stripe.Product | undefined;

      return {
        monthly: {
          amount: (monthlyPrice.unit_amount || 0) / 100,
          currency: monthlyPrice.currency.toUpperCase(),
          interval: 'month',
          productName: monthlyProduct.name || 'Premium Monthly',
        },
        yearly: yearlyPrice
          ? {
              amount: (yearlyPrice.unit_amount || 0) / 100,
              currency: yearlyPrice.currency.toUpperCase(),
              interval: 'year',
              productName: yearlyProduct?.name || 'Premium Yearly',
            }
          : {
              amount: ((monthlyPrice.unit_amount || 0) / 100) * 10, // Default: 10 months for 12
              currency: monthlyPrice.currency.toUpperCase(),
              interval: 'year',
              productName: 'Premium Yearly',
            },
      };
    } catch (error) {
      console.error('Error retrieving prices:', error);
      return {
        monthly: { amount: 4.99, currency: 'AUD', interval: 'month', productName: 'Premium Monthly' },
        yearly: { amount: 49.99, currency: 'AUD', interval: 'year', productName: 'Premium Yearly' },
      };
    }
  }

  /**
   * Get Premium price details from Stripe (legacy method for backwards compatibility)
   */
  async getPremiumPrice(): Promise<{
    amount: number;
    currency: string;
    interval: string;
    productName: string;
  }> {
    const pricing = await this.getPremiumPricing();
    return pricing.monthly;
  }
}

export const stripeService = new StripeService();
