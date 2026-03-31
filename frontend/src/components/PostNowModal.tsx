import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle, Crown, ExternalLink } from 'lucide-react';
import api from '../services/api';

interface SocialConnection {
  id: string;
  platform: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  captionText: string;
  isPremium: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  pinterest: 'Pinterest',
  snapchat: 'Snapchat',
  reddit: 'Reddit',
  bluesky: 'Bluesky',
  threads: 'Threads',
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  tiktok: 'from-gray-900 to-gray-700',
  facebook: 'from-blue-600 to-blue-500',
  linkedin: 'from-sky-700 to-sky-500',
  youtube: 'from-red-600 to-red-400',
  twitter: 'from-gray-900 to-gray-700',
  pinterest: 'from-red-600 to-rose-500',
  snapchat: 'from-yellow-400 to-amber-300',
  reddit: 'from-orange-600 to-orange-400',
  bluesky: 'from-sky-500 to-blue-400',
  threads: 'from-gray-900 to-gray-700',
};

export default function PostNowModal({ open, onClose, captionText, isPremium }: Props) {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !isPremium) return;
    setFetching(true);
    api.get('/social/accounts')
      .then(r => setConnections(r.data.data.connections ?? []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open]);

  const toggle = (platform: string) => {
    setSelected(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const publish = async () => {
    if (!selected.length) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/social/publish', { content: captionText, platforms: selected });
      setPublished(true);
      setTimeout(() => { setPublished(false); setSelected([]); onClose(); }, 2000);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to publish. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setError(''); setSelected([]); setPublished(false); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-gray-900 text-sm">Post Now</span>
                </div>
                <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                {/* Premium gate */}
                {!isPremium ? (
                  <div className="text-center py-4">
                    <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">Premium Feature</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      One-click publishing to social platforms is available on Premium.
                    </p>
                    <Link
                      to="/pricing"
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Crown className="w-4 h-4" /> Upgrade to Premium
                    </Link>
                  </div>
                ) : published ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-900">Published!</p>
                  </div>
                ) : (
                  <>
                    {/* Caption preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 line-clamp-3 leading-relaxed border border-gray-100">
                      {captionText}
                    </div>

                    {/* Connected accounts */}
                    {fetching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      </div>
                    ) : connections.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-3">No social accounts connected yet.</p>
                        <Link
                          to="/profile"
                          onClick={handleClose}
                          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:underline"
                        >
                          Connect accounts in Profile <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Select platforms to post to
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {connections.map(conn => {
                            const isSelected = selected.includes(conn.platform);
                            const gradient = PLATFORM_COLORS[conn.platform] ?? 'from-gray-500 to-gray-400';
                            return (
                              <button
                                key={conn.platform}
                                onClick={() => toggle(conn.platform)}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0`} />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    {PLATFORM_LABELS[conn.platform] ?? conn.platform}
                                  </p>
                                  {conn.displayName && (
                                    <p className="text-xs text-gray-400 truncate">{conn.displayName}</p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                    {connections.length > 0 && (
                      <button
                        onClick={publish}
                        disabled={!selected.length || loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</>
                          : <><Send className="w-4 h-4" />Post to {selected.length || ''} {selected.length === 1 ? 'platform' : 'platforms'}</>
                        }
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
