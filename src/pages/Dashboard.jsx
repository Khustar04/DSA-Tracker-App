import { useMemo } from 'react';
import { DSA_DATA, QUOTES } from '../data/dsaProblems';
import { useProgress } from '../hooks/useProgress';
import ProgressRing from '../components/Dashboard/ProgressRing';
import StatsCard from '../components/Dashboard/StatsCard';
import MonthCard from '../components/Dashboard/MonthCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    totalSolved,
    totalProblems,
    overallPercentage,
    streak,
    todayCount,
    loading,
    migrating,
    getMonthProgress,
    getCurrentWeek,
  } = useProgress();

  const currentWeek = getCurrentWeek();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

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

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          Dashboard
        </h1>
        <p className="text-xs font-mono text-white/30 mt-1">
          Your DSA progress at a glance
        </p>
      </div>

      {/* Top Section: Ring + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Ring Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center lg:row-span-2">
          <ProgressRing percentage={overallPercentage} />
          <div className="text-center mt-4">
            <span className="text-sm font-mono text-white/60">
              <span className="text-neon-green font-bold">{totalSolved}</span>
              <span className="text-white/30"> / </span>
              <span>{totalProblems}</span>
            </span>
            <p className="text-[10px] font-mono text-white/20 mt-0.5">problems solved</p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCard
          icon="🎯"
          label="Total Solved"
          value={totalSolved}
          sublabel={`out of ${totalProblems}`}
          color="#00ff88"
        />
        <StatsCard
          icon="📅"
          label="Today's Count"
          value={todayCount}
          sublabel="problems today"
          color="#06b6d4"
        />
        <StatsCard
          icon="🔥"
          label="Current Streak"
          value={`${streak.current}d`}
          sublabel={`longest: ${streak.longest}d`}
          color="#f59e0b"
        />
        <StatsCard
          icon="📊"
          label="Completion"
          value={`${overallPercentage}%`}
          sublabel="overall progress"
          color="#a855f7"
        />
      </div>

      {/* Continue Where You Left Off */}
      {currentWeek && (
        <div className="glass-card p-4 border-l-2" style={{ borderLeftColor: currentWeek.monthColor }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                Continue where you left off
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

      {/* Month Grid */}
      <div>
        <h2 className="text-sm font-display font-semibold text-white/60 mb-3 uppercase tracking-wider">
          Monthly Progress
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
