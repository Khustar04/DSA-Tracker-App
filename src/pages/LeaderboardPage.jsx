import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import FriendRequestList from '../components/Leaderboard/FriendRequestList';
import { toast } from 'react-hot-toast';

const FILTERS = ['All Time', 'This Week', 'This Month'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    if (user) {
      loadLeaderboard();
    } else {
      setLoading(false);
    }
    let subscription;
    if (user) {
      subscription = supabaseService.subscribeToLeaderboard(user.id, () => {
        loadLeaderboard(); // Realtime update hit!
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user]);

  const loadLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    const data = await supabaseService.getFriendsLeaderboard(user.id);
    setLeaderboard(data || []);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await supabaseService.searchUsers(searchQuery);
    // filter out current user and already friends
    const filtered = results.filter(u => u.id !== user.id && !leaderboard.find(l => l.user_id === u.id));
    setSearchResults(filtered);
  };

  const sendRequest = async (addresseeId) => {
    await supabaseService.sendFriendRequest(user.id, addresseeId);
    setSentRequests(prev => new Set(prev).add(addresseeId));
    toast.success('Friend request sent!');
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Friends Leaderboard</h1>
          <p className="text-sm text-white/50 mt-2">Sign in to add friends and view live rankings.</p>
          <Link
            to="/login"
            className="inline-flex mt-5 px-4 py-2 text-xs font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Column - Leaderboard */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Friends Leaderboard</h1>
              <p className="text-sm text-white/50">Compete with friends in real-time</p>
            </div>
            <div className="text-xs font-mono text-neon-green px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              Live Sync
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all duration-300 ${
                  activeFilter === f
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
                    : 'text-white/40 border border-white/5 hover:text-white/70 hover:border-white/10'
                }`}
                id={`filter-${f.toLowerCase().replace(' ', '-')}`}
              >
                {f}
              </button>
            ))}
          </div>

          <FriendRequestList onUpdate={loadLeaderboard} />

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-xs font-mono uppercase bg-black/20">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4 text-center">Total Solved</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">Current Streak</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.user_id} 
                    className={`border-b border-white/5 last:border-0 transition-colors ${
                      entry.user_id === user.id ? 'bg-neon-green/5' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono text-white/50">
                      <span className={index < 3 ? 'text-lg' : 'text-sm'}>{getRankEmoji(index)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Link 
                        to={`/user/${entry.user_id}`}
                        className="flex items-center gap-3 group"
                      >
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-neon-green/30 transition-all" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neon-green/10 text-neon-green flex items-center justify-center font-bold text-xs border border-neon-green/20 group-hover:border-neon-green/40 transition-all">
                            {(entry.username || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className={`font-mono text-sm group-hover:text-neon-green transition-colors ${entry.user_id === user.id ? 'text-neon-green font-semibold' : 'text-white/80'}`}>
                          @{entry.username} {entry.user_id === user.id && '(You)'}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white/90">{entry.total_solved || 0}</td>
                    <td className="py-3 px-4 text-center text-white/60 hidden sm:table-cell font-mono">{entry.current_streak || 0} 🔥</td>
                    <td className="py-3 px-4 text-center text-white/60 hidden sm:table-cell font-mono">-</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-white/40">Leaderboard is empty. Add some friends!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Add Friends */}
        <div className="w-full md:w-80 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold text-white/90 mb-2">Find Friends</h3>
            <p className="text-xs text-white/50 mb-4">Search by username to add them to your leaderboard.</p>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green/50"
              />
              <button type="submit" className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                <Search size={16} />
              </button>
            </form>

            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map(res => (
                  <div key={res.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg">
                    <Link 
                      to={`/user/${res.id}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0 group"
                    >
                      {res.avatar_url ? (
                        <img src={res.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-neon-green/10 text-neon-green flex items-center justify-center font-bold text-[10px] border border-neon-green/20">
                          {(res.username || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-mono text-white/70 truncate group-hover:text-neon-green transition-colors">@{res.username}</span>
                    </Link>
                    {sentRequests.has(res.id) ? (
                      <span className="text-[10px] font-mono text-white/30 px-2">Sent ✓</span>
                    ) : (
                      <button 
                        onClick={() => sendRequest(res.id)}
                        className="p-1.5 bg-neon-green/10 text-neon-green rounded hover:bg-neon-green/20 transition-colors shrink-0"
                        title="Send Request"
                      >
                        <UserPlus size={14} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                searchQuery && <p className="text-xs text-white/40 text-center">No new users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
