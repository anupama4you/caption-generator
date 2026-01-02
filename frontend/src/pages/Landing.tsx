import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, Crown, Sparkles, TrendingUp, Zap, MessageSquare, Award, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import mainLogo from '../assets/images/main-logo.svg';
import heroImage from '../assets/images/hero_image.png';
import step1Image from '../assets/images/describe_your_content.png';
import step2Image from '../assets/images/generated_captions.png';
import step3Image from '../assets/images/copy_and_paste.png';
import api from '../services/api';

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

export default function Landing() {
  // Initialize with default pricing for instant display
  const [pricing, setPricing] = useState<PricingData>(DEFAULT_PRICING);

  // Fetch actual pricing from Stripe in the background
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get('/payment/pricing');

        if (response?.data?.success && response?.data?.pricing) {
          const { monthly, yearly, free } = response.data.pricing;

          setPricing({
            monthly: monthly || DEFAULT_PRICING.monthly,
            yearly: yearly || DEFAULT_PRICING.yearly,
            free: free || DEFAULT_PRICING.free,
          });
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
        // Keep default pricing on error
      }
    };

    fetchPricing();
  }, []);

  const formatCurrency = (plan: PlanPricing) => (plan.currency === 'USD' ? '$' : `${plan.currency} `);
  const formatAmount = (amount: number) => (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));
  const { free: freePlan, monthly: monthlyPlan, yearly: yearlyPlan } = pricing;

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-lg z-50 rounded-b-2xl shadow-sm"
      >
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={mainLogo}
                alt="Captions For You"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </motion.div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <div className="py-20 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Caption Generator
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Generate Viral Social Media
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Captions </span>
              Instantly
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Create platform-optimized captions with AI-powered analytics for Instagram, TikTok, Facebook, and YouTube in seconds
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Generate 5 Captions Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all border-2 border-gray-200"
              >
                Learn More
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                5 free captions
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-6xl mx-auto"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50"></div>

              {/* Hero Image */}
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-white overflow-hidden">
                <img
                  src={heroImage}
                  alt="Captions For You Dashboard Preview"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Everything You Need to Go Viral
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Powerful AI features designed to maximize your social media engagement
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">AI-Powered Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Get real-time engagement predictions and reach estimates for every caption you generate
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Trending Hashtags</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically include platform-specific trending hashtags to boost your discoverability
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Custom Brand Voice</h3>
              <p className="text-gray-600 leading-relaxed">
                Captions perfectly tailored to your niche, target audience, and unique brand style
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Multi-Platform Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate optimized captions for Instagram, TikTok, YouTube, Facebook, and more
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Multiple Variants</h3>
              <p className="text-gray-600 leading-relaxed">
                Get 3 unique caption variations per platform to choose the perfect one for your post
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by advanced AI technology for professional, engaging, and conversion-focused captions
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Create viral captions in just 3 simple steps
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-12"
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex-shrink-0 w-full md:w-1/2">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4 shadow-xl">
                  <img
                    src={step1Image}
                    alt="Describe Your Content - Step 1"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 1
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Describe Your Content</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Tell us about your post, select your platforms, and choose your content type. Our AI will understand your needs.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row-reverse items-center gap-8"
            >
              <div className="flex-shrink-0 w-full md:w-1/2">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 shadow-xl">
                  <img
                    src={step2Image}
                    alt="AI Generates Captions - Step 2"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 2
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">AI Generates Captions</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our advanced AI analyzes trends, your brand voice, and creates multiple caption variations optimized for each platform.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex-shrink-0 w-full md:w-1/2">
                <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl p-4 shadow-xl">
                  <img
                    src={step3Image}
                    alt="Copy & Post - Step 3"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-block bg-pink-100 text-pink-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  Step 3
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Copy & Post</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Choose your favorite caption from the AI-generated options, copy it with one click, and post to your social media. That's it!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Start free and upgrade when you're ready to scale
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
                {/* Free Plan */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200 p-8 transition-all"
                >
                  <div className="mb-8">
                    <h4 className="text-3xl font-bold text-gray-900 mb-2">Free</h4>
                    <p className="text-gray-600 mb-6">
                      Perfect for trying out our caption generator
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-gray-900">
                        {formatCurrency(freePlan)}
                        {formatAmount(freePlan.amount)}
                      </span>
                      <span className="text-gray-600 text-lg">/ {freePlan.interval}</span>
                    </div>
                  </div>

                  <div className="mb-8 space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">5 caption generations per month</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Up to 2 platforms per generation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">3 caption variants per platform</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Basic analytics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">All content types supported</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="block text-center w-full py-4 rounded-xl font-bold transition-all bg-gray-100 text-gray-900 hover:bg-gray-200 text-lg"
                  >
                    Generate 5 Captions Free
                  </Link>
                </motion.div>

                {/* Premium Plan */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-400 p-8 transition-all"
                >
                  <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-6 py-2 text-sm font-bold rounded-bl-2xl">
                    MOST POPULAR
                  </div>

                  <div className="mb-8">
                    <h4 className="text-3xl font-bold text-white mb-2">Premium</h4>
                    <p className="text-indigo-100 mb-6">
                      For serious content creators and businesses
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-white">
                        {formatCurrency(monthlyPlan)}
                        {formatAmount(monthlyPlan.amount)}
                      </span>
                      <span className="text-indigo-100 text-lg">/ {monthlyPlan.interval}</span>
                    </div>
                    <div className="mt-2 text-indigo-100 text-sm">
                      Or save with {formatCurrency(yearlyPlan)}{formatAmount(yearlyPlan.amount)} / {yearlyPlan.interval}
                    </div>
                  </div>

                  <div className="mb-8 space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">100 caption generations per month</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Unlimited platforms per generation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">3 caption variants per platform</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Advanced analytics & insights</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">All content types supported</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Priority support</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Early access to new features</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all bg-white text-indigo-600 hover:bg-gray-50 text-lg shadow-lg"
                  >
                    <Crown className="w-6 h-6" />
                    Generate 5 Captions Free
                  </Link>
                </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-20"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Create Viral Captions?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-2xl mx-auto">
                Join thousands of content creators using AI to boost their social media engagement
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all shadow-xl transform hover:scale-105"
              >
                Generate 5 Captions Free
                <ArrowRight className="w-6 h-6" />
              </Link>
              <p className="mt-6 text-indigo-100 text-sm">
                No credit card required • 5 free captions • Cancel anytime
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <img src={mainLogo} alt="Captions For You" className="h-10 mx-auto mb-4 opacity-80" />
            <p className="text-sm">
              © 2026 Captions For You. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
