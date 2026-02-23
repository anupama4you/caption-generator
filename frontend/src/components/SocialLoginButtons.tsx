import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Music2 } from 'lucide-react';

// Declare Facebook SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface SocialLoginButtonsProps {
  onFacebookLogin: (accessToken: string) => Promise<void>;
  onTikTokLogin: (code: string) => Promise<void>;
  setError: (error: string) => void;
}

export default function SocialLoginButtons({ onFacebookLogin, onTikTokLogin: _onTikTokLogin, setError }: SocialLoginButtonsProps) {
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;

  useEffect(() => {
    // Load Facebook SDK
    if (FACEBOOK_APP_ID && !window.FB) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }, [FACEBOOK_APP_ID]);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK not loaded');
      return;
    }

    window.FB.login((response: any) => {
      if (response.authResponse) {
        onFacebookLogin(response.authResponse.accessToken);
      } else {
        setError('Facebook login cancelled');
      }
    }, { scope: 'public_profile,email' });
  };

  const handleTikTokLogin = () => {
    if (!TIKTOK_CLIENT_KEY) {
      setError('TikTok login not configured');
      return;
    }

    const csrfState = Math.random().toString(36).substring(2);
    localStorage.setItem('tiktok_csrf_state', csrfState);

    const redirectUri = `${window.location.origin}/auth/tiktok/callback`;
    const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize?` +
      `client_key=${TIKTOK_CLIENT_KEY}&` +
      `scope=user.info.basic&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${csrfState}`;

    window.location.href = tiktokAuthUrl;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Facebook Login Button */}
      {FACEBOOK_APP_ID && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleFacebookLogin}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors"
        >
          <Facebook className="w-5 h-5" />
          <span className="hidden sm:inline">Facebook</span>
        </motion.button>
      )}

      {/* TikTok Login Button */}
      {TIKTOK_CLIENT_KEY && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleTikTokLogin}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          <Music2 className="w-5 h-5" />
          <span className="hidden sm:inline">TikTok</span>
        </motion.button>
      )}
    </div>
  );
}
