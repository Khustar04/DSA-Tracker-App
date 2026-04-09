import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyChart({ activityData = [] }) {
  const chartData = useMemo(() => {
    // Generate last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const record = activityData.find(a => a.activity_date === dateStr);
      result.push({
        name: dayName,
        solved: record ? record.problems_solved : 0,
        fullDate: dateStr
      });
    }
    return result;
  }, [activityData]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-[280px] flex flex-col">
      <h3 className="text-sm font-semibold text-white/80 mb-4">Past 7 Days</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
        <BarChart data={chartData}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#00ff88' }}
          />
          <Bar dataKey="solved" fill="#00ff88" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
