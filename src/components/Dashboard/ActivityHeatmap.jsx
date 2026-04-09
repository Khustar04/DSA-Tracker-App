import { useMemo } from 'react';

export default function ActivityHeatmap({ activityData = [] }) {
  const heatmapData = useMemo(() => {
    // Generate dates for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const record = activityData.find(a => a.activity_date === dateStr);
      days.push({
        dateStr,
        solved: record ? record.problems_solved : 0
      });
    }
    return days;
  }, [activityData]);

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 1) return 'bg-neon-green/30';
    if (count <= 3) return 'bg-neon-green/60';
    return 'bg-neon-green shadow-[0_0_8px_rgba(8,255,8,0.4)]';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-64 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white/80 mb-4">Monthly Heatmap</h3>
      <div className="flex flex-wrap gap-2">
        {heatmapData.map((day) => (
          <div
            key={day.dateStr}
            title={`${day.dateStr}: ${day.solved} solved`}
            className={`w-5 h-5 rounded-sm transition-colors ${getColor(day.solved)}`}
          />
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
