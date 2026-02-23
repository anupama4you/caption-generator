import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Sparkles, ChevronRight, Trash2,
  Heart, Clock, Video, Layers,
  Copy, Check, TrendingUp, Hash, MessageSquare, Zap,
  Instagram, Facebook, Youtube, Linkedin, Twitter, Ghost, Clapperboard,
  ChevronDown, ChevronUp, BarChart3, ChevronLeft, Search, X as XIcon
} from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import api from '../services/api';
import { CaptionAttempt, ContentType, Platform } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import facebookLogo from '../assets/images/facebook.png';
import instagramLogo from '../assets/images/instagram.png';
import tiktokLogo from '../assets/images/tiktok.png';
import youtubeLogo from '../assets/images/youtube.png';
import snapchatLogo from '../assets/images/snapchat.png';
import linkedinLogo from '../assets/images/linkedin.png';
import twitterLogo from '../assets/images/twitter.png';

const contentArt = (type: ContentType) => {
  const baseClass = 'w-14 h-14 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5';
  switch (type) {
    case 'short_video':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="sv-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect x="8" y="10" width="48" height="44" rx="10" fill="url(#sv-hist)" />
          <path d="M26 24l12 8-12 8v-16z" fill="#fff" />
        </svg>
      );
    case 'long_video':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="lv-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect x="8" y="10" width="48" height="44" rx="10" fill="url(#lv-hist)" />
          <path d="M20 22h24" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
          <path d="M20 30h18" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M20 38h14" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M36 28l10 7-10 7v-14z" fill="#fff" />
        </svg>
      );
    case 'image':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="img-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <rect x="10" y="12" width="44" height="40" rx="8" fill="url(#img-hist)" />
          <circle cx="24" cy="26" r="5" fill="#fff" opacity="0.9" />
          <path d="M18 44l10-12 8 8 8-10 8 14H18z" fill="#fff" opacity="0.9" />
        </svg>
      );
    case 'carousel':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="car-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect x="6" y="12" width="30" height="40" rx="8" fill="url(#car-hist)" />
          <rect x="24" y="12" width="34" height="40" rx="8" fill="url(#car-hist)" opacity="0.65" />
          <rect x="16" y="22" width="32" height="20" rx="6" fill="#fff" opacity="0.9" />
        </svg>
      );
    case 'story':
      return (
        <svg className={baseClass} viewBox="0 0 64 64">
          <defs>
            <linearGradient id="sty-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <rect x="16" y="8" width="32" height="48" rx="10" fill="url(#sty-hist)" />
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
            <linearGradient id="txt-hist" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect x="12" y="12" width="40" height="40" rx="8" fill="url(#txt-hist)" />
          <rect x="20" y="24" width="24" height="4" rx="2" fill="#fff" opacity="0.9" />
          <rect x="20" y="32" width="18" height="4" rx="2" fill="#fff" opacity="0.8" />
          <rect x="20" y="40" width="14" height="4" rx="2" fill="#fff" opacity="0.7" />
        </svg>
      );
  }
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

const FILTER_PLATFORMS = [
  { value: 'all', label: 'All' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube_shorts', label: 'YT Shorts' },
  { value: 'youtube_long', label: 'YT Long' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'snapchat', label: 'Snapchat' },
];

export default function History() {
  const [attempts, setAttempts] = useState<CaptionAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<CaptionAttempt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAnalytics, setExpandedAnalytics] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  // Platform logo tiles
  const platformArt = (platform: Platform) => {
    const baseClass =
      'w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden';

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
          <img src={imgSrc} alt={platform} className="w-10 h-10 object-contain" />
        </div>
      );
    }

    const FallbackIcon = platform === 'pinterest' ? Layers : Sparkles;
    return (
      <div className={`${baseClass} bg-gradient-to-br from-indigo-600 to-purple-600`}>
        <FallbackIcon className="w-8 h-8 text-white" />
      </div>
    );
  };

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

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = searchTerm.trim() === '' ||
      attempt.contentDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' ||
      attempt.captions?.some(c => c.platform === filterPlatform);
    return matchesSearch && matchesPlatform;
  });

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
              <Link to="/" className="text-gray-700 hover:text-indigo-600">
                Home
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          {/* Attempt Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  return contentArt(selectedAttempt.contentFormat);
                })()}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAttempt.contentFormat.replace(/_/g, ' ').toUpperCase()}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
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

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Content Description:</p>
              <p className="text-sm text-gray-900">{selectedAttempt.contentDescription}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {Object.keys(groupedByPlatform).length} Platforms
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {selectedAttempt.captions.length} Captions Total
              </span>
            </div>
          </motion.div>

          {/* Platforms Grid */}
          <div className="space-y-4">
            {Object.entries(groupedByPlatform).map(([platform, captions], index) => {
              const platformMeta = PLATFORMS.find(p => p.value === platform);

              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
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
                          <div key={`mobile-${caption.id}`} className="w-full flex-shrink-0 px-1">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50"
                            >
                              {/* Same caption card content */}
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

                              {/* Story Slides */}
                              {caption.storySlides && caption.storySlides.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-800 mb-4">
                                  📱 {caption.storySlides.length} Story Slides
                                </div>
                              )}

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
                                        {/* Analytics content - same as desktop */}
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

                        {/* Story Slides */}
                        {caption.storySlides && caption.storySlides.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-800 mb-4">
                            📱 {caption.storySlides.length} Story Slides
                          </div>
                        )}

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
            })}
          </div>
        </main>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Generation History</h1>
        </div>

        {/* Search + Filter Bar */}
        {!loading && attempts.length > 0 && (
          <div className="mb-6 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by description or keyword..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Platform Filter */}
            <div className="flex flex-wrap gap-2">
              {FILTER_PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFilterPlatform(p.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filterPlatform === p.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {filteredAttempts.length !== attempts.length && (
              <p className="text-xs text-gray-500">{filteredAttempts.length} of {attempts.length} results</p>
            )}
          </div>
        )}

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
            className="bg-white rounded-xl shadow-lg p-10 text-center"
          >
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Yet</h3>
            <p className="text-gray-500 mb-6">Generate your first captions to see them here!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Generate Captions
            </Link>
          </motion.div>
        ) : filteredAttempts.length === 0 && attempts.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No results found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term or platform filter</p>
            <button onClick={() => { setSearchTerm(''); setFilterPlatform('all'); }} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAttempts.map((attempt, index) => {
                const platformCount = new Set(attempt.captions?.map(c => c.platform) || []).size;

                return (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer"
                    onClick={() => viewDetails(attempt.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">{contentArt(attempt.contentFormat)}</div>
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
                          {attempt.captions?.length || 0} Captions
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
      <Footer />
    </div>
  );
}
