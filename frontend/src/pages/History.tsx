import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Sparkles, ChevronRight, Trash2, Star,
  Heart, Clock, Layers, Video, Image as ImageIcon, FileText, Camera
} from 'lucide-react';
import api from '../services/api';
import { CaptionAttempt, ContentType } from '../types';

const CONTENT_TYPE_ICONS: Record<ContentType, any> = {
  short_video: Video,
  long_video: FileText,
  image: ImageIcon,
  carousel: Layers,
  story: Camera,
  text_only: FileText,
};

export default function History() {
  const [attempts, setAttempts] = useState<CaptionAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<CaptionAttempt | null>(null);
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
            {Object.entries(groupedByPlatform).map(([platform, captions], index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  {platform.replace(/_/g, ' ').toUpperCase()} ({captions.length} variants)
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  {captions.map((caption) => (
                    <motion.div
                      key={caption.id}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                          Variant {caption.variantNumber}
                        </span>
                        {caption.analytics && (
                          <span className="text-xs font-bold text-green-600">
                            {caption.analytics.engagementScore.toFixed(0)}% Score
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-800 mb-3 line-clamp-3">
                        {caption.generatedCaption}
                      </p>

                      {caption.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {caption.hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs text-indigo-600">
                              {tag}
                            </span>
                          ))}
                          {caption.hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{caption.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {caption.storySlides && caption.storySlides.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-800">
                          📱 {caption.storySlides.length} Story Slides
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
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
