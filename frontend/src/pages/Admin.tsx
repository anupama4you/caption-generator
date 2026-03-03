import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, FileText, TrendingUp, Crown, Shield, Search,
  ChevronLeft, ChevronRight, Trash2, BarChart2, RefreshCw,
} from 'lucide-react';
import { RootState } from '../store/store';
import api from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  trialUsers: number;
  freeUsers: number;
  totalAttempts: number;
  totalCaptions: number;
  newUsersLast30Days: number;
  signupTrend: { date: string; count: number }[];
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'FREE' | 'TRIAL' | 'PREMIUM';
  isAdmin: boolean;
  createdAt: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  _count: { captionAttempts: number };
}

interface CaptionAttempt {
  id: string;
  contentFormat: string;
  contentDescription: string;
  niche: string | null;
  isFavorite: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string };
  _count: { captions: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  TRIAL: 'bg-amber-100 text-amber-700',
  PREMIUM: 'bg-indigo-100 text-indigo-700',
};

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub?: string; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'captions';

export default function Admin() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState<Tab>('overview');

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersTierFilter, setUsersTierFilter] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [tierUpdating, setTierUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Captions
  const [captions, setCaptions] = useState<CaptionAttempt[]>([]);
  const [captionsTotal, setCaptionsTotal] = useState(0);
  const [captionsPage, setCaptionsPage] = useState(1);
  const [captionsTotalPages, setCaptionsTotalPages] = useState(1);
  const [captionsSearch, setCaptionsSearch] = useState('');
  const [captionsLoading, setCaptionsLoading] = useState(false);

  // Guard
  if (!user?.isAdmin) return <Navigate to="/" replace />;

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = usersSearch, tier = usersTierFilter) => {
    try {
      setUsersLoading(true);
      const res = await api.get('/admin/users', { params: { page, limit: 20, search, tier } });
      setUsers(res.data.data.users);
      setUsersTotal(res.data.data.total);
      setUsersTotalPages(res.data.data.totalPages);
      setUsersPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCaptions = async (page = 1, search = captionsSearch) => {
    try {
      setCaptionsLoading(true);
      const res = await api.get('/admin/captions', { params: { page, limit: 20, search } });
      setCaptions(res.data.data.attempts);
      setCaptionsTotal(res.data.data.total);
      setCaptionsTotalPages(res.data.data.totalPages);
      setCaptionsPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      setCaptionsLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (tab === 'users') fetchUsers(1, '', ''); }, [tab]);
  useEffect(() => { if (tab === 'captions') fetchCaptions(1, ''); }, [tab]);

  const handleTierChange = async (userId: string, tier: string) => {
    try {
      setTierUpdating(userId);
      await api.patch(`/admin/users/${userId}/tier`, { tier });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionTier: tier as any } : u));
    } catch (e) {
      console.error(e);
    } finally {
      setTierUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUsersTotal(prev => prev - 1);
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Captions4You</p>
            </div>
          </div>
          <a href="/" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">← Back to App</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {([['overview', BarChart2, 'Overview'], ['users', Users, 'Users'], ['captions', FileText, 'Captions']] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Overview</h2>
              <button onClick={fetchStats} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 h-24 animate-pulse" />
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} sub={`+${stats.newUsersLast30Days} last 30 days`} color="bg-blue-50 text-blue-600" />
                  <StatCard icon={Crown} label="Premium" value={stats.premiumUsers.toLocaleString()} sub={`${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% of users`} color="bg-indigo-50 text-indigo-600" />
                  <StatCard icon={TrendingUp} label="On Trial" value={stats.trialUsers.toLocaleString()} color="bg-amber-50 text-amber-600" />
                  <StatCard icon={Users} label="Free" value={stats.freeUsers.toLocaleString()} color="bg-gray-50 text-gray-600" />
                  <StatCard icon={FileText} label="Total Generations" value={stats.totalAttempts.toLocaleString()} color="bg-purple-50 text-purple-600" />
                  <StatCard icon={FileText} label="Total Captions" value={stats.totalCaptions.toLocaleString()} color="bg-green-50 text-green-600" />
                </div>

                {/* Signup trend */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">New signups — last 14 days</h3>
                  <div className="flex items-end gap-1 h-24">
                    {stats.signupTrend.map(({ date, count }) => {
                      const max = Math.max(...stats.signupTrend.map(d => d.count), 1);
                      const height = Math.max(4, (count / max) * 96);
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="relative">
                            <div
                              className="w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-600 transition-colors"
                              style={{ height: `${height}px`, minWidth: '12px' }}
                            />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                              {count} • {date.slice(5)}
                            </div>
                          </div>
                          <span className="text-[9px] text-gray-400 rotate-45 origin-left hidden sm:block">{date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={usersSearch}
                  onChange={e => setUsersSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchUsers(1, usersSearch, usersTierFilter)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={usersTierFilter}
                onChange={e => { setUsersTierFilter(e.target.value); fetchUsers(1, usersSearch, e.target.value); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All tiers</option>
                <option value="FREE">Free</option>
                <option value="TRIAL">Trial</option>
                <option value="PREMIUM">Premium</option>
              </select>
              <button
                onClick={() => fetchUsers(1, usersSearch, usersTierFilter)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
              >
                Search
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{usersTotal.toLocaleString()} users</span>
              </div>

              {usersLoading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Name / Email', 'Tier', 'Captions', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                            {u.isAdmin && <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded mt-0.5"><Shield className="w-2.5 h-2.5" /> Admin</span>}
                          </td>
                          <td className="px-4 py-3">
                            {tierUpdating === u.id ? (
                              <span className="text-xs text-gray-400">Updating...</span>
                            ) : (
                              <select
                                value={u.subscriptionTier}
                                onChange={e => handleTierChange(u.id, e.target.value)}
                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${TIER_COLORS[u.subscriptionTier]}`}
                              >
                                <option value="FREE">Free</option>
                                <option value="TRIAL">Trial</option>
                                <option value="PREMIUM">Premium</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{u._count.captionAttempts}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {deleteConfirm === u.id ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleDeleteUser(u.id)} className="text-xs text-red-600 font-semibold hover:text-red-700">Confirm</button>
                                <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(u.id)}
                                disabled={u.id === user.id}
                                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Page {usersPage} of {usersTotalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => fetchUsers(usersPage - 1)} disabled={usersPage <= 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => fetchUsers(usersPage + 1)} disabled={usersPage >= usersTotalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Captions ── */}
        {tab === 'captions' && (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by description or user email..."
                  value={captionsSearch}
                  onChange={e => setCaptionsSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchCaptions(1, captionsSearch)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button onClick={() => fetchCaptions(1, captionsSearch)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Search
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">{captionsTotal.toLocaleString()} generations</span>
              </div>

              {captionsLoading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['User', 'Description', 'Format', 'Captions', 'Date'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {captions.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{c.user.name}</p>
                            <p className="text-xs text-gray-400">{c.user.email}</p>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-gray-700 truncate">{c.contentDescription}</p>
                            {c.niche && <p className="text-xs text-gray-400">{c.niche}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.contentFormat}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{c._count.captions}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {captionsTotalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Page {captionsPage} of {captionsTotalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => fetchCaptions(captionsPage - 1)} disabled={captionsPage <= 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => fetchCaptions(captionsPage + 1)} disabled={captionsPage >= captionsTotalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
