import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, LogOut, Menu, X as XIcon, Crown,
  History as HistoryIcon, User, Settings,
} from 'lucide-react';
import mainLogo from '../assets/images/main-logo.svg';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { UsageStats } from '../types';
import Navbar from './Navbar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

  // Fetch usage stats for logged-in users
  useEffect(() => {
    if (!user?.id) { setUsage(null); return; }
    api.get('/profile/usage')
      .then(r => setUsage(r.data.data))
      .catch(() => {});
  }, [user?.id]);

  // ─── Subscription helpers ───
  const isFreeUser = user?.subscriptionTier === 'FREE';
  const isTrialUser = user?.subscriptionTier === 'TRIAL';

  const trialDaysLeft = (() => {
    if (!isTrialUser || !user?.trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  })();

  const progressPercentage = usage
    ? Math.min((usage.captionsGenerated / usage.monthlyLimit) * 100, 100)
    : 0;

  // ─── Sidebar nav active state ───
  const navItem = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  // ─── Guest layout ───
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    );
  }

  // ─── Logged-in layout ───
  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-50">

        {/* ─── Sidebar ─── */}
        <aside
          className={`w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${
            showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Logo */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <Link to="/" onClick={() => setShowMobileSidebar(false)}>
              <img src={mainLogo} alt="Captions4You" className="h-10 w-auto object-contain" />
            </Link>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Primary CTA */}
          <div className="p-3 border-b border-gray-100">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              + Generate Caption
            </Link>
          </div>

          {/* Navigation */}
          <nav className="px-2 py-3 flex-1 overflow-y-auto space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1 tracking-wider">Captions</p>
              <Link to="/" className={navItem('/', true)}>
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                Generate
              </Link>
              <Link to="/history" className={navItem('/history')}>
                <HistoryIcon className="w-4 h-4 flex-shrink-0" />
                History
              </Link>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1 tracking-wider">Account</p>
              <Link to="/profile" className={navItem('/profile')}>
                <User className="w-4 h-4 flex-shrink-0" />
                Account
              </Link>
              <Link to="/pricing" className={navItem('/pricing')}>
                <Settings className="w-4 h-4 flex-shrink-0" />
                Pricing
              </Link>
            </div>
          </nav>

          {/* Bottom: Upgrade */}
          {(isFreeUser || isTrialUser) && (
            <div className="p-3 border-t border-gray-100">
              <Link
                to="/pricing"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
              >
                <Crown className="w-4 h-4" />
                {!user.trialActivated ? 'Start Free Trial' : 'Upgrade Now'}
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile sidebar backdrop */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* ─── Main content area ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Trial / upgrade top banner */}
          {isTrialUser && (
            <div className="bg-indigo-600 text-white text-center py-2 px-4 text-sm flex-shrink-0">
              You are running your <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} Free Trial</strong>.{' '}
              <Link to="/pricing" className="underline font-semibold hover:text-indigo-200">Upgrade Here.</Link>
            </div>
          )}
          {isFreeUser && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 px-4 text-sm flex-shrink-0">
              {user.trialActivated
                ? <><span>Upgrade to Premium for unlimited captions.{' '}</span><Link to="/pricing" className="underline font-semibold hover:text-indigo-200">Upgrade Now.</Link></>
                : <><span>Start your <strong>7-Day Free Trial</strong> — full Premium access, no charge until trial ends.{' '}</span><Link to="/pricing" className="underline font-semibold hover:text-indigo-200">Try Free.</Link></>
              }
            </div>
          )}

          {/* Top header */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              {usage && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <span className="tabular-nums">{usage.captionsGenerated}/{usage.monthlyLimit} captions</span>
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isTrialUser ? 'bg-amber-100 text-amber-700' : isFreeUser ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'
              }`}>
                {isTrialUser ? 'Trial' : isFreeUser ? 'Free' : 'Premium'}
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-gray-700 font-medium">{user.email || user.name}</span>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable main */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ─── Logout Modal ─── */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                  <button onClick={() => setShowLogoutModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <XIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowLogoutModal(false); dispatch(logout()); navigate('/'); }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
