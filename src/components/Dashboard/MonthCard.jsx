import { Link } from 'react-router-dom';
import ProgressBar from '../UI/ProgressBar';

export default function MonthCard({ month, progress, index }) {
  return (
    <Link
      to={`/tracker?month=${month.month}`}
      className="glass-card p-4 ambient-glow group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{month.icon}</span>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Month {month.month}
          </span>
          <span className="text-xs font-mono text-white/80 truncate group-hover:text-white transition-colors">
            {month.title}
          </span>
        </div>
      </div>

      <ProgressBar percentage={progress.percentage} color={month.color} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-mono text-white/30">
          {progress.solved}/{progress.total} solved
        </span>
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: month.color }}
        >
          {progress.percentage}%
        </span>
      </div>
    </Link>
  );
}
