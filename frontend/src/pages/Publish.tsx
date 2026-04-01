import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, Send, ChevronRight, ChevronLeft,
  Loader2, AlertCircle, CheckCircle, Crown, Info,
} from 'lucide-react';
import { RootState } from '../store/store';
import api from '../services/api';
import MediaUploader, { UploadedMedia } from '../components/publish/MediaUploader';
import ConnectAccountButton, { SocialAccount } from '../components/publish/ConnectAccountButton';
import PublishResults, { PublishResultItem } from '../components/publish/PublishResults';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedCaption {
  platform: string;
  caption: string;
  hashtags: string[];
}

const SUPPORTED_PLATFORMS = ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube'];

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'X (Twitter)', linkedin: 'LinkedIn', instagram: 'Instagram',
  tiktok: 'TikTok', youtube: 'YouTube',
};

const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280, linkedin: 3000, instagram: 2200, tiktok: 2200, youtube: 5000,
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = ['Upload', 'Captions', 'Post'];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
              i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-indigo-600' : i < step ? 'text-gray-600' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded ${i < step ? 'bg-indigo-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Publish() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();

  if (!user) return <Navigate to="/login" replace />;

  const [step, setStep] = useState(0); // 0=upload 1=captions 2=post 3=results

  // Upload state
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Caption state
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Social accounts
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResultItem[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Toast for OAuth connection success
  const [toast, setToast] = useState<string | null>(null);

  // Free trial state
  const isFree = user.subscriptionTier === 'FREE';
  const [trialUsed, setTrialUsed] = useState(false);

  useEffect(() => {
    loadAccounts();
    // Check if returning from OAuth
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      setToast(`${PLATFORM_LABELS[connected] ?? connected} connected!`);
      setTimeout(() => setToast(null), 4000);
      window.history.replaceState({}, '', '/publish');
    }
    if (error) {
      setToast(`Connection failed: ${decodeURIComponent(error)}`);
      setTimeout(() => setToast(null), 5000);
      window.history.replaceState({}, '', '/publish');
    }
  }, []);

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      const res = await api.get('/social/accounts');
      setAccounts(res.data.data);
    } catch (e) {
      console.error('Failed to load accounts', e);
    } finally {
      setAccountsLoading(false);
    }
  };

  // ─── Step 0: Upload ─────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!uploadedMedia || uploadedMedia.resourceType === 'video') return;
    try {
      setAnalyzing(true);
      setAnalyzeError(null);
      const res = await api.post('/publish/analyze', { imageUrl: uploadedMedia.url });
      setDescription(res.data.data.description);
    } catch (e: any) {
      setAnalyzeError(e?.response?.data?.error ?? 'Vision analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Step 1: Generate captions ──────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!description.trim() || selectedPlatforms.length === 0) return;
    try {
      setGenerating(true);
      // Map publish platforms to caption platform format and use generate endpoint
      const platformMap: Record<string, string> = {
        twitter: 'x', linkedin: 'linkedin', instagram: 'instagram', tiktok: 'tiktok', youtube: 'youtube_shorts',
      };
      const mappedPlatforms = selectedPlatforms.map(p => platformMap[p] ?? p);

      const res = await api.post('/captions/generate', {
        platforms: mappedPlatforms,
        contentFormat: uploadedMedia?.resourceType === 'video' ? 'short_video' : 'image',
        contentDescription: description,
        emojiPreference: true,
      });

      // Extract one caption per platform (variant 1)
      const rawCaptions = res.data.data?.captions ?? [];
      const perPlatform: Record<string, GeneratedCaption> = {};

      for (const c of rawCaptions) {
        const publishPlatform = Object.entries(platformMap).find(([, v]) => v === c.platform)?.[0] ?? c.platform;
        if (!perPlatform[publishPlatform] && c.variantNumber === 1) {
          perPlatform[publishPlatform] = {
            platform: publishPlatform,
            caption: c.generatedCaption,
            hashtags: c.hashtags,
          };
        }
      }

      setCaptions(selectedPlatforms.map(p => perPlatform[p] ?? { platform: p, caption: description, hashtags: [] }));
      setStep(1);
    } catch (e: any) {
      console.error('Generate failed', e);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Step 2: Publish ────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (isFree && trialUsed) return;
    setPublishError(null);
    setPublishing(true);
    try {
      // Use a single shared caption (first platform's) or let user pick — use first for now
      const mainCaption = captions[0];
      const res = await api.post('/publish', {
        caption: mainCaption?.caption ?? description,
        hashtags: mainCaption?.hashtags ?? [],
        platforms: selectedPlatforms,
        mediaUrl: uploadedMedia?.url,
        mediaType: uploadedMedia?.resourceType,
        cloudinaryId: uploadedMedia?.publicId,
      });

      setResults(res.data.data.results);
      if (isFree) setTrialUsed(true);
      setStep(3);
    } catch (e: any) {
      if (e?.response?.data?.error === 'PUBLISH_TRIAL_USED') {
        setTrialUsed(true);
        setPublishError('Free trial used. Upgrade to publish more.');
      } else {
        setPublishError(e?.response?.data?.message ?? 'Publish failed');
      }
    } finally {
      setPublishing(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setUploadedMedia(null);
    setDescription('');
    setCaptions([]);
    setResults([]);
    setPublishError(null);
    setSelectedPlatforms([]);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Publish Hub
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post to all platforms</h1>
          <p className="text-gray-500 text-sm mt-1">Upload media → AI generates captions → post everywhere</p>
        </div>

        {/* Free trial banner */}
        {isFree && (
          <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
            trialUsed ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {trialUsed ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
            {trialUsed
              ? <>You've used your free publish trial. <a href="/pricing" className="font-semibold underline">Upgrade for unlimited</a></>
              : <>You have <strong>1 free publish</strong> included. Upgrade for unlimited posts.</>
            }
          </div>
        )}

        {/* Steps 0-2 */}
        {step < 3 && <StepBar step={step} />}

        {/* Step 0: Upload + description */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <MediaUploader onUploaded={setUploadedMedia} />

            {/* AI analyze button (images only) */}
            {uploadedMedia?.resourceType === 'image' && (
              <div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Analyzing image…' : 'Auto-analyze with AI'}
                </button>
                {analyzeError && <p className="text-xs text-red-600 mt-1">{analyzeError}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {uploadedMedia?.resourceType === 'video' ? 'Describe your video' : 'Content description'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="What's this content about? The more detail, the better the captions."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Select platforms</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_PLATFORMS.map(p => {
                  const connected = accounts.some(a => a.platform === p);
                  const selected = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatforms(prev => selected ? prev.filter(x => x !== p) : [...prev, p])}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {PLATFORM_LABELS[p]}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">Green dot = account connected</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!description.trim() || selectedPlatforms.length === 0 || generating}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating captions…</> : <><Sparkles className="w-4 h-4" /> Generate Captions</>}
            </button>
          </motion.div>
        )}

        {/* Step 1: Review captions */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {captions.map(c => (
              <div key={c.platform} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{PLATFORM_LABELS[c.platform]}</span>
                  <span className={`text-xs ${c.caption.length > (PLATFORM_CHAR_LIMITS[c.platform] ?? 9999) ? 'text-red-500' : 'text-gray-400'}`}>
                    {c.caption.length} / {PLATFORM_CHAR_LIMITS[c.platform]} chars
                  </span>
                </div>
                <textarea
                  value={c.caption}
                  onChange={e => setCaptions(prev => prev.map(x => x.platform === c.platform ? { ...x, caption: e.target.value } : x))}
                  rows={4}
                  className="w-full text-sm text-gray-700 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-gray-50"
                />
                {c.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.hashtags.map((h, i) => (
                      <span key={i} className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {h.startsWith('#') ? h : `#${h}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                Continue to Post <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Connect accounts + post */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">Connected accounts</h3>
              <p className="text-sm text-gray-400 mb-4">Only selected platforms will be posted to.</p>

              {accountsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : (
                <div className="space-y-3">
                  {selectedPlatforms.map(p => (
                    <ConnectAccountButton
                      key={p}
                      platform={p}
                      account={accounts.find(a => a.platform === p) ?? null}
                      onDisconnected={(platform) => setAccounts(prev => prev.filter(a => a.platform !== platform))}
                    />
                  ))}
                </div>
              )}
            </div>

            {publishError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {publishError}
                {publishError.includes('Upgrade') && (
                  <a href="/pricing" className="ml-auto font-semibold underline flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> Upgrade</a>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || (isFree && trialUsed) || selectedPlatforms.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {publishing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                  : <><Send className="w-4 h-4" /> Post Now to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
                }
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <PublishResults results={results} onDone={resetAll} />
          </motion.div>
        )}

        {/* Accounts section (always shown) */}
        {step < 2 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Connected accounts</h3>
              <button onClick={loadAccounts} className="text-xs text-indigo-600 hover:text-indigo-700">Refresh</button>
            </div>
            {accountsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
            ) : (
              <div className="space-y-2">
                {SUPPORTED_PLATFORMS.map(p => (
                  <ConnectAccountButton
                    key={p}
                    platform={p}
                    account={accounts.find(a => a.platform === p) ?? null}
                    onDisconnected={(platform) => setAccounts(prev => prev.filter(a => a.platform !== platform))}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
