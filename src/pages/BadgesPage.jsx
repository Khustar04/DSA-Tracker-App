import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';
import { BADGE_DEFINITIONS } from '../data/badges';
import BadgeCard from '../components/Badges/BadgeCard';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function BadgesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-badges'); // 'my-badges' | 'friends'
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [friendsBadges, setFriendsBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    // 1. Fetch user badges and friend badges concurrently
    const [userBadgesList, friendData] = await Promise.all([
      supabaseService.checkAndAwardBadges(user.id, (stats, daily, friends, striverSize, existingIds) => {
        const newAwards = [];
        for (const def of BADGE_DEFINITIONS) {
          if (!existingIds.includes(def.id) && def.condition(stats, daily, friends, striverSize)) {
            newAwards.push(def);
          }
        }
        return newAwards;
      }),
      supabaseService.getFriendsBadges(user.id)
    ]);

    const prevCount = earnedBadges.length;
    setEarnedBadges(userBadgesList);

    // If new badges unlocking, notify
    if (prevCount > 0 && userBadgesList.length > prevCount) {
      const diff = userBadgesList.length - prevCount;
      toast.success(`Unlocked ${diff} new badge${diff > 1 ? 's' : ''}!`);
    }

    setFriendsBadges(friendData);
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <p className="text-sm text-white/50 mt-2">Sign in to unlock badges and compare with friends.</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <p className="text-sm text-white/50">Unlock badges by hitting milestones.</p>
        </div>
        <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my-badges')}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'my-badges' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            My Badges
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'friends' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            Friends
          </button>
        </div>
      </div>

      {activeTab === 'my-badges' ? (
        <div>
          <div className="mb-6 flex justify-between items-center bg-neon-green/5 border border-neon-green/20 p-4 rounded-xl">
            <span className="text-white/80 text-sm">
              <span className="font-bold text-neon-green text-xl mr-2">{earnedBadges.length}</span> / {BADGE_DEFINITIONS.length} unlocked
            </span>
            <div className="h-2 w-48 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-neon-green" 
                style={{ width: `${(earnedBadges.length / BADGE_DEFINITIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGE_DEFINITIONS.map(badge => {
              const earnedRecord = earnedBadges.find(b => b.badge_id === badge.id);
              return (
                <BadgeCard 
                  key={badge.id}
                  badge={badge}
                  isEarned={!!earnedRecord}
                  earnedAt={earnedRecord?.earned_at}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white/90">Friends' Achievements</h2>
          {friendsBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsBadges.map((fb, i) => {
                const def = BADGE_DEFINITIONS.find(b => b.id === fb.badge_id);
                if (!def) return null;
                return (
                  <div key={i} className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                    <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(8,255,8,0.3)]">{def.icon}</div>
                    <div>
                      <h4 className="text-sm font-bold text-white/90">{def.name}</h4>
                      <p className="text-xs text-white/50">unlocked by <span className="text-neon-green font-mono">@{fb.username}</span></p>
                      <p className="text-[9px] text-white/30 font-mono mt-1">{new Date(fb.earned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Your friends haven't unlocked any badges yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
