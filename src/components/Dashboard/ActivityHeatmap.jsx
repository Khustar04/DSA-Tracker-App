import { useMemo } from 'react';

export default function ActivityHeatmap({ activityData = [] }) {
  const heatmapData = useMemo(() => {
    // GitHub-style: last 12 weeks (84 days)
    const today = new Date();
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const record = activityData.find(a => a.activity_date === dateStr);
      days.push({
        dateStr,
        solved: record ? record.problems_solved : 0,
      });
    }
    return days;
  }, [activityData]);

  const weeks = useMemo(() => {
    const buckets = [];
    heatmapData.forEach((day, idx) => {
      const weekIndex = Math.floor(idx / 7);
      if (!buckets[weekIndex]) buckets[weekIndex] = [];
      buckets[weekIndex].push(day);
    });
    return buckets;
  }, [heatmapData]);

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 1) return 'bg-neon-green/30';
    if (count <= 3) return 'bg-neon-green/60';
    return 'bg-neon-green shadow-[0_0_8px_rgba(8,255,8,0.4)]';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-[280px] overflow-x-auto">
      <h3 className="text-sm font-semibold text-white/80 mb-4">Activity Heatmap (Last 12 Weeks)</h3>
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${day.solved} solved`}
                className={`w-3.5 h-3.5 rounded-[3px] transition-colors ${getColor(day.solved)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-[10px] text-white/40 font-mono">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-neon-green/30" />
        <div className="w-3 h-3 rounded-sm bg-neon-green/60" />
        <div className="w-3 h-3 rounded-sm bg-neon-green" />
        <span>More</span>
      </div>
    </div>
  );
}
