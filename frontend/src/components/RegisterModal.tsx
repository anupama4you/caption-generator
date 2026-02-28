import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { setUser } from '../store/authSlice';
import api from '../services/api';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }: RegisterModalProps) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSuccess = (user: any, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch(setUser(user));
    if (onRegisterSuccess) onRegisterSuccess();
    onClose();
  };

  const signUpWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const response = await api.post('/oauth/google', {
          access_token: tokenResponse.access_token,
        });
        const { accessToken, refreshToken, user } = response.data;
        handleSuccess(user, accessToken, refreshToken);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google sign up failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign up was cancelled or failed.');
      setGoogleLoading(false);
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { accessToken, refreshToken, user } = response.data;
      handleSuccess(user, accessToken, refreshToken);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-8 pt-8 pb-7">
                {/* Heading */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-sm text-indigo-600 mt-1">Start generating captions for free. No credit card required.</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min. 6 characters)"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Button — blue, full width */}
                <button
                  type="button"
                  onClick={() => { setError(''); setGoogleLoading(true); signUpWithGoogle(); }}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Sign Up with Google
                </button>

                {/* Switch */}
                <p className="text-center text-sm text-gray-500 mt-5">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    Login here
                  </button>
                </p>

                {/* Legal */}
                <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                  By signing up, you agree to our{' '}
                  <Link to="/terms-of-service" onClick={onClose} className="underline hover:text-gray-600">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" onClick={onClose} className="underline hover:text-gray-600">Privacy Policy</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
