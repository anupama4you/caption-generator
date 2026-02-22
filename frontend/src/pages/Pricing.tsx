import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Check, Zap, Crown, Loader2
} from 'lucide-react';
import { RootState } from '../store/store';
import { setUser } from '../store/authSlice';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface PlanPricing {
  amount: number;
  currency: string;
  interval: string;
  name: string;
}

interface PricingData {
  monthly: PlanPricing;
  yearly: PlanPricing;
  free: PlanPricing;
}

const DEFAULT_PRICING: PricingData = {
  monthly: { amount: 4.99, currency: 'AUD', interval: 'month', name: 'Premium Monthly' },
  yearly: { amount: 49.99, currency: 'AUD', interval: 'year', name: 'Premium Yearly' },
  free: { amount: 0, currency: 'AUD', interval: 'forever', name: 'Free' },
};

interface PlanType {
  name: string;
  tier: 'FREE' | 'PREMIUM';
  price: number;
  period: string;
  currency?: string;
  description: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  highlighted: boolean;
}

const DEFAULT_PLANS: PlanType[] = [
  {
    name: 'Free',
    tier: 'FREE',
    price: 0,
    period: 'forever',
    currency: DEFAULT_PRICING.free.currency,
    description: 'Perfect for trying out our caption generator',
    features: [
      '5 caption generations per month',
      'Up to 2 platforms per generation',
      '3 caption variants per platform',
      'Basic analytics',
      'All content types supported',
      'Profile customization',
    ],
    limitations: [
      'Limited to 5 generations/month',
      'Maximum 2 platforms',
    ],
    buttonText: 'Current Plan',
    highlighted: false,
  },
  {
    name: DEFAULT_PRICING.monthly.name,
    tier: 'PREMIUM',
    price: DEFAULT_PRICING.monthly.amount,
    period: DEFAULT_PRICING.monthly.interval,
    currency: DEFAULT_PRICING.monthly.currency,
    description: 'For serious content creators and businesses',
    features: [
      '100 caption generations per month',
      'Unlimited platforms per generation',
      '3 caption variants per platform',
      'Advanced analytics & insights',
      'All content types supported',
      'Profile customization',
      'Priority support',
      'Early access to new features',
    ],
    limitations: [],
    buttonText: 'Upgrade to Premium',
    highlighted: true,
  },
];

export default function Pricing() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [plans, setPlans] = useState<PlanType[]>(DEFAULT_PLANS);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyPrice, setMonthlyPrice] = useState(DEFAULT_PRICING.monthly.amount);
  const [yearlyPrice, setYearlyPrice] = useState(DEFAULT_PRICING.yearly.amount);
  const [currency, setCurrency] = useState(DEFAULT_PRICING.monthly.currency);
  const formatCurrency = (curr: string) => (curr === 'USD' ? '$' : `${curr} `);
  const formatAmount = (amount: number) => (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  const savingsPercent = monthlyPrice
    ? Math.max(0, Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100))
    : 0;

  const currentTier = user?.subscriptionTier || 'FREE';

  // Fetch pricing from Stripe
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setPricingLoading(true);
        const response = await api.get('/payment/pricing');

        if (response?.data?.success && response?.data?.pricing) {
          const { monthly, yearly, free } = response.data.pricing as PricingData;

          // Store monthly and yearly prices
          setMonthlyPrice(monthly?.amount ?? DEFAULT_PRICING.monthly.amount);
          setYearlyPrice(yearly?.amount ?? DEFAULT_PRICING.yearly.amount);
          setCurrency(monthly?.currency ?? DEFAULT_PRICING.monthly.currency);

          // Update plans with actual Stripe pricing (monthly by default)
          setPlans([
            {
              ...DEFAULT_PLANS[0],
              price: free?.amount ?? DEFAULT_PRICING.free.amount,
              currency: free?.currency ?? DEFAULT_PRICING.free.currency,
            },
            {
              ...DEFAULT_PLANS[1],
              price: monthly?.amount ?? DEFAULT_PRICING.monthly.amount,
              period: monthly?.interval ?? DEFAULT_PRICING.monthly.interval,
              currency: monthly?.currency ?? DEFAULT_PRICING.monthly.currency,
              name: monthly?.name ?? DEFAULT_PRICING.monthly.name,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
        // Keep default plans if fetch fails
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Check for success/canceled query params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Verify the checkout session and upgrade the user
      verifyCheckout(sessionId);
    } else if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const verifyCheckout = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await api.post('/payment/verify-checkout-session', { sessionId });

      if (response.data.success) {
        setSuccessMessage('Payment successful! Your Premium subscription is now active.');

        // Fetch updated user data
        const userResponse = await api.get('/auth/me');
        dispatch(setUser(userResponse.data));

        // Clear the session_id from URL after 2 seconds
        setTimeout(() => {
          window.history.replaceState({}, '', '/pricing');
        }, 2000);
      } else {
        setError('Failed to verify payment. Please contact support.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify payment. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    if (tier === currentTier) return;

    setLoading(true);
    setError('');

    try {
      // Create Stripe checkout session with billing interval
      const response = await api.post('/payment/create-checkout-session', {
        billingInterval,
      });
      const { url } = response.data;

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        setError('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.error || 'Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await api.post('/subscription/cancel');
      alert('Subscription cancelled successfully! You have been downgraded to the Free plan.');
      setShowCancelConfirm(false);

      // Refresh the page to update the user state
      window.location.reload();
    } catch (err: any) {
      console.error('Cancel error:', err);
      alert(err.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Page Title */}
        <div className="text-center mb-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-600"
          >
            Start free, upgrade when you need more
          </motion.p>
        </div>

        {/* Current Tier Badge */}
        {currentTier && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              {currentTier === 'PREMIUM' ? (
                <>
                  <Crown className="w-4 h-4" />
                  You're on Premium
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  You're on Free Plan
                </>
              )}
            </span>
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-600 text-sm font-medium">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Billing Interval Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2.5 rounded-md transition-all font-semibold text-sm ${
                billingInterval === 'monthly'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2.5 rounded-md transition-all font-semibold text-sm relative ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                Save {savingsPercent}%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        {pricingLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
            const isCurrentPlan = plan.tier === currentTier;
            const canUpgrade = plan.tier === 'PREMIUM' && currentTier === 'FREE';

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                  plan.highlighted
                    ? 'border-indigo-500'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-100'
                }`}
              >
                {/* Highlight Badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1.5">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.tier === 'PREMIUM' ? (
                          <>
                            {formatCurrency(currency)}
                            {formatAmount(billingInterval === 'yearly' ? yearlyPrice : monthlyPrice)}
                          </>
                        ) : (
                          <>
                            {formatCurrency(plan.currency || currency)}
                            {formatAmount(plan.price)}
                          </>
                        )}
                      </span>
                      <span className="text-gray-600 text-sm">
                        / {plan.tier === 'PREMIUM' ? (billingInterval === 'yearly' ? 'year' : 'month') : plan.period}
                      </span>
                    </div>
                    {plan.tier === 'PREMIUM' && billingInterval === 'yearly' && (
                      <p className="text-green-600 text-sm mt-2 font-medium">
                        {formatCurrency(currency)}{formatAmount(yearlyPrice / 12)}/month when billed annually
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mb-5 space-y-2.5">
                    <p className="text-sm font-semibold text-gray-900 mb-2">What's included:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div>
                    <motion.button
                      onClick={() => canUpgrade && handleUpgrade(plan.tier)}
                      disabled={isCurrentPlan || loading || !canUpgrade}
                      whileHover={canUpgrade && !loading ? { scale: 1.02 } : {}}
                      whileTap={canUpgrade && !loading ? { scale: 0.98 } : {}}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : canUpgrade
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loading && canUpgrade ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : canUpgrade ? (
                        <>
                          <Crown className="w-5 h-5" />
                          {plan.buttonText}
                        </>
                      ) : (
                        plan.buttonText
                      )}
                    </motion.button>

                    {/* Cancel Link - Show only for current Premium plan */}
                    {isCurrentPlan && plan.tier === 'PREMIUM' && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="block w-full text-center mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Cancel Plan
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">
                Can I cancel my subscription?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your Premium subscription anytime from your Profile page. When you cancel, you'll be downgraded to the Free plan with 5 generations per month.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">
                Can I switch between plans?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade from Free to Premium at any time. Your upgrade takes effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">
                What happens to my usage when I upgrade?
              </h4>
              <p className="text-gray-600 text-sm">
                When you upgrade to Premium, your monthly limit increases to 100 generations immediately. Your current month's usage carries over.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">
                How does billing work?
              </h4>
              <p className="text-gray-600 text-sm">
                Premium is billed monthly at {formatCurrency(currency)}{formatAmount(monthlyPrice)}/month. Your subscription automatically renews until you cancel.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !cancelLoading && setShowCancelConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Premium?</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel your Premium subscription?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-1.5">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 font-bold">✗</span>
                <span>Monthly limit reduced to 10 generations</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 font-bold">✗</span>
                <span>Platform selection limited to 4</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 font-bold">✗</span>
                <span>No priority support</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-500 font-bold">✗</span>
                <span>No early access to new features</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Premium
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
