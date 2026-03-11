import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, Copy, Check, Loader2, ChevronDown, ChevronUp,
  ArrowRight, Zap, Crown,
} from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ToolConfig } from './toolsConfig';

interface Props {
  config: ToolConfig;
}

interface Caption {
  platform: string;
  variantNumber: number;
  generatedCaption: string;
  hashtags: string[];
  title?: string;
  description?: string;
  analytics?: { engagementScore: number };
}

const CONTENT_FORMAT_LABELS: Record<string, string> = {
  short_video: 'Short Video / Reel',
  long_video: 'Long Video',
  image: 'Image / Photo',
  carousel: 'Carousel',
  story: 'Story',
  text_only: 'Text Only',
};

const AVAILABLE_FORMATS = [
  { value: 'image', label: 'Image / Photo' },
  { value: 'short_video', label: 'Short Video / Reel' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'text_only', label: 'Text Only' },
];

export default function ToolLandingPage({ config }: Props) {
  const [description, setDescription] = useState('');
  const [contentFormat, setContentFormat] = useState(config.defaultContentFormat);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const generate = async () => {
    if (!description.trim()) { setError('Please describe your content first.'); return; }
    setError('');
    setLoading(true);
    setCaptions([]);
    try {
      const res = await api.post('/captions/generate', {
        platforms: config.platforms,
        contentFormat,
        contentDescription: description.trim(),
        ...(config.niche && { niche: config.niche }),
      });
      const result = res.data.data;
      setCaptions(result.captions || []);
    } catch (e: any) {
      if (e?.response?.status === 429) {
        setError('Rate limit reached. Sign up for a free account to continue generating.');
      } else {
        setError(e?.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCopyContent = (c: Caption) => {
    const isYT = c.platform === 'youtube_long' || c.platform === 'youtube_shorts';
    if (isYT && c.title) {
      return `${c.title}\n\n${c.description || c.generatedCaption}\n\n${c.hashtags.join(' ')}`;
    }
    return `${c.generatedCaption}\n\n${c.hashtags.join(' ')}`;
  };

  // JSON-LD for FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // Show only variant 1 for each platform (first result per platform)
  const firstVariants = config.platforms.map(platform =>
    captions.find(c => c.platform === platform && c.variantNumber === 1)
  ).filter(Boolean) as Caption[];

  const extraCount = captions.length - firstVariants.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <Helmet>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <meta name="keywords" content={config.keywords} />
        <link rel="canonical" href={`https://www.captions4you.com/${config.slug}`} />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={`https://www.captions4you.com/${config.slug}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by AI · Free to use
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {config.h1}
            </h1>
            <p className="text-xl text-indigo-600 font-semibold mb-3">{config.tagline}</p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">{config.bodyDescription}</p>
          </div>
        </section>

        {/* ── Generator ── */}
        <section className="px-4 pb-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">

              {/* Content format selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FORMATS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setContentFormat(f.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border-2 font-medium transition-colors ${
                        contentFormat === f.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Describe Your Content
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.metaKey && generate()}
                  placeholder={config.placeholderText}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </p>
              )}

              <button
                onClick={generate}
                disabled={loading || !description.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Generating…</>
                  : <><Sparkles className="w-5 h-5" />Generate Free Caption</>
                }
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Free to use · No signup required · {CONTENT_FORMAT_LABELS[contentFormat] || contentFormat}
              </p>
            </div>

            {/* Results */}
            <AnimatePresence>
              {firstVariants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  {firstVariants.map((caption, i) => {
                    const isYT = caption.platform === 'youtube_long' || caption.platform === 'youtube_shorts';
                    const copyId = `cap-${i}`;
                    return (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {caption.analytics && (
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                                {caption.analytics.engagementScore.toFixed(0)} score
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyText(getCopyContent(caption), copyId)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            {copied === copyId
                              ? <><Check className="w-3.5 h-3.5 text-green-500" />Copied!</>
                              : <><Copy className="w-3.5 h-3.5" />Copy</>
                            }
                          </button>
                        </div>

                        {isYT && caption.title ? (
                          <>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Title</p>
                            <p className="font-bold text-gray-900 mb-3">{caption.title}</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{caption.description || caption.generatedCaption}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">{caption.generatedCaption}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {caption.hashtags.slice(0, 12).map((tag, idx) => (
                            <span key={idx} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-medium">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                          {caption.hashtags.length > 12 && (
                            <span className="text-xs text-gray-400">+{caption.hashtags.length - 12} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Upgrade CTA */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 text-center">
                    <Crown className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900 mb-1">
                      {extraCount > 0 ? `${extraCount} more variants generated` : '2 more caption variants ready'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Sign up free to access all 3 variants, save your history, and generate 5 captions/month.
                      Upgrade for 100/month.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        Sign Up Free
                      </Link>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-indigo-200 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <Crown className="w-4 h-4" />
                        View Premium Plans
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-14 px-4 bg-white border-y border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Describe your content', desc: 'Tell the AI what your post or video is about in a sentence or two.' },
                { step: '2', title: 'Generate instantly', desc: 'Our AI writes platform-optimised captions with hashtags in seconds.' },
                { step: '3', title: 'Copy and post', desc: 'Pick your favourite variant, copy it, and paste it directly into your post.' },
              ].map(s => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Use Our {config.h1}?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {config.features.map((f, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <Zap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-14 px-4 bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {config.faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-3">Ready for more?</h2>
            <p className="text-indigo-100 mb-8">
              Sign up free and generate 5 captions/month. Upgrade to Premium for 100 generations, all platforms, and hashtag intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                See Pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
