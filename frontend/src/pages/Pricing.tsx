import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Check, Zap, Crown, Loader2, Clock, X
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

const DEFAULT_MONTHLY: PlanPricing = { amount: 4.99, currency: 'AUD', interval: 'month', name: 'Premium Monthly' };
const DEFAULT_YEARLY: PlanPricing = { amount: 49.99, currency: 'AUD', interval: 'year', name: 'Premium Yearly' };

const FREE_FEATURES = [
  '5 caption generations per month',
  'Up to 2 platforms per generation',
  '3 caption variants per platform',
  'Basic analytics',
  'All content types supported',
  'Profile customization',
];

const PREMIUM_FEATURES = [
  '100 caption generations per month',
  'Unlimited platforms per generation',
  '3 caption variants per platform',
  'Advanced analytics & insights',
  'All content types supported',
  'Profile customization',
  'Priority support',
  'Early access to new features',
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
  const [pricingLoading, setPricingLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [monthlyPrice, setMonthlyPrice] = useState(DEFAULT_MONTHLY.amount);
  const [yearlyPrice, setYearlyPrice] = useState(DEFAULT_YEARLY.amount);
  const [currency, setCurrency] = useState(DEFAULT_MONTHLY.currency);

  const formatCurrency = (curr: string) => (curr === 'AUD' ? '$' : `${curr} `);
  const formatAmount = (amount: number) => (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  const savingsPercent = monthlyPrice
    ? Math.max(0, Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100))
    : 0;

  const currentTier = (user?.subscriptionTier || 'FREE') as string;
  const isFree = currentTier === 'FREE';
  const isTrial = currentTier === 'TRIAL';
  const isPremium = currentTier === 'PREMIUM';
  const hasTrialed = user?.trialActivated || false;

  // Trial days remaining
  const trialDaysLeft = (() => {
    if (!isTrial || !user?.trialEndsAt) return 0;
    const diff = new Date(user.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  // Fetch pricing from Stripe
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setPricingLoading(true);
        const response = await api.get('/payment/pricing');
        if (response?.data?.success && response?.data?.pricing) {
          const { monthly, yearly } = response.data.pricing;
          setMonthlyPrice(monthly?.amount ?? DEFAULT_MONTHLY.amount);
          setYearlyPrice(yearly?.amount ?? DEFAULT_YEARLY.amount);
          setCurrency(monthly?.currency ?? DEFAULT_MONTHLY.currency);
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
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
        const isTrialActivation = response.data.subscriptionTier === 'TRIAL';
        setSuccessMessage(
          isTrialActivation
            ? 'Your 7-day free trial is now active! Enjoy full Premium features.'
            : 'Payment successful! Your Premium subscription is now active.'
        );

        // Fetch updated user data
        const userResponse = await api.get('/auth/me');
        dispatch(setUser(userResponse.data));

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

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/payment/create-checkout-session', {
        billingInterval,
      });
      const { url } = response.data;

      if (url) {
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
      const response = await api.post('/subscription/cancel');
      const message = response.data?.message || 'Subscription cancelled successfully.';

      setSuccessMessage(message);
      setShowCancelConfirm(false);

      // Fetch updated user data
      const userResponse = await api.get('/auth/me');
      dispatch(setUser(userResponse.data));
    } catch (err: any) {
      console.error('Cancel error:', err);
      setError(err.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Determine Premium card CTA
  const getPremiumCTA = () => {
    if (isPremium) return { text: 'Current Plan', disabled: true };
    if (isTrial) return { text: `On Trial (${trialDaysLeft}d left)`, disabled: true };
    if (isFree && !hasTrialed) return { text: 'Start 7-Day Free Trial', disabled: false };
    return { text: 'Subscribe to Premium', disabled: false };
  };

  const premiumCTA = getPremiumCTA();
  const displayPrice = billingInterval === 'yearly' ? yearlyPrice : monthlyPrice;
  const displayInterval = billingInterval === 'yearly' ? 'year' : 'month';

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
            {isFree && !hasTrialed ? 'Start Your Free Trial' : 'Choose Your Plan'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-gray-600"
          >
            {isFree && !hasTrialed
              ? '7 days of full Premium access, no charge until trial ends'
              : 'Unlock unlimited captions with Premium'}
          </motion.p>
        </div>

        {/* Current Tier Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            isPremium
              ? 'bg-purple-100 text-purple-700'
              : isTrial
                ? 'bg-amber-100 text-amber-700'
                : 'bg-indigo-100 text-indigo-700'
          }`}>
            {isPremium ? (
              <>
                <Crown className="w-4 h-4" />
                You're on Premium
              </>
            ) : isTrial ? (
              <>
                <Clock className="w-4 h-4" />
                Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                You're on the Free Plan
              </>
            )}
          </span>
        </motion.div>

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
            {/* Free Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                isFree ? 'border-green-500' : 'border-gray-100'
              }`}
            >
              {isFree && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  CURRENT PLAN
                </div>
              )}
              <div className="p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">Free</h3>
                  <p className="text-gray-600 text-sm mb-3">Perfect for trying out our caption generator</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{formatCurrency(currency)}0</span>
                    <span className="text-gray-600 text-sm">/ forever</span>
                  </div>
                </div>
                <div className="mb-5 space-y-2.5">
                  <p className="text-sm font-semibold text-gray-900 mb-2">What's included:</p>
                  {FREE_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  {isFree ? 'Current Plan' : 'Free Plan'}
                </button>
              </div>
            </motion.div>

            {/* Premium Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                isPremium
                  ? 'border-green-500'
                  : isTrial
                    ? 'border-amber-500'
                    : 'border-indigo-500'
              }`}
            >
              {/* Badge */}
              {isPremium ? (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  CURRENT PLAN
                </div>
              ) : isTrial ? (
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  ON TRIAL
                </div>
              ) : (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  {!hasTrialed ? '7-DAY FREE TRIAL' : 'MOST POPULAR'}
                </div>
              )}

              <div className="p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">Premium</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {!hasTrialed && isFree
                      ? 'Try free for 7 days, then auto-renews'
                      : 'For serious content creators and businesses'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(currency)}{formatAmount(displayPrice)}
                    </span>
                    <span className="text-gray-600 text-sm">/ {displayInterval}</span>
                  </div>
                  {billingInterval === 'yearly' && (
                    <p className="text-green-600 text-sm mt-2 font-medium">
                      {formatCurrency(currency)}{formatAmount(yearlyPrice / 12)}/month when billed annually
                    </p>
                  )}
                  {!hasTrialed && isFree && (
                    <p className="text-indigo-600 text-sm mt-2 font-medium">
                      First 7 days free - cancel anytime, no charge
                    </p>
                  )}
                </div>

                <div className="mb-5 space-y-2.5">
                  <p className="text-sm font-semibold text-gray-900 mb-2">What's included:</p>
                  {PREMIUM_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <motion.button
                    onClick={() => !premiumCTA.disabled && handleUpgrade()}
                    disabled={premiumCTA.disabled || loading}
                    whileHover={!premiumCTA.disabled && !loading ? { scale: 1.02 } : {}}
                    whileTap={!premiumCTA.disabled && !loading ? { scale: 0.98 } : {}}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      premiumCTA.disabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {!premiumCTA.disabled && <Crown className="w-5 h-5" />}
                        {premiumCTA.text}
                      </>
                    )}
                  </motion.button>

                  {/* Cancel Link - Show for TRIAL or PREMIUM */}
                  {(isTrial || isPremium) && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="block w-full text-center mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      {isTrial ? 'Cancel Trial' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* How Trial Works - Show for free users who haven't trialed */}
        {isFree && !hasTrialed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">How the Free Trial Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Start Your Trial</h4>
                <p className="text-gray-600 text-sm">Enter your card details. You won't be charged today.</p>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Enjoy 7 Days Free</h4>
                <p className="text-gray-600 text-sm">Full Premium access - 100 captions, unlimited platforms.</p>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Auto-Renews</h4>
                <p className="text-gray-600 text-sm">After 7 days, your plan starts at {formatCurrency(currency)}{formatAmount(monthlyPrice)}/month. Cancel anytime.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">Will I be charged during the trial?</h4>
              <p className="text-gray-600 text-sm">
                No! Your card is only saved for when the trial ends. You won't be charged a single cent during the 7-day trial period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">What happens after the trial ends?</h4>
              <p className="text-gray-600 text-sm">
                Your subscription automatically starts at {formatCurrency(currency)}{formatAmount(monthlyPrice)}/month (or {formatCurrency(currency)}{formatAmount(yearlyPrice)}/year if you chose yearly). You'll keep full Premium access with no interruption.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">Can I cancel during the trial?</h4>
              <p className="text-gray-600 text-sm">
                Absolutely! Cancel anytime during your trial and you won't be charged. You'll be moved back to the free plan immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-1.5">What if my payment fails after the trial?</h4>
              <p className="text-gray-600 text-sm">
                We'll retry your payment a few times over 7 days. If it still fails, you'll be moved to the free plan. You can update your payment method and re-subscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Cancel Confirmation Modal */}
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isTrial ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {isTrial ? (
                  <Clock className="w-7 h-7 text-amber-600" />
                ) : (
                  <Crown className="w-7 h-7 text-red-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isTrial ? 'Cancel Trial?' : 'Cancel Subscription?'}
              </h3>
              <p className="text-sm text-gray-600">
                {isTrial
                  ? "You won't be charged. You'll be moved to the free plan immediately."
                  : `You'll keep Premium access until your current billing period ends${user?.subscriptionTier === 'PREMIUM' ? '.' : '.'}`}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-5 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 mb-1">On the free plan, you'll lose:</p>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>100 monthly generations (reduced to 5)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Unlimited platform selection (reduced to 2)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Priority support & early access</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {isTrial ? 'Keep Trial' : 'Keep Premium'}
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
