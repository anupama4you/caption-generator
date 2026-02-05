import { motion } from 'framer-motion';
import { Copy, Check, TrendingUp } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Caption } from '../../types';
import CaptionAnalytics from './CaptionAnalytics';

interface CaptionCardProps {
  caption: Caption;
  copiedId: string | null;
  onCopy: (id: string) => void;
  expandedAnalytics: boolean;
  onToggleAnalytics: () => void;
}

export default function CaptionCard({
  caption,
  copiedId,
  onCopy,
  expandedAnalytics,
  onToggleAnalytics,
}: CaptionCardProps) {
  const isYouTube = caption.platform === 'youtube_shorts' || caption.platform === 'youtube_long';
  const hasTitle = isYouTube && caption.title;

  // Build the full copy text
  const getFullCopyText = () => {
    if (hasTitle) {
      return `Title: ${caption.title}\n\nDescription: ${caption.description || caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
    }
    return `${caption.generatedCaption}\n\n${caption.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gradient-to-br from-white to-gray-50 flex flex-col"
    >
      {/* Header */}
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

      {/* Caption Content */}
      {hasTitle ? (
        <div className="mb-4">
          {/* Title Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Title</span>
              <CopyToClipboard
                text={caption.title || ''}
                onCopy={() => onCopy(`${caption.id}-title`)}
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

          {/* Description Section */}
          {caption.description && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
                <CopyToClipboard
                  text={caption.description}
                  onCopy={() => onCopy(`${caption.id}-description`)}
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

      {/* Copy All Button */}
      <CopyToClipboard
        text={getFullCopyText()}
        onCopy={() => onCopy(caption.id)}
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

      {/* Analytics Section */}
      {caption.analytics && (
        <CaptionAnalytics
          analytics={caption.analytics}
          isExpanded={expandedAnalytics}
          onToggle={onToggleAnalytics}
        />
      )}
    </motion.div>
  );
}
