import { useState, useEffect } from 'react';
import { ServerCrash } from 'lucide-react';
import { onServerStatusChange } from '../../services/api';

export default function ServerDownOverlay() {
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    return onServerStatusChange(setIsDown);
  }, []);

  if (!isDown) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center px-6 max-w-md">
        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <ServerCrash className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          We'll be right back!
        </h1>
        <p className="text-gray-600 mb-6">
          Our servers are taking a quick break. We're working on it and should be back within 15 minutes.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-400 mt-4">
          If the issue persists, please try again later.
        </p>
      </div>
    </div>
  );
}
