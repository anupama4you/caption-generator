import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, TrendingUp, Clock,
  Hash, MessageSquare, BarChart3, Zap, Instagram,
  Facebook, Youtube, Video, Image, FileText, Camera,
  LogOut, History as HistoryIcon, User, Loader2,
  Linkedin, Twitter, Pin, Ghost, Clapperboard, Layers
} from 'lucide-react';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { Caption, Platform, ContentType, UsageStats } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const PLATFORMS: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: Video, color: 'from-gray-900 to-gray-700' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube, color: 'from-red-600 to-red-400' },
  { value: 'youtube_long', label: 'YouTube Long', icon: Clapperboard, color: 'from-red-500 to-amber-500' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-400' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-sky-600 to-blue-400' },
  { value: 'x', label: 'X (Twitter)', icon: Twitter, color: 'from-gray-900 to-gray-700' },
  { value: 'pinterest', label: 'Pinterest', icon: Pin, color: 'from-red-600 to-orange-500' },
  { value: 'snapchat', label: 'Snapchat', icon: Ghost, color: 'from-yellow-400 to-amber-300' },
  { value: 'all', label: 'All Platforms', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
];

const CONTENT_TYPES: { value: ContentType; label: string; icon: any }[] = [
  { value: 'short_video', label: 'Short Video', icon: Video },
  { value: 'long_video', label: 'Long Video', icon: Clapperboard },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'carousel', label: 'Carousel', icon: Layers },
  { value: 'story', label: 'Story', icon: Camera },
  { value: 'text_only', label: 'Text Only', icon: FileText },
];

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
    'tiktok',
    'youtube_shorts',
    'facebook',
  ]);
  const [contentType, setContentType] = useState<ContentType>('short_video');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await api.get('/profile/usage');
      setUsage(response.data.data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const togglePlatform = (platform: Platform) => {
    if (platform === 'all') {
      setSelectedPlatforms(prev => (prev.includes('all') ? [] : ['all']));
      return;
    }

    setSelectedPlatforms(prev => {
      const withoutAll = prev.filter(p => p !== 'all');
      return withoutAll.includes(platform)
        ? withoutAll.filter(p => p !== platform)
        : [...withoutAll, platform];
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
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-7 h-7 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Caption Generator
              </h1>
            </motion.div>
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
                You've reached your monthly limit. Upgrade to Premium for unlimited captions!
              </motion.p>
            )}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100"
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
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.value);
                    return (
                      <motion.button
                        key={platform.value}
                        type="button"
                        onClick={() => togglePlatform(platform.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="selected"
                            className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1"
                          >
                            <Check className="w-3 h-3" />
                          </motion.div>
                        )}
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {platform.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Content Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = contentType === type.value;
                    return (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => setContentType(type.value)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {type.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
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

          {/* Generated Captions */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
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
              ) : generatedCaptions.length > 0 ? (
                <motion.div
                  key="captions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                      Generated Captions
                    </h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold">
                      {generatedCaptions.length} Platforms
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {generatedCaptions.map((caption, index) => {
                      const platformMeta = PLATFORMS.find(p => p.value === caption.platform);
                      return (
                        <motion.div
                          key={caption.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              {platformMeta?.icon && <span>{platformMeta.icon({ className: 'w-3 h-3' })}</span>}
                              {platformMeta?.label ?? caption.platform}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              Variant {caption.variantNumber}
                            </span>
                          </div>

                        <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{caption.generatedCaption}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {caption.hashtags.map((tag, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + idx * 0.05 }}
                              className="text-indigo-600 text-sm font-medium bg-indigo-50 px-2 py-1 rounded-lg"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>

                        <CopyToClipboard
                          text={`${caption.generatedCaption}\n\n${caption.hashtags.join(' ')}`}
                          onCopy={() => {
                            setCopiedId(caption.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                              copiedId === caption.id
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                            }`}
                          >
                            {copiedId === caption.id ? (
                              <>
                                <Check className="w-5 h-5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5" />
                                Copy Caption
                              </>
                            )}
                          </motion.button>
                        </CopyToClipboard>

                        {/* Analytics */}
                        {caption.analytics && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.3 }}
                            className="border-t-2 border-gray-100 pt-5 mt-5"
                          >
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-gray-900">
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                              Performance Analytics
                            </h4>

                            <div className="grid grid-cols-3 gap-3 mb-5">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl"
                              >
                                <div className="text-2xl font-bold text-indigo-600">
                                  {caption.analytics.engagementScore.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-700 font-medium mt-1">Engagement</div>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                              >
                                <div className="text-2xl font-bold text-purple-600">
                                  {caption.analytics.viralityScore.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-700 font-medium mt-1">Virality</div>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
                              >
                                <div className="text-sm font-bold text-green-600">
                                  {caption.analytics.reachEstimate}
                                </div>
                                <div className="text-xs text-gray-700 font-medium mt-1">Est. Reach</div>
                              </motion.div>
                            </div>

                            {/* Score Bars */}
                            <div className="space-y-3 mb-4">
                              {[
                                { label: 'Hashtags', score: caption.analytics.hashtagScore, icon: Hash },
                                { label: 'Length', score: caption.analytics.lengthScore, icon: MessageSquare },
                                { label: 'Keywords', score: caption.analytics.keywordScore, icon: Zap },
                              ].map((item, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                      <item.icon className="w-3 h-3" />
                                      {item.label}
                                    </span>
                                    <span className="font-bold text-indigo-600">{item.score.toFixed(0)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.score}%` }}
                                      transition={{ duration: 1, delay: idx * 0.1 }}
                                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Best Posting Times */}
                            <div className="bg-blue-50 p-4 rounded-xl mb-3">
                              <h5 className="font-semibold text-xs mb-2 flex items-center gap-1 text-blue-900">
                                <Clock className="w-3 h-3" />
                                Best Posting Times
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {caption.analytics.bestPostingTime.map((time, idx) => (
                                  <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                                  >
                                    {time}
                                  </motion.span>
                                ))}
                              </div>
                            </div>

                            {/* Improvement Tips */}
                            {caption.analytics.improvementTips.length > 0 && (
                              <div className="bg-amber-50 p-4 rounded-xl">
                                <h5 className="font-semibold text-xs mb-2 text-amber-900">💡 Pro Tips</h5>
                                <ul className="space-y-1.5 text-xs text-gray-700">
                                  {caption.analytics.improvementTips.map((tip, idx) => (
                                    <motion.li
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-amber-600 mt-0.5">•</span>
                                      <span>{tip}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col items-center justify-center min-h-[400px] text-center"
                >
                  <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Create?</h3>
                  <p className="text-gray-500">
                    Fill in the form and generate your first caption!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
