import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, TrendingUp, Clock,
  Hash, MessageSquare, BarChart3, Zap, Instagram,
  Facebook, Youtube, Video, Image, FileText, Camera,
  Loader2, Linkedin, Twitter, Ghost, Clapperboard, Layers, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Crown
} from 'lucide-react';
import facebookLogo from '../assets/images/facebook.png';
import instagramLogo from '../assets/images/instagram.png';
import tiktokLogo from '../assets/images/tiktok.png';
import youtubeLogo from '../assets/images/youtube.png';
import snapchatLogo from '../assets/images/snapchat.png';
import linkedinLogo from '../assets/images/linkedin.png';
import twitterLogo from '../assets/images/twitter.png';
import { RootState } from '../store/store';
import api from '../services/api';
import { Caption, Platform, ContentType, UsageStats } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const PLATFORMS: { value: Platform; label: string; icon: any; color: string; supportedContentTypes: ContentType[] }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', supportedContentTypes: ['short_video', 'image', 'carousel', 'story'] },
  { value: 'tiktok', label: 'TikTok', icon: Video, color: 'from-gray-900 to-gray-700', supportedContentTypes: ['short_video'] },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube, color: 'from-red-600 to-red-400', supportedContentTypes: ['short_video'] },
  { value: 'youtube_long', label: 'YouTube Long', icon: Clapperboard, color: 'from-red-500 to-amber-500', supportedContentTypes: ['long_video'] },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-400', supportedContentTypes: ['short_video', 'long_video', 'image', 'carousel', 'story', 'text_only'] },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-sky-600 to-blue-400', supportedContentTypes: ['long_video', 'image', 'carousel', 'text_only'] },
  { value: 'x', label: 'X (Twitter)', icon: Twitter, color: 'from-gray-900 to-gray-700', supportedContentTypes: ['image', 'text_only'] },
  { value: 'snapchat', label: 'Snapchat', icon: Ghost, color: 'from-yellow-400 to-amber-300', supportedContentTypes: ['short_video', 'image', 'story'] },
];

const CONTENT_TYPES: { value: ContentType; label: string; icon: any }[] = [
  { value: 'short_video', label: 'Short Video', icon: Video },
  { value: 'long_video', label: 'Long Video', icon: Clapperboard },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'carousel', label: 'Carousel', icon: Layers },
  { value: 'story', label: 'Story', icon: Camera },
  { value: 'text_only', label: 'Text Only', icon: FileText },
];

const platformArt = (platform: Platform) => {
  const baseClass = 'flex items-center justify-center';

  const imageMap: Partial<Record<Platform, string>> = {
    instagram: instagramLogo,
    tiktok: tiktokLogo,
    youtube_shorts: youtubeLogo,
    youtube_long: youtubeLogo,
    facebook: facebookLogo,
    linkedin: linkedinLogo,
    x: twitterLogo,
    snapchat: snapchatLogo,
  };

  const imgSrc = imageMap[platform];

  if (imgSrc) {
    return (
      <div className={baseClass}>
        <img src={imgSrc} alt={platform} className="w-8 h-8 object-contain" />
      </div>
    );
  }

  const FallbackIcon = platform === 'pinterest' ? Layers : Sparkles;
  return (
    <div className={`${baseClass} w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600`}>
      <FallbackIcon className="w-5 h-5 text-white" />
    </div>
  );
};

// Maximum platforms allowed for free users
const MAX_FREE_PLATFORMS = 2;

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

// Caption Generation Loader Component
function CaptionLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "Warming up the AI brain...", emoji: "🧠" },
    { text: "Analyzing your content...", emoji: "🔍" },
    { text: "Crafting the perfect hook...", emoji: "✍️" },
    { text: "Sprinkling in some magic...", emoji: "✨" },
    { text: "Picking the best hashtags...", emoji: "#️⃣" },
    { text: "Predicting viral potential...", emoji: "📈" },
    { text: "Polishing every word...", emoji: "💎" },
    { text: "Almost there, hold tight...", emoji: "🚀" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      {/* Floating background orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-10 blur-3xl"
          style={{
            width: `${120 + i * 40}px`,
            height: `${120 + i * 40}px`,
            background: i % 2 === 0 ? '#818cf8' : '#a78bfa',
            left: `${10 + (i * 15)}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}

      <div className="relative flex flex-col items-center text-center px-6 max-w-md">
        {/* Orbiting rings */}
        <div className="relative w-40 h-40 mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full bg-indigo-400 -translate-x-1/2" />
          </motion.div>

          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-purple-400/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-2 left-1/2 w-3 h-3 rounded-full bg-purple-400 -translate-x-1/2" />
          </motion.div>

          {/* Center pulsing icon */}
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
        </div>

        {/* Animated message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <span className="text-4xl mb-3 block">{messages[messageIndex].emoji}</span>
            <p className="text-gray-900 text-xl font-semibold">{messages[messageIndex].text}</p>
          </motion.div>
        </AnimatePresence>

        <p className="text-indigo-600 text-sm mt-2">Generating captions for all your platforms</p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {messages.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: i === messageIndex ? '#818cf8' : '#e0e7ff',
                scale: i === messageIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Fun tip */}
        <motion.p
          className="text-indigo-500 text-xs mt-8 max-w-xs"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💡 Tip: The more detail you provide, the better your captions will be!
        </motion.p>
      </div>
    </motion.div>
  );
}

// Benefits Carousel Component
function BenefitsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const benefits = [
    {
      icon: TrendingUp,
      title: 'AI Analytics',
      description: 'Engagement predictions',
      color: 'indigo',
      borderColor: 'border-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Zap,
      title: 'Multi-Platform',
      description: '8+ social networks',
      color: 'purple',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: MessageSquare,
      title: '3 Variations',
      description: 'Choose the best one',
      color: 'pink',
      borderColor: 'border-pink-100',
      iconColor: 'text-pink-600',
    },
  ];

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  return (
    <div className="mb-10 max-w-3xl mx-auto">
      {/* Desktop: Grid */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border ${benefit.borderColor}`}
          >
            <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
            <span className="font-semibold text-gray-900">{benefit.title}</span>
            <span className="text-xs text-gray-600">{benefit.description}</span>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Carousel */}
      <div className="sm:hidden relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 px-4"
            >
              <div className={`flex flex-col items-center gap-2 p-6 bg-white rounded-xl shadow-sm border ${benefit.borderColor}`}>
                <benefit.icon className={`w-10 h-10 ${benefit.iconColor}`} />
                <span className="font-semibold text-gray-900 text-lg">{benefit.title}</span>
                <span className="text-sm text-gray-600">{benefit.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {benefits.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-indigo-600 w-6'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
    'tiktok',
  ]);
  const [contentType, setContentType] = useState<ContentType>('short_video');
  const [pricing, setPricing] = useState<PricingData>(DEFAULT_PRICING);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAnalytics, setExpandedAnalytics] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState<Record<string, number>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isGuestGeneration, setIsGuestGeneration] = useState(false);
  const [isLimitError, setIsLimitError] = useState(false);
  const formatCurrency = (plan: PlanPricing) => (plan.currency === 'USD' ? '$' : `${plan.currency} `);
  const formatAmount = (amount: number) => (Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2));

  // Get available platforms based on content type
  const getAvailablePlatforms = () => {
    return PLATFORMS.filter(p => p.supportedContentTypes.includes(contentType));
  };

  // Check if user is on free tier
  const isFreeUser = user?.subscriptionTier === 'FREE';
  // Only FREE tier logged-in users are limited to 2 platforms
  // Guests and Premium users get unlimited platforms
  const hasLimitedPlatforms = isFreeUser;

  useEffect(() => {
    fetchUsage();
    fetchPricing();
  }, [user]); // Fetch usage when user logs in or out

  // Limit selected platforms when user becomes free tier (upgrades from guest or downgrades from premium)
  useEffect(() => {
    if (hasLimitedPlatforms && selectedPlatforms.length > MAX_FREE_PLATFORMS) {
      // User became free tier - limit to MAX_FREE_PLATFORMS
      setSelectedPlatforms(prev => prev.slice(0, MAX_FREE_PLATFORMS));
    }
  }, [isFreeUser, user]);

  // Update selected platforms when content type changes
  useEffect(() => {
    const availablePlatforms = getAvailablePlatforms();
    const availablePlatformValues = availablePlatforms.map(p => p.value);

    // Filter out platforms that don't support the new content type
    setSelectedPlatforms(prev => {
      const filtered = prev.filter(p => availablePlatformValues.includes(p));

      // If we have fewer than the max allowed platforms after filtering, add more
      if (filtered.length < (hasLimitedPlatforms ? MAX_FREE_PLATFORMS : availablePlatformValues.length)) {
        // Add platforms that aren't already selected
        const toAdd = availablePlatformValues.filter(p => !filtered.includes(p));
        const combined = [...filtered, ...toAdd];
        return combined.slice(0, hasLimitedPlatforms ? MAX_FREE_PLATFORMS : combined.length);
      }

      return filtered;
    });
  }, [contentType]);

  const fetchUsage = async () => {
    if (!user) return; // Skip for guest users
    try {
      const response = await api.get('/profile/usage');
      setUsage(response.data.data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

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
      // Set default pricing as fallback
      setPricing(DEFAULT_PRICING);
    }
  };

  const togglePlatform = (platform: Platform) => {
    // Only FREE tier users are limited to 2 platforms
    const isLimited = user?.subscriptionTier === 'FREE';

    setSelectedPlatforms(prev => {
      // If platform is already selected, remove it
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      }

      // Check if free tier user is at limit
      if (isLimited && prev.length >= MAX_FREE_PLATFORMS) {
        setError(`Free tier allows up to ${MAX_FREE_PLATFORMS} platforms. Upgrade to Premium for unlimited platforms!`);
        setTimeout(() => setError(''), 3000);
        return prev;
      }

      // Add the platform
      return [...prev, platform];
    });
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLimitError(false);
    setLoading(true);
    setCopiedId(null);

    try {
      const response = await api.post('/captions/generate', {
        platforms: selectedPlatforms,
        contentFormat: contentType,
        contentDescription: description,
      });

      // Response is an attempt with captions array
      const attempt = response.data.data;
      setGeneratedCaptions(attempt.captions || []);

      // Track whether this was a guest generation
      setIsGuestGeneration(!user && response.data.isGuest === true);

      // Only fetch usage for authenticated users
      if (user) {
        await fetchUsage();
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Monthly limit reached');
      } else {
        setError('Failed to generate caption');
      }
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = usage
    ? (usage.captionsGenerated / usage.monthlyLimit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
        onLogoClick={() => setGeneratedCaptions([])}
      />

      <main className="container mx-auto px-4 sm:px-6 py-4 pb-24 sm:pb-8 max-w-7xl">
        {/* Hero Section for Guests */}
        {!user && generatedCaptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12 pt-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Caption Generator • 100% Free to Try
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Generate <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Viral Captions</span>
              <br />in Seconds
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create platform-optimized captions with AI-powered analytics. No signup required to start!
            </p>

            {/* Quick Benefits Carousel */}
            <BenefitsCarousel />

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8"
            >
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">No credit card • No signup required • Start generating below ↓</span>
            </motion.div>
          </motion.div>
        )}

        {/* Conditional Layout: Show loader OR form OR results */}
        {loading ? (
          <CaptionLoader />
        ) : generatedCaptions.length === 0 ? (
          /* Generation Form - Compact Single View */
          <div className="max-w-6xl mx-auto">
            {/* Top Bar: Welcome + Usage */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {user?.name ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Welcome, {user.name}! 👋
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Generate engaging captions for every platform
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      🚀 Start Generating Your First Caption
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Fill in the details below and watch AI create amazing captions for you
                    </p>
                  </>
                )}
              </motion.div>

              {/* Usage Stats - Compact */}
              {usage && user && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Monthly Usage</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {usage.captionsGenerated} / {usage.monthlyLimit}
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isFreeUser ? 'bg-gray-100 text-gray-700' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {isFreeUser ? 'Free' : 'Premium'}
                  </span>
                </div>
              )}
            </div>

            {/* Premium Upgrade Banner - Compact */}
            {isFreeUser && user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 mb-4 text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6" />
                  <div>
                    <div className="font-bold">Upgrade to Premium</div>
                    <div className="text-xs text-indigo-100">100 captions/month • Unlimited platforms • Advanced analytics</div>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-all whitespace-nowrap"
                >
                  {`${formatCurrency(pricing.monthly)}${formatAmount(pricing.monthly.amount)}/${pricing.monthly.interval}`}
                </Link>
              </motion.div>
            )}

            {/* Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8 sm:mb-4"
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`${
                      isLimitError
                        ? 'bg-amber-50 border border-amber-300 text-amber-800'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    } px-4 py-3 rounded-lg mb-4 text-sm`}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleGenerate} className="space-y-4 pb-4 sm:pb-0">
                {/* Content Type - Compact Pills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = contentType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setContentType(type.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Selection - Compact Grid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Platforms
                    {isFreeUser && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({selectedPlatforms.length}/{MAX_FREE_PLATFORMS} selected)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {getAvailablePlatforms().map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform.value);
                      const isDisabled = hasLimitedPlatforms && !isSelected && selectedPlatforms.length >= MAX_FREE_PLATFORMS;
                      const art = platformArt(platform.value);

                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => togglePlatform(platform.value)}
                          disabled={isDisabled}
                          className={`relative p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="flex flex-col items-center gap-2">
                            {art}
                            <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-900' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                              {platform.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {hasLimitedPlatforms && selectedPlatforms.length >= MAX_FREE_PLATFORMS && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {user ? 'Upgrade to Premium' : 'Sign up for Premium'} for unlimited platform selection
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe Your Content
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: A morning workout routine showing 5 exercises for abs, filmed in a modern gym with motivational background music..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                    rows={3}
                    required
                  />
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={loading || !description.trim() || selectedPlatforms.length === 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Captions
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          /* Results View - Full Width */
          <div className="relative">
            {/* Guest User Signup Modal - Fixed to viewport center */}
            {!isAuthenticated && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 bg-black/20 z-40" />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-2 border-indigo-200"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center"
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Your Captions Are Ready! 🎉
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Sign up for free to view your generated captions and save them to your account.
                      </p>
                      <div className="space-y-3">
                        <motion.button
                          onClick={() => setShowRegisterModal(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Sign Up Free - View Results
                        </motion.button>
                        <motion.button
                          onClick={() => setShowLoginModal(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Already have an account? Log In
                        </motion.button>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        ✓ Free forever • ✓ 10 captions/month • ✓ Save history
                      </p>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* Header with Generate Another Button */}
            <div className={`flex justify-between items-center mb-6 ${!isAuthenticated ? 'filter blur-md pointer-events-none select-none' : ''}`}>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-indigo-600" />
                  Generated Captions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {generatedCaptions.length} captions ready to use
                </p>
              </div>
              <motion.button
                onClick={() => setGeneratedCaptions([])}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Another
              </motion.button>
            </div>

            {/* Group captions by platform */}
            <div className={`space-y-6 ${!isAuthenticated ? 'filter blur-md pointer-events-none select-none' : ''}`}>
              {(() => {
                // Group captions by platform
                const captionsByPlatform = generatedCaptions.reduce((acc, caption) => {
                  if (!acc[caption.platform]) {
                    acc[caption.platform] = [];
                  }
                  acc[caption.platform].push(caption);
                  return acc;
                }, {} as Record<string, typeof generatedCaptions>);

                return Object.entries(captionsByPlatform).map(([platform, captions]) => {
                  const platformMeta = PLATFORMS.find(p => p.value === platform);

                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                      {/* Platform Header */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                        {platformMeta && platformArt(platformMeta.value)}
                        <h4 className="text-lg font-bold text-gray-900">{platformMeta?.label ?? platform}</h4>
                        <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                          {captions.length} Captions
                        </span>
                      </div>

                      {/* Caption Variants - Carousel for Mobile, Grid for Desktop */}
                      <div className="relative">
                        {/* Mobile Navigation Arrows */}
                        {captions.length > 1 && (
                          <div className="md:hidden flex justify-between items-center mb-4">
                            <button
                              onClick={() => setCurrentSlide(prev => ({
                                ...prev,
                                [platform]: Math.max(0, (prev[platform] || 0) - 1)
                              }))}
                              disabled={(currentSlide[platform] || 0) === 0}
                              className={`p-2 rounded-full transition-colors ${
                                (currentSlide[platform] || 0) === 0
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                              {(currentSlide[platform] || 0) + 1} / {captions.length}
                            </span>
                            <button
                              onClick={() => setCurrentSlide(prev => ({
                                ...prev,
                                [platform]: Math.min(captions.length - 1, (prev[platform] || 0) + 1)
                              }))}
                              disabled={(currentSlide[platform] || 0) === captions.length - 1}
                              className={`p-2 rounded-full transition-colors ${
                                (currentSlide[platform] || 0) === captions.length - 1
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}

                        {/* Mobile Carousel */}
                        <div className="md:hidden overflow-hidden">
                          <motion.div
                            className="flex"
                            animate={{ x: `${-(currentSlide[platform] || 0) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          >
                            {captions.map((caption) => (
                              <div key={caption.id} className="w-full flex-shrink-0 px-1">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50"
                                >
                                  {/* Variant Number and Engagement Score */}
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-gray-500">
                                      Caption {caption.variantNumber}
                                    </span>
                                    {caption.analytics && (
                                      <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-full">
                                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-bold text-indigo-600">
                                          {caption.analytics.engagementScore.toFixed(0)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Caption Content */}
                                  {(caption.platform === 'youtube_shorts' || caption.platform === 'youtube_long') && caption.title ? (
                                    <div className="mb-4">
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-semibold text-gray-500 uppercase">Title</span>
                                          <CopyToClipboard
                                            text={caption.title}
                                            onCopy={() => {
                                              setCopiedId(`${caption.id}-title`);
                                              setTimeout(() => setCopiedId(null), 2000);
                                            }}
                                          >
                                            <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                              {copiedId === `${caption.id}-title` ? (
                                                <>
                                                  <Check className="w-3 h-3" />
                                                  Copied
                                                </>
                                              ) : (
                                                <>
                                                  <Copy className="w-3 h-3" />
                                                  Copy
                                                </>
                                              )}
                                            </button>
                                          </CopyToClipboard>
                                        </div>
                                        <p className="text-gray-900 font-semibold text-sm">
                                          {caption.title}
                                        </p>
                                      </div>
                                      {caption.description && (
                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
                                            <CopyToClipboard
                                              text={caption.description}
                                              onCopy={() => {
                                                setCopiedId(`${caption.id}-description`);
                                                setTimeout(() => setCopiedId(null), 2000);
                                              }}
                                            >
                                              <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                                {copiedId === `${caption.id}-description` ? (
                                                  <>
                                                    <Check className="w-3 h-3" />
                                                    Copied
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                  </>
                                                )}
                                              </button>
                                            </CopyToClipboard>
                                          </div>
                                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                            {caption.description}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed text-sm">
                                      {caption.generatedCaption}
                                    </p>
                                  )}

                                  {/* Hashtags */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {caption.hashtags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded-lg"
                                      >
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Copy Button */}
                                  <CopyToClipboard
                                    text={
                                      (caption.platform === 'youtube_shorts' || caption.platform === 'youtube_long') && caption.title
                                        ? `Title: ${caption.title}\n\nDescription: ${caption.description || caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`
                                        : `${caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`
                                    }
                                    onCopy={() => {
                                      setCopiedId(caption.id);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                  >
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                                        copiedId === caption.id
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                                      }`}
                                    >
                                      {copiedId === caption.id ? (
                                        <>
                                          <Check className="w-4 h-4" />
                                          Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-4 h-4" />
                                          Copy
                                        </>
                                      )}
                                    </motion.button>
                                  </CopyToClipboard>

                                  {/* Analytics - Collapsible */}
                                  {caption.analytics && (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                      <button
                                        onClick={() => setExpandedAnalytics(prev => ({
                                          ...prev,
                                          [caption.id]: !prev[caption.id]
                                        }))}
                                        className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-3"
                                      >
                                        <span className="flex items-center gap-1">
                                          <BarChart3 className="w-3 h-3 text-indigo-600" />
                                          Detailed Analytics
                                        </span>
                                        {expandedAnalytics[caption.id] ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {expandedAnalytics[caption.id] && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                              <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                                                <div className="text-lg font-bold text-indigo-600">
                                                  {caption.analytics.engagementScore.toFixed(0)}
                                                </div>
                                                <div className="text-[10px] text-gray-700 font-medium">Engagement</div>
                                              </div>
                                              <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                                <div className="text-lg font-bold text-purple-600">
                                                  {caption.analytics.viralityScore.toFixed(0)}
                                                </div>
                                                <div className="text-[10px] text-gray-700 font-medium">Virality</div>
                                              </div>
                                              <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                                <div className="text-xs font-bold text-green-600">
                                                  {caption.analytics.reachEstimate}
                                                </div>
                                                <div className="text-[10px] text-gray-700 font-medium">Reach</div>
                                              </div>
                                            </div>

                                            <div className="space-y-2 mb-3">
                                              {[
                                                { label: 'Hashtags', score: caption.analytics.hashtagScore, icon: Hash },
                                                { label: 'Length', score: caption.analytics.lengthScore, icon: MessageSquare },
                                                { label: 'Keywords', score: caption.analytics.keywordScore, icon: Zap },
                                              ].map((item, idx) => (
                                                <div key={idx}>
                                                  <div className="flex justify-between items-center text-[10px] mb-1">
                                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                                      <item.icon className="w-3 h-3" />
                                                      {item.label}
                                                    </span>
                                                    <span className="font-bold text-indigo-600">{item.score.toFixed(0)}%</span>
                                                  </div>
                                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <motion.div
                                                      initial={{ width: 0 }}
                                                      animate={{ width: `${item.score}%` }}
                                                      transition={{ duration: 1, delay: idx * 0.1 }}
                                                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            <div className="bg-blue-50 p-2 rounded-lg mb-2">
                                              <h6 className="font-semibold text-[10px] mb-1.5 flex items-center gap-1 text-blue-900">
                                                <Clock className="w-3 h-3" />
                                                Best Times
                                              </h6>
                                              <div className="flex flex-wrap gap-1">
                                                {caption.analytics.bestPostingTime.map((time, idx) => (
                                                  <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold"
                                                  >
                                                    {time}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>

                                            {caption.analytics.improvementTips.length > 0 && (
                                              <div className="bg-amber-50 p-2 rounded-lg">
                                                <h6 className="font-semibold text-[10px] mb-1.5 text-amber-900">💡 Tips</h6>
                                                <ul className="space-y-1 text-[10px] text-gray-700">
                                                  {caption.analytics.improvementTips.map((tip, idx) => (
                                                    <li key={idx} className="flex items-start gap-1">
                                                      <span className="text-amber-600 mt-0.5">•</span>
                                                      <span>{tip}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            ))}
                          </motion.div>
                        </div>

                        {/* Desktop Grid */}
                        <div className="hidden md:grid md:grid-cols-3 gap-4">
                          {captions.map((caption) => (
                          <motion.div
                            key={caption.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50 flex flex-col"
                          >
                            {/* Variant Number and Engagement Score */}
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-semibold text-gray-500">
                                Caption {caption.variantNumber}
                              </span>
                              {caption.analytics && (
                                <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-full">
                                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                                  <span className="text-sm font-bold text-indigo-600">
                                    {caption.analytics.engagementScore.toFixed(0)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Caption Text */}
                            {(caption.platform === 'youtube_shorts' || caption.platform === 'youtube_long') && caption.title ? (
                              <div className="mb-4">
                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Title</span>
                                    <CopyToClipboard
                                      text={caption.title}
                                      onCopy={() => {
                                        setCopiedId(`${caption.id}-title`);
                                        setTimeout(() => setCopiedId(null), 2000);
                                      }}
                                    >
                                      <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                        {copiedId === `${caption.id}-title` ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Copied
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                    </CopyToClipboard>
                                  </div>
                                  <p className="text-gray-900 font-semibold text-sm">
                                    {caption.title}
                                  </p>
                                </div>
                                {caption.description && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
                                      <CopyToClipboard
                                        text={caption.description}
                                        onCopy={() => {
                                          setCopiedId(`${caption.id}-description`);
                                          setTimeout(() => setCopiedId(null), 2000);
                                        }}
                                      >
                                        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                          {copiedId === `${caption.id}-description` ? (
                                            <>
                                              <Check className="w-3 h-3" />
                                              Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              Copy
                                            </>
                                          )}
                                        </button>
                                      </CopyToClipboard>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                      {caption.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed text-sm">
                                {caption.generatedCaption}
                              </p>
                            )}

                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {caption.hashtags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded-lg"
                                >
                                  {tag.startsWith('#') ? tag : `#${tag}`}
                                </span>
                              ))}
                            </div>

                            {/* Copy Button */}
                            <div className="mt-auto">
                              <CopyToClipboard
                                text={
                                  (caption.platform === 'youtube_shorts' || caption.platform === 'youtube_long') && caption.title
                                    ? `Title: ${caption.title}\n\nDescription: ${caption.description || caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`
                                    : `${caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`
                                }
                                onCopy={() => {
                                  setCopiedId(caption.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                              >
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                                    copiedId === caption.id
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                                  }`}
                                >
                                  {copiedId === caption.id ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      Copy
                                    </>
                                  )}
                                </motion.button>
                              </CopyToClipboard>
                            </div>

                            {/* Analytics - Collapsible */}
                            {caption.analytics && (
                              <div className="border-t border-gray-100 pt-4 mt-4">
                                <button
                                  onClick={() => setExpandedAnalytics(prev => ({
                                    ...prev,
                                    [caption.id]: !prev[caption.id]
                                  }))}
                                  className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-3"
                                >
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3 text-indigo-600" />
                                    Detailed Analytics
                                  </span>
                                  {expandedAnalytics[caption.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {expandedAnalytics[caption.id] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >

                                <div className="grid grid-cols-3 gap-2 mb-3">
                                  <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                                    <div className="text-lg font-bold text-indigo-600">
                                      {caption.analytics.engagementScore.toFixed(0)}
                                    </div>
                                    <div className="text-[10px] text-gray-700 font-medium">Engagement</div>
                                  </div>
                                  <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                    <div className="text-lg font-bold text-purple-600">
                                      {caption.analytics.viralityScore.toFixed(0)}
                                    </div>
                                    <div className="text-[10px] text-gray-700 font-medium">Virality</div>
                                  </div>
                                  <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                    <div className="text-xs font-bold text-green-600">
                                      {caption.analytics.reachEstimate}
                                    </div>
                                    <div className="text-[10px] text-gray-700 font-medium">Reach</div>
                                  </div>
                                </div>

                                {/* Score Bars */}
                                <div className="space-y-2 mb-3">
                                  {[
                                    { label: 'Hashtags', score: caption.analytics.hashtagScore, icon: Hash },
                                    { label: 'Length', score: caption.analytics.lengthScore, icon: MessageSquare },
                                    { label: 'Keywords', score: caption.analytics.keywordScore, icon: Zap },
                                  ].map((item, idx) => (
                                    <div key={idx}>
                                      <div className="flex justify-between items-center text-[10px] mb-1">
                                        <span className="flex items-center gap-1 font-medium text-gray-700">
                                          <item.icon className="w-3 h-3" />
                                          {item.label}
                                        </span>
                                        <span className="font-bold text-indigo-600">{item.score.toFixed(0)}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.score}%` }}
                                          transition={{ duration: 1, delay: idx * 0.1 }}
                                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Best Posting Times */}
                                <div className="bg-blue-50 p-2 rounded-lg mb-2">
                                  <h6 className="font-semibold text-[10px] mb-1.5 flex items-center gap-1 text-blue-900">
                                    <Clock className="w-3 h-3" />
                                    Best Times
                                  </h6>
                                  <div className="flex flex-wrap gap-1">
                                    {caption.analytics.bestPostingTime.map((time, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold"
                                      >
                                        {time}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Improvement Tips */}
                                {caption.analytics.improvementTips.length > 0 && (
                                  <div className="bg-amber-50 p-2 rounded-lg">
                                    <h6 className="font-semibold text-[10px] mb-1.5 text-amber-900">💡 Tips</h6>
                                    <ul className="space-y-1 text-[10px] text-gray-700">
                                      {caption.analytics.improvementTips.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-amber-600 mt-0.5">•</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Login & Register Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onLoginSuccess={async () => {
          // Fetch usage stats immediately after login
          await fetchUsage();

          // Save guest captions to the user's account (only if they were generated as a guest)
          if (generatedCaptions.length > 0 && isGuestGeneration) {
            try {
              await api.post('/captions/save-guest', {
                captions: generatedCaptions,
                contentFormat: contentType,
                contentDescription: description,
              });
              // Mark as no longer guest generation
              setIsGuestGeneration(false);
              // Refresh usage stats again after saving
              await fetchUsage();
            } catch (err: any) {
              console.error('Failed to save guest captions:', err);
              // Check if it's a limit exceeded error
              if (err.response?.status === 403 && err.response?.data?.limitExceeded) {
                setIsLimitError(true);
                setError(
                  `Welcome back! Unfortunately, you've already used all ${err.response.data.limit} of your monthly caption generations. Your limit resets next month, or you can upgrade to Premium for unlimited captions!`
                );
                // Clear the guest captions since they can't be saved
                setGeneratedCaptions([]);
                setIsGuestGeneration(false);
              }
            }
          }
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onRegisterSuccess={async () => {
          // Fetch usage stats immediately after registration
          await fetchUsage();

          // Save guest captions to the user's account (only if they were generated as a guest)
          if (generatedCaptions.length > 0 && isGuestGeneration) {
            try {
              await api.post('/captions/save-guest', {
                captions: generatedCaptions,
                contentFormat: contentType,
                contentDescription: description,
              });
              // Mark as no longer guest generation
              setIsGuestGeneration(false);
              // Refresh usage stats again after saving
              await fetchUsage();
            } catch (err: any) {
              console.error('Failed to save guest captions:', err);
              // Check if it's a limit exceeded error
              if (err.response?.status === 403 && err.response?.data?.limitExceeded) {
                setIsLimitError(true);
                setError(
                  `Welcome! Unfortunately, you've already used all ${err.response.data.limit} of your monthly caption generations. Your limit resets next month, or you can upgrade to Premium for unlimited captions!`
                );
                // Clear the guest captions since they can't be saved
                setGeneratedCaptions([]);
                setIsGuestGeneration(false);
              }
            }
          }
        }}
      />
    </div>
  );
}
