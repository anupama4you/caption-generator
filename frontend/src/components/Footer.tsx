import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Captions4You</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered caption generation for every social media platform. Save time, grow faster.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Caption Generator</Link></li>
              <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Pricing</Link></li>
              <li><Link to="/history" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">My History</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Captions4You. All rights reserved.</p>
          <p className="text-xs text-gray-400">Built for content creators worldwide 🌍</p>
        </div>
      </div>
    </footer>
  );
}
