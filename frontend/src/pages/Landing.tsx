import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import mainLogo from '../assets/images/main-logo.png';
import api from '../services/api';

interface PricingData {
  premium: {
    amount: number;
    currency: string;
    interval: string;
    name: string;
  };
  free: {
    amount: number;
    currency: string;
    interval: string;
    name: string;
  };
}

export default function Landing() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  // Fetch pricing from Stripe
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setPricingLoading(true);
        const response = await api.get('/payment/pricing');

        if (response?.data?.success) {
          setPricing(response.data.pricing);
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
        // Set default pricing as fallback
        setPricing({
          premium: { amount: 9.99, currency: 'USD', interval: 'month', name: 'Premium' },
          free: { amount: 0, currency: 'USD', interval: 'forever', name: 'Free' },
        });
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex-shrink-0">
              <img
                src={mainLogo}
                alt="Captions For You"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-bold text-indigo-600 leading-tight">
                Captions For You
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider hidden sm:block">
                AI Caption Generator
              </span>
            </div>
          </Link>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-indigo-600">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Generate Viral Social Media Captions with AI
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create platform-optimized captions with predictive analytics for Instagram, TikTok,
            Facebook, and YouTube
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700"
          >
            Start Free Trial
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
            <p className="text-gray-600">
              Get engagement predictions and reach estimates for every caption
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Trending Hashtags</h3>
            <p className="text-gray-600">
              Automatically include platform-specific trending hashtags
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Custom Brand Voice</h3>
            <p className="text-gray-600">
              Captions tailored to your niche, audience, and brand style
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h3>

          {pricingLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 p-8">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Free</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Perfect for trying out our caption generator
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {pricing?.free.currency === 'USD' ? '$' : pricing?.free.currency + ' '}
                      {pricing?.free.amount.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/ {pricing?.free.interval}</span>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">10 caption generations per month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Up to 4 platforms per generation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">3 caption variants per platform</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Basic analytics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">All content types supported</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block text-center w-full py-3 rounded-lg font-semibold transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-indigo-500 p-8">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MOST POPULAR
                </div>

                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Premium</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    For serious content creators and businesses
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {pricing?.premium.currency === 'USD' ? '$' : pricing?.premium.currency + ' '}
                      {pricing?.premium.amount.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/ {pricing?.premium.interval}</span>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">100 caption generations per month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Unlimited platforms per generation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">3 caption variants per platform</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Advanced analytics & insights</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">All content types supported</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Priority support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Early access to new features</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                >
                  <Crown className="w-5 h-5" />
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
