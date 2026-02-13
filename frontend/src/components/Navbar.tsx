import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, History as HistoryIcon, User, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { RootState } from '../store/store';
import mainLogo from '../assets/images/main-logo.svg';

interface NavbarProps {
  showAuthButtons?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Navbar({ showAuthButtons = true, onLoginClick, onRegisterClick }: NavbarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex justify-between items-center gap-2">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={mainLogo}
                  alt="Captions For You"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                />
              </motion.div>
            </Link>

            {/* Auth Buttons */}
            {showAuthButtons && (
              user ? (
                <div className="flex items-center space-x-1.5 sm:space-x-3">
                  <Link to="/history">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="History"
                    >
                      <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </Link>
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Profile"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </Link>
                  <motion.button
                    onClick={() => setShowLogoutModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 sm:p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  {onLoginClick ? (
                    <motion.button
                      onClick={onLoginClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-semibold transition-colors whitespace-nowrap"
                    >
                      Log In
                    </motion.button>
                  ) : (
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-semibold transition-colors whitespace-nowrap"
                      >
                        Log In
                      </motion.button>
                    </Link>
                  )}
                  {onRegisterClick ? (
                    <motion.button
                      onClick={onRegisterClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Sign Up Free</span>
                      <span className="sm:hidden">Sign Up</span>
                    </motion.button>
                  ) : (
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Sign Up Free</span>
                        <span className="sm:hidden">Sign Up</span>
                      </motion.button>
                    </Link>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-6">
                  Are you sure you want to log out? You'll need to sign in again to access your account.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowLogoutModal(false);
                      handleLogout();
                    }}
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
