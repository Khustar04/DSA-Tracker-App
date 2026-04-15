import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';
import { User, ArrowLeft, Trophy, Flame, Target, Users } from 'lucide-react';

// Badge definitions (same as BadgesPage)
const ALL_BADGES = [
  { id: 'first_step', icon: '🌱', title: 'First Step', description: 'Solve first problem' },
  { id: 'on_fire', icon: '🔥', title: 'On Fire', description: '7-day streak' },
  { id: 'century', icon: '💯', title: 'Century', description: 'Solve 100 problems' },
  { id: 'elite_coder', icon: '🏆', title: 'Elite Coder', description: 'Solve 500 problems' },
  { id: 'month_warrior', icon: '📅', title: 'Month Warrior', description: '30-day streak' },
  { id: 'speed_coder', icon: '⚡', title: 'Speed Coder', description: '10 problems in one day' },
  { id: 'dp_wizard', icon: '🤖', title: 'DP Wizard', description: 'Solve 50 DP problems' },
  { id: 'striver_champion', icon: '👑', title: 'Striver Champion', description: 'Complete Striver A2Z' },
  { id: 'social_coder', icon: '🤝', title: 'Social Coder', description: 'Add 5 friends' },
  { id: 'consistency_king', icon: '💪', title: 'Consistency King', description: '14-day daily streak' },
];

export default function PublicProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null); // null | 'none' | 'pending' | 'accepted'

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profile, userStats, userBadges] = await Promise.all([
        supabaseService.getProfile(userId),
        supabaseService.getUserStats(userId),
        supabaseService.getBadges(userId),
      ]);

      setProfileData(profile);
      setStats(userStats);
      setBadges(userBadges);

      // Check friendship status with current user
      if (user && !isOwnProfile) {
        const status = await supabaseService.getFriendshipStatus(user.id, userId);
        setFriendshipStatus(status);
      }
    } catch (err) {
      console.error('Error loading public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user) return;
    await supabaseService.sendFriendRequest(user.id, userId);
    setFriendshipStatus('pending');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white">User Not Found</h1>
          <p className="text-sm text-white/50 mt-2">This profile doesn't exist or has been deleted.</p>
          <Link to="/leaderboard" className="inline-flex mt-5 px-4 py-2 text-xs font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10 transition-colors">
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const earnedBadgeIds = badges.map(b => b.badge_id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link to="/leaderboard" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft size={14} /> Back to Leaderboard
      </Link>

      {/* Profile Header Card */}
      <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-20 bg-neon-green/8 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.full_name}
              className="w-24 h-24 rounded-full border-2 border-neon-green/20 object-cover shadow-[0_0_20px_rgba(0,255,136,0.1)]"
            />
          ) : (
            <div className="w-24 h-24 bg-neon-green/10 rounded-full flex items-center justify-center border-2 border-neon-green/20">
              <User className="text-neon-green" size={40} />
            </div>
          )}

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-display font-bold text-white">{profileData.full_name || 'Anonymous'}</h1>
            <p className="text-sm font-mono text-neon-green/70 mt-1">@{profileData.username}</p>
            {profileData.about && (
              <p className="text-xs text-white/40 font-body mt-2 max-w-sm leading-relaxed">{profileData.about}</p>
            )}
            {(profileData.college_name || profileData.graduation_year) && (
              <p className="text-[11px] text-white/40 font-mono mt-2">
                {profileData.college_name || 'College'} {profileData.graduation_year ? `· Class of ${profileData.graduation_year}` : ''}
              </p>
            )}
            {!!profileData.target_companies?.length && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profileData.target_companies.slice(0, 4).map((company) => (
                  <span key={company} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/60">
                    {company}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && user && (
            <div className="shrink-0">
              {friendshipStatus === 'accepted' ? (
                <span className="px-4 py-2 text-xs font-mono text-neon-green bg-neon-green/10 border border-neon-green/20 rounded-lg flex items-center gap-2">
                  <Users size={14} /> Friends
                </span>
              ) : friendshipStatus === 'pending' ? (
                <span className="px-4 py-2 text-xs font-mono text-white/50 bg-white/5 border border-white/10 rounded-lg">
                  Request Sent
                </span>
              ) : (
                <button
                  onClick={handleSendRequest}
                  className="px-4 py-2 text-xs font-mono text-neon-green bg-neon-green/10 border border-neon-green/20 rounded-lg hover:bg-neon-green/20 transition-colors flex items-center gap-2"
                  id="add-friend-btn"
                >
                  <Users size={14} /> Add Friend
                </button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <Link
              to="/profile"
              className="px-4 py-2 text-xs font-mono text-white/50 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Target size={18} className="text-neon-green" />, value: stats?.total_solved || 0, label: 'Total Solved' },
          { icon: <Flame size={18} className="text-orange-400" />, value: stats?.current_streak || 0, label: 'Current Streak' },
          { icon: <Flame size={18} className="text-yellow-400" />, value: stats?.longest_streak || 0, label: 'Longest Streak' },
          { icon: <Trophy size={18} className="text-purple-400" />, value: earnedBadgeIds.length, label: 'Badges Earned' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <div className="text-xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-display font-semibold text-white/60 uppercase tracking-wider mb-4">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`text-center p-3 rounded-xl border transition-all duration-300 ${
                  earned
                    ? 'bg-neon-green/5 border-neon-green/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]'
                    : 'bg-white/[0.02] border-white/5 opacity-40 grayscale'
                }`}
              >
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <span className="text-[9px] font-mono text-white/60 block">{badge.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Since */}
      <div className="text-center">
        <p className="text-[10px] font-mono text-white/20">
          Member since {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
        </p>
      </div>
    </div>
  );
}
