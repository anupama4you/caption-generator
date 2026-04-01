import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Minus, ExternalLink } from 'lucide-react';

export interface PublishResultItem {
  platform: string;
  status: 'success' | 'failed' | 'skipped';
  postUrl?: string | null;
  error?: string | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'X (Twitter)', linkedin: 'LinkedIn', instagram: 'Instagram',
  tiktok: 'TikTok', youtube: 'YouTube',
};

interface Props {
  results: PublishResultItem[];
  onDone: () => void;
}

export default function PublishResults({ results, onDone }: Props) {
  const successCount = results.filter(r => r.status === 'success').length;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        {successCount > 0 ? (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Posted to {successCount} platform{successCount !== 1 ? 's' : ''}!
            </h3>
            <p className="text-sm text-gray-500 mt-1">Your content is live.</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Publish failed</h3>
            <p className="text-sm text-gray-500 mt-1">Check your connected accounts and try again.</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {results.map((result, i) => (
          <motion.div
            key={result.platform}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              result.status === 'success' ? 'bg-green-50 border-green-200' :
              result.status === 'failed' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
              {result.status === 'failed' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
              {result.status === 'skipped' && <Minus className="w-5 h-5 text-gray-400 shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-gray-800">{PLATFORM_LABELS[result.platform] ?? result.platform}</p>
                {result.status === 'failed' && result.error && (
                  <p className="text-xs text-red-600 mt-0.5">{result.error}</p>
                )}
                {result.status === 'skipped' && (
                  <p className="text-xs text-gray-400 mt-0.5">No connected account</p>
                )}
              </div>
            </div>

            {result.postUrl && (
              <a
                href={result.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
      >
        Post Again
      </button>
    </div>
  );
}
