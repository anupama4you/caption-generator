import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, Settings, User as UserIcon, Zap, Hash, Crown, Loader2, X, AlertTriangle } from 'lucide-react';
import { RootState } from '../store/store';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [niche, setNiche] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [emojiPreference, setEmojiPreference] = useState(true);
  const [defaultHashtags, setDefaultHashtags] = useState('');

  // New fields
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [ctaStyle, setCtaStyle] = useState('moderate');
  const [avoidClickbait, setAvoidClickbait] = useState(false);
  const [formalityLevel, setFormalityLevel] = useState('balanced');

  // Track original values for comparison
  const [originalValues, setOriginalValues] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Detect changes in form values
  useEffect(() => {
    if (originalValues) {
      const currentValues = {
        niche,
        brandVoice,
        targetAudience,
        emojiPreference,
        defaultHashtags,
        toneOfVoice,
        includeQuestions,
        ctaStyle,
        avoidClickbait,
        formalityLevel,
      };

      const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
      setHasUnsavedChanges(hasChanges);
    }
  }, [niche, brandVoice, targetAudience, emojiPreference, defaultHashtags, toneOfVoice, includeQuestions, ctaStyle, avoidClickbait, formalityLevel, originalValues]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept navigation clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.href.includes('#')) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          e.preventDefault();
          setNextLocation(href);
          setShowNavigationWarning(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data.data;
      if (data) {
        const values = {
          niche: data.niche || '',
          brandVoice: data.brandVoice || '',
          targetAudience: data.targetAudience || '',
          emojiPreference: data.emojiPreference ?? true,
          defaultHashtags: data.defaultHashtags || '',
          toneOfVoice: data.toneOfVoice || '',
          includeQuestions: data.includeQuestions ?? true,
          ctaStyle: data.ctaStyle || 'moderate',
          avoidClickbait: data.avoidClickbait || false,
          formalityLevel: data.formalityLevel || 'balanced',
        };

        setNiche(values.niche);
        setBrandVoice(values.brandVoice);
        setTargetAudience(values.targetAudience);
        setEmojiPreference(values.emojiPreference);
        setDefaultHashtags(values.defaultHashtags);
        setToneOfVoice(values.toneOfVoice);
        setIncludeQuestions(values.includeQuestions);
        setCtaStyle(values.ctaStyle);
        setAvoidClickbait(values.avoidClickbait);
        setFormalityLevel(values.formalityLevel);

        // Store original values
        setOriginalValues(values);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);

    try {
      await api.post('/subscription/cancel');
      alert('Subscription cancelled successfully! Your plan has been downgraded to Free. Please refresh the page.');
      setShowCancelConfirm(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      alert(err.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.put('/profile', {
        niche,
        brandVoice,
        targetAudience,
        emojiPreference,
        defaultHashtags,
        toneOfVoice,
        includeQuestions,
        ctaStyle,
        avoidClickbait,
        formalityLevel,
      });
      setSuccess(true);
      await fetchProfile(); // This will reset originalValues and hasUnsavedChanges
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    if (nextLocation) {
      setShowNavigationWarning(false);
      setHasUnsavedChanges(false);
      navigate(nextLocation);
    }
  };

  const handleCancelNavigation = () => {
    setShowNavigationWarning(false);
    setNextLocation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            </div>
            <p className="text-sm text-gray-600">Customize how AI generates captions for your content</p>
          </motion.div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              <span className="font-semibold">Profile updated successfully!</span>
            </motion.div>
          )}

          {/* Subscription Card - Compact Inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`rounded-xl shadow-lg p-4 border mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
              user?.subscriptionTier === 'PREMIUM'
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {user?.subscriptionTier === 'PREMIUM' ? (
                <Crown className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              ) : (
                <Zap className="w-5 h-5 text-gray-600 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {user?.subscriptionTier === 'PREMIUM' ? 'Premium Plan' : 'Free Plan'}
                </h3>
                <p className="text-xs text-gray-600">
                  {user?.subscriptionTier === 'PREMIUM'
                    ? '100 caption generations per month • Unlimited platforms'
                    : '10 caption generations per month • Up to 4 platforms'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.subscriptionTier === 'FREE' && (
                <Link
                  to="/pricing"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                  <Sparkles className="w-3 h-3" />
                </Link>
              )}
              {user?.subscriptionTier === 'PREMIUM' && (
                <>
                  <Link
                    to="/pricing"
                    className="px-3 py-2 text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all text-sm"
                  >
                    View Plans
                  </Link>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCancelConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Premium?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel your Premium subscription? You'll be downgraded to the Free plan:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">✗</span>
                    Monthly limit reduced to 10 generations
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">✗</span>
                    Platform selection limited to 4
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-red-500">✗</span>
                    No priority support
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Keep Premium
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Niche/Industry
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., fitness, food, travel, fashion"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Helps tailor captions to your specific industry
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Brand Voice
                  </label>
                  <select
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="">Select brand voice</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humorous</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., millennials, fitness enthusiasts, young professionals"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            </motion.div>

            {/* Caption Style Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Caption Style Controls
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tone of Voice
                  </label>
                  <select
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="">Auto (based on platform)</option>
                    <option value="friendly">Friendly & Warm</option>
                    <option value="authoritative">Authoritative & Expert</option>
                    <option value="playful">Playful & Fun</option>
                    <option value="informative">Informative & Clear</option>
                    <option value="conversational">Conversational</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    How the caption should sound to your audience
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Formality Level
                  </label>
                  <select
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="formal">Formal & Professional</option>
                    <option value="balanced">Balanced Mix</option>
                    <option value="casual">Casual & Friendly</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Language formality and structure
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Call-to-Action Style
                  </label>
                  <select
                    value={ctaStyle}
                    onChange={(e) => setCtaStyle(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="strong">Strong & Direct</option>
                    <option value="moderate">Moderate & Friendly</option>
                    <option value="none">No CTAs</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    How aggressive CTAs should be
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQuestions}
                    onChange={(e) => setIncludeQuestions(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include Questions</span>
                    <p className="text-xs text-gray-500">Ask engaging questions to boost interaction</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emojiPreference}
                    onChange={(e) => setEmojiPreference(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Use Emojis</span>
                    <p className="text-xs text-gray-500">Include emojis when appropriate</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avoidClickbait}
                    onChange={(e) => setAvoidClickbait(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Avoid Clickbait</span>
                    <p className="text-xs text-gray-500">No sensational or exaggerated language</p>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Default Hashtags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-600" />
                Default Hashtags
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Default Hashtags
                </label>
                <textarea
                  value={defaultHashtags}
                  onChange={(e) => setDefaultHashtags(e.target.value)}
                  placeholder="e.g., #YourBrand #YourNiche #YourCatchphrase"
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Enter hashtags separated by spaces. These will always be included in your generated captions.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Example: #MyBrand #Marketing #ContentCreator
                </p>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile Settings
                </>
              )}
            </motion.button>
          </form>
        </div>
      </main>

      {/* Unsaved Changes Warning Modal */}
      <AnimatePresence>
        {showNavigationWarning && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelNavigation}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <h3 className="text-xl font-bold text-gray-900">Unsaved Changes</h3>
                  </div>
                  <button
                    onClick={handleCancelNavigation}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-6">
                  You have unsaved changes to your profile settings. If you leave this page, your changes will be lost.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelNavigation}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Stay on Page
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDiscardChanges}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Discard Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
