import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { Caption, Platform, ContentType, UsageStats } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const PLATFORMS: Platform[] = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE'];

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [contentType, setContentType] = useState<ContentType>('PHOTO');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await api.get('/profile/usage');
      setUsage(response.data.data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setCopiedId(null);

    try {
      const response = await api.post('/captions/generate', {
        contentType,
        contentDescription: description,
      });

      setGeneratedCaptions(response.data.data);
      await fetchUsage();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Monthly limit reached');
      } else {
        setError('Failed to generate caption');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const progressPercentage = usage
    ? (usage.captionsGenerated / usage.monthlyLimit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Caption Generator</h1>
            <div className="flex items-center space-x-4">
              <Link to="/history" className="text-gray-700 hover:text-indigo-600">
                History
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">Generate engaging captions for your social media posts</p>
        </div>

        {usage && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Monthly Usage: {usage.captionsGenerated} / {usage.monthlyLimit}
              </span>
              <span className="text-sm text-gray-600">
                {user?.subscriptionTier === 'FREE' ? 'Free Tier' : 'Premium'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            {usage.captionsGenerated >= usage.monthlyLimit && (
              <p className="text-sm text-red-600 mt-2">
                You've reached your monthly limit. Upgrade to Premium for more captions!
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">Generate Caption</h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800 font-medium mb-2">
                  Captions will be generated for all platforms automatically:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PHOTO">Photo</option>
                  <option value="REEL">Reel</option>
                  <option value="SHORT">Short</option>
                  <option value="VIDEO">Video</option>
                  <option value="POST">Post</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your content</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: A morning workout routine showing 5 exercises for abs..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : 'Generate Caption'}
              </button>
            </form>
          </div>

          {generatedCaptions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Generated Captions</h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  All Platforms
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {generatedCaptions.map((caption) => (
                  <div key={caption.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                        {caption.platform}
                      </span>
                      <span className="text-xs text-gray-500">{caption.contentType}</span>
                    </div>

                    <p className="text-gray-800 whitespace-pre-wrap mb-4">{caption.generatedCaption}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caption.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-indigo-600 text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <CopyToClipboard
                      text={`${caption.generatedCaption}\n\n${caption.hashtags.join(' ')}`}
                      onCopy={() => setCopiedId(caption.id)}
                    >
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                        {copiedId === caption.id ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </CopyToClipboard>

                    {caption.analytics && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-sm mb-3">Analytics Prediction</h4>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-indigo-600">
                              {caption.analytics.engagementScore.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-600">Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">
                              {caption.analytics.viralityScore.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-600">Virality</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-green-600">
                              {caption.analytics.reachEstimate}
                            </div>
                            <div className="text-xs text-gray-600">Est. Reach</div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Hashtags</span>
                              <span>{caption.analytics.hashtagScore.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${caption.analytics.hashtagScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Caption Length</span>
                              <span>{caption.analytics.lengthScore.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${caption.analytics.lengthScore}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Keywords</span>
                              <span>{caption.analytics.keywordScore.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${caption.analytics.keywordScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <h5 className="font-semibold text-xs mb-2">Best Posting Times</h5>
                          <div className="flex flex-wrap gap-2">
                            {caption.analytics.bestPostingTime.map((time, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>

                        {caption.analytics.improvementTips.length > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-lg space-y-2">
                            <h5 className="font-semibold text-xs">Improvement Tips</h5>
                            <ul className="space-y-1 text-xs text-gray-700">
                              {caption.analytics.improvementTips
                                .slice(0, Math.max(caption.analytics.improvementTips.length - 1, 0))
                                .map((tip, idx) => (
                                  <li key={idx}>• {tip}</li>
                                ))}
                            </ul>
                            <div className="text-xs">
                              <span className="font-semibold text-gray-800">Video Suggestion: </span>
                              <span className="text-gray-700">
                                {
                                  caption.analytics.improvementTips[
                                    caption.analytics.improvementTips.length - 1
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
