import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { setUser } from '../store/authSlice';
import api from '../services/api';
import SocialLoginButtons from './SocialLoginButtons';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }: RegisterModalProps) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const response = await api.post('/oauth/google', {
        credential: credentialResponse.credential,
      });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setUser(user));

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google sign up failed');
    }
  };

  const handleFacebookLogin = async (accessToken: string) => {
    try {
      const response = await api.post('/oauth/facebook', { accessToken });

      const { accessToken: jwtAccessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', jwtAccessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setUser(user));

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Facebook sign up failed');
    }
  };

  const handleTikTokLogin = async (code: string) => {
    try {
      const response = await api.post('/oauth/tiktok', { code });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setUser(user));

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'TikTok sign up failed');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setUser(user));

      // Call success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-sm text-gray-600 mt-1">Start generating amazing captions for free</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Social Login */}
                <div className="space-y-3">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setError('Google sign up failed')}
                    useOneTap
                    text="signup_with"
                    shape="rectangular"
                    size="large"
                    width="100%"
                  />

                  {/* Facebook & TikTok Login */}
                  <SocialLoginButtons
                    onFacebookLogin={handleFacebookLogin}
                    onTikTokLogin={handleTikTokLogin}
                    setError={setError}
                  />

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="text-sm text-gray-500 font-medium">OR</span>
                    <div className="flex-1 border-t border-gray-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Sign Up Free'
                  )}
                </motion.button>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    ✓ Free forever • ✓ 10 captions/month • ✓ No credit card required
                  </p>
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
