import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Unlink } from 'lucide-react';
import api from '../../services/api';

export interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  accountAvatar?: string;
}

const PLATFORM_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  twitter:   { label: 'X (Twitter)',  color: 'text-gray-900',    bg: 'bg-gray-100',   border: 'border-gray-200' },
  linkedin:  { label: 'LinkedIn',     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  instagram: { label: 'Instagram',    color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-200' },
  tiktok:    { label: 'TikTok',       color: 'text-gray-900',    bg: 'bg-gray-100',   border: 'border-gray-300' },
  youtube:   { label: 'YouTube',      color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
};

const PLATFORM_ICONS: Record<string, string> = {
  twitter:   '𝕏',
  linkedin:  'in',
  instagram: '📷',
  tiktok:    '♪',
  youtube:   '▶',
};

interface Props {
  platform: string;
  account: SocialAccount | null;
  onDisconnected: (platform: string) => void;
}

export default function ConnectAccountButton({ platform, account, onDisconnected }: Props) {
  const [disconnecting, setDisconnecting] = useState(false);
  const meta = PLATFORM_META[platform] ?? { label: platform, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };

  const handleConnect = async () => {
    try {
      const res = await api.get(`/social/connect/${platform}`);
      window.location.href = res.data.url;
    } catch (e) {
      console.error('Connect failed:', e);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await api.delete(`/social/${platform}`);
      onDisconnected(platform);
    } catch (e) {
      console.error('Disconnect failed:', e);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${meta.bg} ${meta.border}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${meta.bg} border ${meta.border}`}>
          <span className={meta.color}>{PLATFORM_ICONS[platform] ?? '?'}</span>
        </div>
        <div>
          <p className={`font-semibold text-sm ${meta.color}`}>{meta.label}</p>
          {account ? (
            <p className="text-xs text-gray-500">{account.accountName}</p>
          ) : (
            <p className="text-xs text-gray-400">Not connected</p>
          )}
        </div>
      </div>

      {account ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${meta.border} ${meta.color} hover:opacity-80 transition-opacity`}
        >
          Connect
        </button>
      )}
    </motion.div>
  );
}
