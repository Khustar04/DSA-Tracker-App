export default function ProgressBar({ percentage, color = '#00ff88', height = 'h-2', showLabel = false, className = '' }) {
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-white/50 mb-1">
          <span>Progress</span>
          <span style={{ color }}>{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-surface-lowest overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: percentage > 0 ? `0 0 8px ${color}40` : 'none',
          }}
        />
      </div>
    </div>
  );
}
