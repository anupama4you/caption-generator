import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Search, Copy, Check, TrendingUp, Lock, Crown, Loader2, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { RootState } from '../store/store';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HashtagResult {
  id: string;
  hashtag: string;
  trendScore: number;
  reach: string;
  category: string;
  lastUpdated: string;
}

interface ApiResult {
  hashtags: HashtagResult[];
  totalAvailable: number;
  isPremium: boolean;
  hasMore: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'youtube_long', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'pinterest', label: 'Pinterest' },
];

const NICHE_SUGGESTIONS = [
  'fitness', 'food', 'travel', 'fashion', 'beauty', 'tech',
  'business', 'photography', 'music', 'gaming', 'lifestyle', 'education',
];

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-gray-400';
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-400';
  return 'bg-gray-300';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HashtagResearch() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isPremium = user?.subscriptionTier === 'PREMIUM';

  const [platform, setPlatform] = useState('instagram');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const search = async () => {
    if (!niche.trim()) { setError('Enter a niche or topic first.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get('/hashtags/trending', {
        params: { platform, niche: niche.trim() },
      });
      setResult(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to fetch hashtags. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyOne = (hashtag: string, id: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.hashtags.map(h => h.hashtag).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Hashtag Research — Captions4You</title>
        <meta name="description" content="Find trending hashtags for Instagram, TikTok, YouTube and more. AI-powered hashtag intelligence for premium users." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Hash className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Hashtag Research</h1>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 ml-10.5">
            Find AI-powered trending hashtags for your niche and platform.
            {!isPremium && <span className="text-amber-600 font-medium"> Free users see 5 results — upgrade for 20.</span>}
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Platform */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Niche */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Niche / Topic</label>
              <input
                type="text"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. fitness, food, travel…"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Niche quick picks */}
          <div className="flex flex-wrap gap-2 mb-4">
            {NICHE_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => setNiche(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  niche === s
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          <button
            onClick={search}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Finding hashtags…' : 'Find Trending Hashtags'}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

              {/* Results header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{result.hashtags.length}</span>
                  {result.hasMore && <> of {result.totalAvailable}</>} hashtags
                  {' '}for <span className="font-semibold text-gray-900">#{niche}</span> on{' '}
                  <span className="font-semibold text-gray-900">{PLATFORMS.find(p => p.value === platform)?.label}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={search}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAll ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
              </div>

              {/* Hashtag grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {result.hashtags.map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3 hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{h.hashtag}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {/* Trend score bar */}
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${scoreBarColor(h.trendScore)}`}
                              style={{ width: `${h.trendScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold tabular-nums ${scoreColor(h.trendScore)}`}>
                            {h.trendScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <TrendingUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{h.reach} reach</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{h.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyOne(h.hashtag, h.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    >
                      {copiedId === h.id
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <Copy className="w-4 h-4" />
                      }
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Premium upsell if locked */}
              {result.hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 text-center"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {result.totalAvailable - 5} more hashtags unlocked with Premium
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Get all {result.totalAvailable} trending hashtags plus unlimited caption generations.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center py-14 text-gray-400">
            <Hash className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Pick a platform, enter your niche, and hit search.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
