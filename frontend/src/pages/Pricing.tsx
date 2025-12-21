import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Check, Sparkles, Zap, Crown, ArrowLeft, Loader2
} from 'lucide-react';
import { RootState } from '../store/store';
import api from '../services/api';

const PLANS = [
  {
    name: 'Free',
    tier: 'FREE',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out our caption generator',
    features: [
      '10 caption generations per month',
      'Up to 4 platforms per generation',
      '3 caption variants per platform',
      'Basic analytics',
      'All content types supported',
      'Profile customization',
    ],
    limitations: [
      'Limited to 10 generations/month',
      'Maximum 4 platforms',
    ],
    buttonText: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Premium',
    tier: 'PREMIUM',
    price: 9.99,
    period: 'month',
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
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentTier = user?.subscriptionTier || 'FREE';

  // Check for success/canceled query params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setSuccessMessage('Payment successful! Your Premium subscription is now active. Please refresh the page to see updates.');
      // Refresh after showing message
      setTimeout(() => {
        window.location.href = '/pricing';
      }, 3000);
    } else if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleUpgrade = async (tier: string) => {
    if (tier === currentTier) return;

    setLoading(true);
    setError('');

    try {
      // Create Stripe checkout session
      const response = await api.post('/payment/create-checkout-session');
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">captions for you</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
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
            className="text-center mb-8"
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
            className="max-w-2xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-600 text-sm font-medium">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan, index) => {
            const isCurrentPlan = plan.tier === currentTier;
            const canUpgrade = plan.tier === 'PREMIUM' && currentTier === 'FREE';

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                  plan.highlighted
                    ? 'border-indigo-500'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-100'
                }`}
              >
                {/* Highlight Badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600">/ {plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
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

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your Premium subscription anytime from your Profile page. When you cancel, you'll be downgraded to the Free plan with 10 generations per month.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I switch between plans?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade from Free to Premium at any time. Your upgrade takes effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">
                What happens to my usage when I upgrade?
              </h4>
              <p className="text-gray-600 text-sm">
                When you upgrade to Premium, your monthly limit increases to 100 generations immediately. Your current month's usage carries over.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">
                How does billing work?
              </h4>
              <p className="text-gray-600 text-sm">
                Premium is billed monthly at $9.99/month. Your subscription automatically renews each month until you cancel.
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Premium?</h3>
              <p className="text-gray-600">
                Are you sure you want to cancel your Premium subscription?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
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
    </div>
  );
}
