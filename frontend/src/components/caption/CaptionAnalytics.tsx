import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, ChevronDown, ChevronUp, Hash, MessageSquare, Zap, Clock
} from 'lucide-react';
import { CaptionAnalytics as CaptionAnalyticsType } from '../../types';

interface CaptionAnalyticsProps {
  analytics: CaptionAnalyticsType;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function CaptionAnalytics({ analytics, isExpanded, onToggle }: CaptionAnalyticsProps) {
  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-xs font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-3"
      >
        <span className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-indigo-600" />
          Detailed Analytics
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <div className="text-lg font-bold text-indigo-600">
                  {analytics.engagementScore.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-700 font-medium">Engagement</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {analytics.viralityScore.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-700 font-medium">Virality</div>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-xs font-bold text-green-600">
                  {analytics.reachEstimate}
                </div>
                <div className="text-[10px] text-gray-700 font-medium">Reach</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2 mb-3">
              {[
                { label: 'Hashtags', score: analytics.hashtagScore, icon: Hash },
                { label: 'Length', score: analytics.lengthScore, icon: MessageSquare },
                { label: 'Keywords', score: analytics.keywordScore, icon: Zap },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </span>
                    <span className="font-bold text-indigo-600">{item.score.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Best Posting Times */}
            <div className="bg-blue-50 p-2 rounded-lg mb-2">
              <h6 className="font-semibold text-[10px] mb-1.5 flex items-center gap-1 text-blue-900">
                <Clock className="w-3 h-3" />
                Best Times
              </h6>
              <div className="flex flex-wrap gap-1">
                {analytics.bestPostingTime.map((time, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Improvement Tips */}
            {analytics.improvementTips.length > 0 && (
              <div className="bg-amber-50 p-2 rounded-lg">
                <h6 className="font-semibold text-[10px] mb-1.5 text-amber-900">Tips</h6>
                <ul className="space-y-1 text-[10px] text-gray-700">
                  {analytics.improvementTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
