/**
 * Centralized subscription configuration
 * All subscription-related constants should be defined here
 */

export const TRIAL_DURATION_DAYS = 7;

export const SUBSCRIPTION_CONFIG = {
  FREE: {
    monthlyLimit: 5,
    maxPlatforms: 2,
    features: [
      '5 caption generations per month',
      'Up to 2 platforms per generation',
      '3 variants per platform',
      'Basic analytics',
      'All content types supported',
      'Profile customization',
    ],
  },
  TRIAL: {
    monthlyLimit: 100,
    maxPlatforms: -1, // Same as PREMIUM
    features: [
      '7-day free trial with full Premium features',
      '100 caption generations per month',
      'Unlimited platforms per generation',
      '3 caption variants per platform',
      'Advanced analytics',
      'Priority support',
    ],
  },
  PREMIUM: {
    monthlyLimit: 100,
    maxPlatforms: -1, // -1 means unlimited
    features: [
      '100 caption generations per month',
      'Unlimited platforms per generation',
      '3 caption variants per platform',
      'Advanced analytics',
      'Priority support',
      'Early access to new features',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_CONFIG;

/**
 * Get monthly limit for a given subscription tier
 */
export const getMonthlyLimit = (tier: SubscriptionTier): number => {
  return SUBSCRIPTION_CONFIG[tier].monthlyLimit;
};

/**
 * Get max platforms for a given subscription tier
 */
export const getMaxPlatforms = (tier: SubscriptionTier): number => {
  return SUBSCRIPTION_CONFIG[tier].maxPlatforms;
};

/**
 * Check if a tier has unlimited platforms
 */
export const hasUnlimitedPlatforms = (tier: SubscriptionTier): boolean => {
  return SUBSCRIPTION_CONFIG[tier].maxPlatforms === -1;
};
