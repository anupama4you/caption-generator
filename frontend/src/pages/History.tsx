import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Sparkles, ChevronRight, Trash2, Star,
  Heart, Clock, Layers, Video, Image as ImageIcon, FileText, Camera,
  Copy, Check, TrendingUp, Hash, MessageSquare, Zap,
  Instagram, Facebook, Youtube, Linkedin, Twitter, Ghost, Clapperboard,
  ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../services/api';
import { CaptionAttempt, ContentType, Platform } from '../types';

const CONTENT_TYPE_ICONS: Record<ContentType, any> = {
  short_video: Video,
  long_video: FileText,
  image: ImageIcon,
  carousel: Layers,
  story: Camera,
  text_only: FileText,
};

const PLATFORMS: { value: Platform; label: string; icon: any; color: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: Video, color: 'from-gray-900 to-gray-700' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: Youtube, color: 'from-red-600 to-red-400' },
  { value: 'youtube_long', label: 'YouTube Long', icon: Clapperboard, color: 'from-red-500 to-amber-500' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-400' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-sky-600 to-blue-400' },
  { value: 'x', label: 'X (Twitter)', icon: Twitter, color: 'from-gray-900 to-gray-700' },
  { value: 'pinterest', label: 'Pinterest', icon: Sparkles, color: 'from-red-600 to-red-400' },
  { value: 'snapchat', label: 'Snapchat', icon: Ghost, color: 'from-yellow-400 to-amber-300' },
  { value: 'all', label: 'All Platforms', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
];

export default function History() {
  const [attempts, setAttempts] = useState<CaptionAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<CaptionAttempt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAnalytics, setExpandedAnalytics] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await api.get('/captions/attempts');
      setAttempts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attempt and all its captions?')) {
      try {
        await api.delete(`/captions/attempts/${id}`);
        setAttempts(attempts.filter((a) => a.id !== id));
        if (selectedAttempt?.id === id) {
          setSelectedAttempt(null);
        }
      } catch (err) {
        console.error('Failed to delete attempt:', err);
      }
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      await api.put(`/captions/attempts/${id}/favorite`);
      setAttempts(
        attempts.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a))
      );
      if (selectedAttempt?.id === id) {
        setSelectedAttempt({ ...selectedAttempt, isFavorite: !selectedAttempt.isFavorite });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const viewDetails = async (attemptId: string) => {
    try {
      const response = await api.get(`/captions/attempts/${attemptId}`);
      setSelectedAttempt(response.data.data);
    } catch (err) {
      console.error('Failed to fetch attempt details:', err);
    }
  };

  if (selectedAttempt) {
    // Detail view
    const groupedByPlatform = selectedAttempt.captions.reduce((acc, caption) => {
      if (!acc[caption.platform]) {
        acc[caption.platform] = [];
      }
      acc[caption.platform].push(caption);
      return acc;
    }, {} as Record<string, typeof selectedAttempt.captions>);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedAttempt(null)}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to History</span>
              </button>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 py-8">
          {/* Attempt Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = CONTENT_TYPE_ICONS[selectedAttempt.contentFormat];
                  return <Icon className="w-8 h-8 text-indigo-600" />;
                })()}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedAttempt.contentFormat.replace(/_/g, ' ').toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedAttempt.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(selectedAttempt.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedAttempt.isFavorite
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-gray-100 text-gray-400 hover:text-pink-600'
                }`}
              >
                <Heart className="w-6 h-6" fill={selectedAttempt.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Content Description:</p>
              <p className="text-gray-900">{selectedAttempt.contentDescription}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {Object.keys(groupedByPlatform).length} Platforms
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {selectedAttempt.captions.length} Variants Total
              </span>
            </div>
          </motion.div>

          {/* Platforms Grid */}
          <div className="space-y-6">
            {Object.entries(groupedByPlatform).map(([platform, captions], index) => {
              const platformMeta = PLATFORMS.find(p => p.value === platform);
              const PlatformIcon = platformMeta?.icon;

              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  {/* Platform Header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    {PlatformIcon && <PlatformIcon className="w-6 h-6 text-indigo-600" />}
                    <h4 className="text-lg font-bold text-gray-900">{platformMeta?.label ?? platform}</h4>
                    <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {captions.length} Variants
                    </span>
                  </div>

                  {/* Caption Variants Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {captions.map((caption) => (
                      <motion.div
                        key={caption.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50"
                      >
                        {/* Variant Number and Engagement Score */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold text-gray-500">
                            Variant {caption.variantNumber}
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
                        <p className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed text-sm">
                          {caption.generatedCaption}
                        </p>

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

                        {/* Story Slides */}
                        {caption.storySlides && caption.storySlides.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-800 mb-4">
                            📱 {caption.storySlides.length} Story Slides
                          </div>
                        )}

                        {/* Copy Button */}
                        <CopyToClipboard
                          text={`${caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`}
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
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Generation History
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-16 h-16 text-indigo-600 mx-auto" />
            </motion.div>
            <p className="mt-4 text-gray-600 font-medium">Loading your history...</p>
          </div>
        ) : attempts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Yet</h3>
            <p className="text-gray-500 mb-6">Generate your first captions to see them here!</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Generate Captions
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {attempts.map((attempt, index) => {
                const Icon = CONTENT_TYPE_ICONS[attempt.contentFormat];
                const platformCount = new Set(attempt.captions?.map(c => c.platform) || []).size;

                return (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer"
                    onClick={() => viewDetails(attempt.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {attempt.contentFormat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(attempt.id);
                        }}
                        className="p-1"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            attempt.isFavorite ? 'text-pink-500' : 'text-gray-300'
                          }`}
                          fill={attempt.isFavorite ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {attempt.contentDescription}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                          {platformCount} Platforms
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                          {attempt.captions?.length || 0} Variants
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(attempt.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
