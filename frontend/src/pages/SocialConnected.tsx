import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import api from '../services/api';

/**
 * OAuth callback page — Zernio redirects here after a user connects a social account.
 * We sync the new account then redirect to Profile.
 */
export default function SocialConnected() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'syncing' | 'success' | 'error'>('syncing');

  useEffect(() => {
    api.post('/social/sync')
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/profile'), 1800);
      })
      .catch(() => {
        setStatus('error');
        setTimeout(() => navigate('/profile'), 2500);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-sm w-full text-center">
        {status === 'syncing' && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Connecting your account…</h2>
            <p className="text-sm text-gray-500 mt-1">Just a moment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Account connected!</h2>
            <p className="text-sm text-gray-500 mt-1">Redirecting you back…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500 mt-1">Redirecting you back…</p>
          </>
        )}
      </div>
    </div>
  );
}
