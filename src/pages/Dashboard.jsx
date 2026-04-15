import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabaseService from '../services/supabaseService';
import { DSA_DATA, QUOTES } from '../data/dsaProblems';
import { useProgress } from '../hooks/useProgress';
import ProgressRing from '../components/Dashboard/ProgressRing';
import StatsCard from '../components/Dashboard/StatsCard';
import MonthCard from '../components/Dashboard/MonthCard';
import WeeklyChart from '../components/Dashboard/WeeklyChart';
import ActivityHeatmap from '../components/Dashboard/ActivityHeatmap';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  
  // 143-list progress details
  const {
    loading: progressLoading,
    migrating,
    getMonthProgress,
    getCurrentWeek,
  } = useProgress();

  const currentWeek = getCurrentWeek();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Global Unified Stats
  const [stats, setStats] = useState({ current_streak: 0, longest_streak: 0, last_solved_date: null, total_solved: 0 });
  const [activity, setActivity] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setDbLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    setDbLoading(true);
    const userStats = await supabaseService.getUserStats(user.id);
    const weeklyOrMonthlyAct = await supabaseService.getAllActivity(user.id);
    setStats(userStats);
    setActivity(weeklyOrMonthlyAct);
    setDbLoading(false);
  };

  const handleResetStreak = async () => {
    if (!user) {
      toast.error('Sign in to reset cloud streak.');
      return;
    }

    if (window.confirm('Are you sure you want to reset your streak? This cannot be undone.')) {
      await supabaseService.resetStreak(user.id);
      setStats(prev => ({ ...prev, current_streak: 0 }));
      toast.success('Streak reset.');
    }
  };

  const loading = progressLoading || dbLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-xs font-mono text-white/30 mt-1">Loading your progress...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card-static p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-24 mb-3" />
              <div className="h-8 bg-white/5 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Migration Banner */}
      {migrating && (
        <div className="glass-card p-4 border border-neon-green/20 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
          <div>
            <p className="text-xs font-mono text-neon-green">Migrating your data to the cloud...</p>
            <p className="text-[9px] font-mono text-white/30">This only happens once</p>
          </div>
        </div>
      )}

      {/* Page Title & Reset Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-xs font-mono text-white/30 mt-1">Your overall coding progress</p>
        </div>
        <button 
          onClick={handleResetStreak} 
          className="px-3 py-1.5 text-xs text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
        >
          Reset Streak
        </button>
      </div>

      {/* Top Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="🎯"
          label="Total Global Solved"
          value={stats.total_solved}
          sublabel="Across all trackers/sheets"
          color="#00ff88"
        />
        <StatsCard
          icon="🔥"
          label="Current Streak"
          value={`${stats.current_streak}d`}
          sublabel="Active consecutive days"
          color="#f59e0b"
        />
        <StatsCard
          icon="🏅"
          label="Longest Streak"
          value={`${stats.longest_streak}d`}
          sublabel="Best run so far"
          color="#facc15"
        />
        <StatsCard
          icon="⭐"
          label="App Milestones"
          value="..."
          sublabel="Check Badges page"
          color="#a855f7"
        />
      </div>

      {/* Charts / Heatmaps Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyChart activityData={activity} />
        <ActivityHeatmap activityData={activity} />
      </div>

      {/* Continue Where You Left Off (143 List) */}
      {currentWeek && (
        <div className="glass-card p-4 border-l-2" style={{ borderLeftColor: currentWeek.monthColor }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                143-List: Continue where you left off
              </span>
              <h3 className="text-sm font-mono font-semibold text-white mt-1">
                Week {currentWeek.weekNum}: {currentWeek.weekTitle}
              </h3>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">
                {currentWeek.monthTitle} · {currentWeek.solvedCount}/{currentWeek.totalCount} solved
              </p>
            </div>
            <Link
              to={`/tracker?month=${currentWeek.monthNum}`}
              className="px-3 py-1.5 bg-neon-green/10 text-neon-green text-xs font-mono rounded border border-neon-green/20 hover:bg-neon-green/20 transition-colors"
            >
              Continue →
            </Link>
          </div>
        </div>
      )}

      {/* Month Grid (143 List) */}
      <div>
        <h2 className="text-sm font-display font-semibold text-white/60 mb-3 uppercase tracking-wider">
          143-Step Monthly Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DSA_DATA.map((month, idx) => (
            <MonthCard
              key={month.month}
              month={month}
              progress={getMonthProgress(month.month)}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="glass-card-static p-5 text-center">
        <div className="gradient-divider mb-4" />
        <p className="text-sm font-body text-white/50 italic leading-relaxed">
          "{quote.text}"
        </p>
        <p className="text-[10px] font-mono text-neon-green/40 mt-2">
          — {quote.author}
        </p>
        <div className="gradient-divider mt-4" />
      </div>
    </div>
  );
}
