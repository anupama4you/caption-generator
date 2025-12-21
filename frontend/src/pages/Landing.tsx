import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold text-indigo-600">captions for you</h1>
          </Link>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-indigo-600">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Generate Viral Social Media Captions with AI
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create platform-optimized captions with predictive analytics for Instagram, TikTok,
            Facebook, and YouTube
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700"
          >
            Start Free Trial
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
            <p className="text-gray-600">
              Get engagement predictions and reach estimates for every caption
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Trending Hashtags</h3>
            <p className="text-gray-600">
              Automatically include platform-specific trending hashtags
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Custom Brand Voice</h3>
            <p className="text-gray-600">
              Captions tailored to your niche, audience, and brand style
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center mb-8">Pricing</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h4 className="text-2xl font-bold mb-2">Free</h4>
              <p className="text-3xl font-bold mb-4">
                $0<span className="text-lg text-gray-600">/month</span>
              </p>
              <ul className="space-y-2 mb-6">
                <li>10 captions per month</li>
                <li>Basic analytics</li>
                <li>Caption history (30 days)</li>
              </ul>
              <Link
                to="/register"
                className="block text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Get Started
              </Link>
            </div>
            <div className="border-2 border-indigo-600 rounded-lg p-6 relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg text-sm">
                Popular
              </div>
              <h4 className="text-2xl font-bold mb-2">Premium</h4>
              <p className="text-3xl font-bold mb-4">
                $9.99<span className="text-lg text-gray-600">/month</span>
              </p>
              <ul className="space-y-2 mb-6">
                <li>100 captions per month</li>
                <li>Advanced AI analytics</li>
                <li>Unlimited caption history</li>
                <li>Trending hashtag suggestions</li>
                <li>Export to CSV</li>
                <li>Priority support</li>
              </ul>
              <Link
                to="/register"
                className="block text-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
