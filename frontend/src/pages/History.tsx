import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Caption } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function History() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCaptions();
  }, []);

  const fetchCaptions = async () => {
    try {
      const response = await api.get('/captions');
      setCaptions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch captions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this caption?')) {
      try {
        await api.delete(`/captions/${id}`);
        setCaptions(captions.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Failed to delete caption:', err);
      }
    }
  };

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Caption Generator</h1>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Caption History</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : captions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No captions generated yet</p>
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Generate Your First Caption
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captions.map((caption) => (
              <div key={caption.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {caption.platform}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(caption.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-800 mb-3 line-clamp-4">
                  {caption.generatedCaption}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {caption.hashtags.slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="text-xs text-indigo-600">
                      {tag}
                    </span>
                  ))}
                  {caption.hashtags.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{caption.hashtags.length - 5} more
                    </span>
                  )}
                </div>

                {caption.analytics && (
                  <div className="mb-4 py-3 px-3 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Engagement:</span>
                        <span className="ml-1 font-semibold text-indigo-600">
                          {caption.analytics.engagementScore.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reach:</span>
                        <span className="ml-1 font-semibold text-green-600">
                          {caption.analytics.reachEstimate}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <CopyToClipboard
                    text={`${caption.generatedCaption}\n\n${caption.hashtags.join(' ')}`}
                    onCopy={() => handleCopy(caption.id)}
                  >
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700">
                      {copiedId === caption.id ? 'Copied!' : 'Copy'}
                    </button>
                  </CopyToClipboard>
                  <button
                    onClick={() => handleDelete(caption.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
