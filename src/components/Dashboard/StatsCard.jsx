export default function StatsCard({ icon, label, value, sublabel, color = '#00ff88' }) {
  return (
    <div className="glass-card p-4 ambient-glow">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
          <span
            className="text-2xl font-display font-bold mt-1"
            style={{ color }}
          >
            {value}
          </span>
          {sublabel && (
            <span className="text-[10px] font-mono text-white/30 mt-0.5">{sublabel}</span>
          )}
        </div>
        <div
          className="w-10 h-10 rounded flex items-center justify-center text-lg"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
