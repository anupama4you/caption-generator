import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { setUser, setLoading } from './store/authSlice';
import api from './services/api';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          dispatch(setUser(response.data));
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      dispatch(setLoading(false));
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Dashboard is now the landing page for everyone */}
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />}
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/history"
          element={isAuthenticated ? <History /> : <Navigate to="/" />}
        />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
