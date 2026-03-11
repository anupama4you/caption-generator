import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, ChevronDown, ChevronUp, ArrowRight, Zap,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ToolConfig } from './toolsConfig';

interface Props {
  config: ToolConfig;
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
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [contentFormat, setContentFormat] = useState(config.defaultContentFormat);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    if (!description.trim()) {
      setError('Please describe your content first.');
      return;
    }
    // Redirect to main Dashboard with params — it auto-generates on arrival
    const params = new URLSearchParams({
      platforms: config.platforms.join(','),
      format: contentFormat,
      desc: description.trim(),
    });
    navigate(`/?${params.toString()}`);
  };

  // JSON-LD FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

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
        <section className="px-4 pb-14">
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
                  onChange={e => { setDescription(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && e.metaKey && handleGenerate()}
                  placeholder={config.placeholderText}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                />
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!description.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generate {CONTENT_FORMAT_LABELS[contentFormat]} Captions
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Free to use · No signup required · Results ready in seconds
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-14 px-4 bg-white border-y border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Describe your content', desc: 'Tell the AI what your post or video is about in a sentence or two.' },
                { step: '2', title: 'AI generates instantly', desc: 'Get 3 caption variants with platform-optimised hashtags in seconds.' },
                { step: '3', title: 'Copy and post', desc: 'Pick your favourite, copy it, and paste directly into your post.' },
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
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              Why Use Our {config.h1}?
            </h2>
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
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
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
              Sign up free and generate 5 captions/month. Upgrade to Premium for 100 generations,
              all platforms, and hashtag intelligence.
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
