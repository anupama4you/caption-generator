import Stripe from 'stripe';
import { config } from '../config/env';

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
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: config.stripePriceId,
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
        },
        subscription_data: {
          metadata: {
            userId,
          },
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
   * Get Premium price details from Stripe
   */
  async getPremiumPrice(): Promise<{
    amount: number;
    currency: string;
    interval: string;
    productName: string;
  }> {
    try {
      // Retrieve the price object
      const price = await stripe.prices.retrieve(config.stripePriceId, {
        expand: ['product'],
      });

      // Extract product details
      const product = price.product as Stripe.Product;

      return {
        amount: (price.unit_amount || 0) / 100, // Convert cents to dollars
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval || 'month',
        productName: product.name || 'Premium',
      };
    } catch (error) {
      console.error('Error retrieving price:', error);
      // Return default values if Stripe call fails
      return {
        amount: 9.99,
        currency: 'USD',
        interval: 'month',
        productName: 'Premium',
      };
    }
  }
}

export const stripeService = new StripeService();
