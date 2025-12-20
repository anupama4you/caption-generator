import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Save, Settings, User as UserIcon, Zap, Hash } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data.data;
      if (data) {
        setNiche(data.niche || '');
        setBrandVoice(data.brandVoice || '');
        setTargetAudience(data.targetAudience || '');
        setEmojiPreference(data.emojiPreference ?? true);
        setDefaultHashtags(data.defaultHashtags || '');
        setToneOfVoice(data.toneOfVoice || '');
        setIncludeQuestions(data.includeQuestions ?? true);
        setCtaStyle(data.ctaStyle || 'moderate');
        setAvoidClickbait(data.avoidClickbait || false);
        setFormalityLevel(data.formalityLevel || 'balanced');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
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
      await fetchProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Caption Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
            </div>
            <p className="text-gray-600">Customize how AI generates captions for your content</p>
          </motion.div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Profile updated successfully!</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Niche/Industry
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., fitness, food, travel, fashion"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Helps tailor captions to your specific industry
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand Voice
                  </label>
                  <select
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., millennials, fitness enthusiasts, young professionals"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* Caption Style Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Caption Style Controls
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tone of Voice
                  </label>
                  <select
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Auto (based on platform)</option>
                    <option value="friendly">Friendly & Warm</option>
                    <option value="authoritative">Authoritative & Expert</option>
                    <option value="playful">Playful & Fun</option>
                    <option value="informative">Informative & Clear</option>
                    <option value="conversational">Conversational</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    How the caption should sound to your audience
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Formality Level
                  </label>
                  <select
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="formal">Formal & Professional</option>
                    <option value="balanced">Balanced Mix</option>
                    <option value="casual">Casual & Friendly</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Language formality and structure
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Call-to-Action Style
                  </label>
                  <select
                    value={ctaStyle}
                    onChange={(e) => setCtaStyle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="strong">Strong & Direct</option>
                    <option value="moderate">Moderate & Friendly</option>
                    <option value="none">No CTAs</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    How aggressive CTAs should be
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
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
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-600" />
                Default Hashtags
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Default Hashtags
                </label>
                <textarea
                  value={defaultHashtags}
                  onChange={(e) => setDefaultHashtags(e.target.value)}
                  placeholder="e.g., #YourBrand #YourNiche #YourCatchphrase"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}
