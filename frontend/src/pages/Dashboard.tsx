import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, TrendingUp, Clock,
  Hash, MessageSquare, BarChart3, Zap, Instagram,
  Facebook, Youtube, Video, Image, FileText, Camera,
  LogOut, History as HistoryIcon, User, Loader2,
  Linkedin, Twitter, Ghost, Clapperboard, Layers, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { Caption, Platform, ContentType, UsageStats } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

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

const contentArt = (type: ContentType) => {
  const baseClass = 'w-20 h-20 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5';
  switch (type) {
    case 'short_video':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="sv" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="52" height="44" rx="10" fill="url(#sv)" />
          <rect x="14" y="18" width="36" height="28" rx="6" fill="#fff" opacity="0.16" />
          <path d="M30 24l12 8-12 8v-16z" fill="#fff" />
        </svg>
      );
    case 'long_video':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="lv" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="52" height="44" rx="10" fill="url(#lv)" />
          <rect x="12" y="18" width="40" height="6" rx="3" fill="#fff" opacity="0.4" />
          <rect x="12" y="28" width="30" height="4" rx="2" fill="#fff" opacity="0.5" />
          <rect x="12" y="36" width="22" height="4" rx="2" fill="#fff" opacity="0.5" />
          <path d="M38 30l10 7-10 7v-14z" fill="#fff" />
        </svg>
      );
    case 'image':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="img" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <rect x="8" y="12" width="48" height="40" rx="8" fill="url(#img)" />
          <circle cx="22" cy="26" r="5" fill="#fff" opacity="0.8" />
          <path d="M16 44l10-12 8 8 8-10 10 14H16z" fill="#fff" opacity="0.9" />
        </svg>
      );
    case 'carousel':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="car" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect x="6" y="12" width="32" height="40" rx="8" fill="url(#car)" />
          <rect x="26" y="12" width="32" height="40" rx="8" fill="url(#car)" opacity="0.65" />
          <rect x="16" y="20" width="32" height="24" rx="6" fill="#fff" opacity="0.85" />
          <path d="M22 38l6-8 6 6 4-6 6 8H22z" fill="#8B5CF6" opacity="0.9" />
        </svg>
      );
    case 'story':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="sty" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <rect x="14" y="8" width="36" height="48" rx="10" fill="url(#sty)" />
          <rect x="20" y="16" width="24" height="12" rx="4" fill="#fff" opacity="0.25" />
          <rect x="20" y="32" width="24" height="4" rx="2" fill="#fff" opacity="0.5" />
          <rect x="20" y="40" width="16" height="4" rx="2" fill="#fff" opacity="0.5" />
        </svg>
      );
    case 'text_only':
    default:
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="txt" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="44" height="44" rx="8" fill="url(#txt)" />
          <rect x="18" y="22" width="28" height="4" rx="2" fill="#fff" opacity="0.9" />
          <rect x="18" y="30" width="22" height="4" rx="2" fill="#fff" opacity="0.8" />
          <rect x="18" y="38" width="18" height="4" rx="2" fill="#fff" opacity="0.7" />
        </svg>
      );
  }
};

const platformArt = (platform: Platform) => {
  const baseClass =
    'w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5';

  const platformMap: Record<
    Platform,
    { url: string; bgColor?: string; fgColor?: string }
  > = {
    instagram: { url: 'https://www.instagram.com' },
    tiktok: { url: 'https://www.tiktok.com', bgColor: '#000', fgColor: '#fff' },
    youtube_shorts: { url: 'https://www.youtube.com', bgColor: '#ff0000', fgColor: '#fff' },
    youtube_long: { url: 'https://www.youtube.com', bgColor: '#ff0000', fgColor: '#fff' },
    facebook: { url: 'https://www.facebook.com', bgColor: '#1877f2', fgColor: '#fff' },
    linkedin: { url: 'https://www.linkedin.com', bgColor: '#0a66c2', fgColor: '#fff' },
    x: { url: 'https://twitter.com', bgColor: '#0f172a', fgColor: '#fff' },
    pinterest: { url: 'https://www.pinterest.com', bgColor: '#e60023', fgColor: '#fff' },
    snapchat: { url: 'https://www.snapchat.com', bgColor: '#fffc00', fgColor: '#000' },
    all: { url: 'https://www.google.com', bgColor: '#4f46e5', fgColor: '#fff' },
  };

  const iconProps = platformMap[platform] || platformMap.all;

  return (
    <div className={baseClass}>
      <SocialIcon
        url={iconProps.url}
        bgColor={iconProps.bgColor}
        fgColor={iconProps.fgColor}
        style={{ height: 48, width: 48 }}
        target="_blank"
        rel="noreferrer"
      />
    </div>
  );
};

// Maximum platforms allowed for free users
const MAX_FREE_PLATFORMS = 4;

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'facebook',
    'instagram',
    'tiktok',
    'youtube_shorts',
  ]);
  const [contentType, setContentType] = useState<ContentType>('short_video');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAnalytics, setExpandedAnalytics] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState<Record<string, number>>({});

  // Get available platforms based on content type
  const getAvailablePlatforms = () => {
    return PLATFORMS.filter(p => p.supportedContentTypes.includes(contentType));
  };

  // Check if user is on free tier
  const isFreeUser = user?.subscriptionTier === 'FREE';

  useEffect(() => {
    fetchUsage();
  }, []);

  // Update selected platforms when content type changes
  useEffect(() => {
    const availablePlatforms = getAvailablePlatforms();
    const availablePlatformValues = availablePlatforms.map(p => p.value);

    // Filter out platforms that don't support the new content type
    setSelectedPlatforms(prev => {
      const filtered = prev.filter(p => availablePlatformValues.includes(p));

      // If we have fewer than the max allowed platforms after filtering, add more
      if (filtered.length < (isFreeUser ? MAX_FREE_PLATFORMS : availablePlatformValues.length)) {
        // Add platforms that aren't already selected
        const toAdd = availablePlatformValues.filter(p => !filtered.includes(p));
        const combined = [...filtered, ...toAdd];
        return combined.slice(0, isFreeUser ? MAX_FREE_PLATFORMS : combined.length);
      }

      return filtered;
    });
  }, [contentType]);

  const fetchUsage = async () => {
    try {
      const response = await api.get('/profile/usage');
      setUsage(response.data.data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      // If platform is already selected, remove it
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      }

      // Check if free user is at limit
      if (isFreeUser && prev.length >= MAX_FREE_PLATFORMS) {
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
      await fetchUsage();
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const progressPercentage = usage
    ? (usage.captionsGenerated / usage.monthlyLimit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
              >
                <Sparkles className="w-7 h-7 text-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  captions for you
                </h1>
              </motion.div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/history">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <HistoryIcon className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/profile">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">Generate engaging captions optimized for every platform</p>
        </motion.div>

        {/* Usage Stats */}
        {usage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
                <div className="text-2xl font-bold text-indigo-600">
                  {usage.captionsGenerated} / {usage.monthlyLimit}
                </div>
              </div>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  user?.subscriptionTier === 'FREE'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
              >
                {user?.subscriptionTier === 'FREE' ? '🆓 Free Tier' : '⭐ Premium'}
              </motion.span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
              />
            </div>
            {usage.captionsGenerated >= usage.monthlyLimit && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 mt-3 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                You've reached your monthly limit.{' '}
                <Link to="/pricing" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                  Upgrade to Premium
                </Link>{' '}
                for more captions!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Premium Upgrade Banner - Show only for free users */}
        {user?.subscriptionTier === 'FREE' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white overflow-hidden relative"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-8 h-8" />
                    <h3 className="text-2xl sm:text-3xl font-bold">Upgrade to Premium</h3>
                  </div>
                  <p className="text-indigo-100 mb-6 text-lg">
                    Unlock unlimited caption generation and advanced features
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">100 Generations/Month</h4>
                        <p className="text-indigo-100 text-sm">10x more than free plan</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Unlimited Platforms</h4>
                        <p className="text-indigo-100 text-sm">Generate for all platforms at once</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Advanced Analytics</h4>
                        <p className="text-indigo-100 text-sm">Deeper insights & predictions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Priority Support</h4>
                        <p className="text-indigo-100 text-sm">Get help when you need it</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    to="/pricing"
                    className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <span>Upgrade Now</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-normal mt-1 text-indigo-500">
                      Just $9.99/month
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conditional Layout: Show form OR results */}
        {generatedCaptions.length === 0 ? (
          /* Generation Form - Two column layout */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Generation Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Generate Caption</h3>
              </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Content Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CONTENT_TYPES.map((type) => {
                    const isSelected = contentType === type.value;
                    return (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => setContentType(type.value)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`aspect-square w-full rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        {contentArt(type.value)}
                        <span className={`text-base font-semibold text-center leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Platforms
                  {isFreeUser && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({selectedPlatforms.length}/{MAX_FREE_PLATFORMS} selected)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {getAvailablePlatforms().map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.value);
                    const isDisabled = isFreeUser && !isSelected && selectedPlatforms.length >= MAX_FREE_PLATFORMS;
                    const art = platformArt(platform.value);

                    return (
                      <motion.button
                        key={platform.value}
                        type="button"
                        onClick={() => togglePlatform(platform.value)}
                        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                        disabled={isDisabled}
                        className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-3">
                          {art}
                          <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                            {platform.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {isFreeUser && selectedPlatforms.length >= MAX_FREE_PLATFORMS && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Upgrade to Premium for unlimited platform selection
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={5}
                  required
                />
              </div>

              {/* Generate Button */}
              <motion.button
                type="submit"
                disabled={loading || !description.trim() || selectedPlatforms.length === 0}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Captions
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Right: Benefits/Why This App Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Why This App Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Zap className="w-6 h-6" />
                  </motion.div>
                  <h4 className="text-xl font-bold">Why Choose Us?</h4>
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-indigo-100 text-sm mb-6"
                >
                  Create engaging, platform-optimized captions in seconds with AI-powered analytics
                </motion.p>

                <div className="space-y-4">
                  {[
                    {
                      icon: Sparkles,
                      title: "AI-Powered Generation",
                      desc: "Get 3 unique captions per platform, tailored to each platform's best practices",
                      delay: 0.8
                    },
                    {
                      icon: TrendingUp,
                      title: "Smart Analytics",
                      desc: "See engagement scores, virality predictions, and best posting times instantly",
                      delay: 0.9
                    },
                    {
                      icon: BarChart3,
                      title: "Multi-Platform Support",
                      desc: "Generate captions for Instagram, TikTok, YouTube, LinkedIn, and more - all at once",
                      delay: 1.0
                    },
                    {
                      icon: Clock,
                      title: "Save Hours of Time",
                      desc: "Stop struggling with writer's block. Get professional captions in under 30 seconds",
                      delay: 1.1
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item.delay, duration: 0.4 }}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                      className="flex items-start gap-3"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mt-0.5"
                      >
                        <item.icon className="w-4 h-4" />
                      </motion.div>
                      <div>
                        <h5 className="font-semibold mb-1">{item.title}</h5>
                        <p className="text-sm text-indigo-100">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Tips Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-2 mb-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </motion.div>
                <h4 className="font-bold text-gray-900">Pro Tips</h4>
              </motion.div>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "Be specific in your content description for better results",
                  "Select multiple platforms to save time on cross-posting",
                  "Use the analytics to pick the best-performing caption",
                  "Copy captions with one click and paste directly to your posts"
                ].map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    className="flex items-start gap-2 cursor-default"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 + 0.1, type: "spring" }}
                      className="text-indigo-600 mt-0.5 font-bold"
                    >
                      ✓
                    </motion.span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
        ) : loading ? (
          /* Loading State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col items-center justify-center min-h-[400px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-indigo-600" />
            </motion.div>
            <p className="mt-4 text-gray-600 font-medium">Creating amazing captions...</p>
          </motion.div>
        ) : (
          /* Results View - Full Width */
          <div>
            {/* Header with Generate Another Button */}
            <div className="flex justify-between items-center mb-6">
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
            <div className="space-y-6">
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

                                  {/* Caption Content - Reused from desktop */}
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
    </div>
  );
}
