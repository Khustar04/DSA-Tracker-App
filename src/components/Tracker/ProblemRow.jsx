import Badge from '../UI/Badge';

export default function ProblemRow({ problem, isSolved, onToggle, onOpenNote, monthColor, index }) {
  return (
    <div
      className={`flex items-center gap-3 py-2 px-2 rounded group transition-all duration-200 ${
        isSolved ? 'bg-neon-green/[0.03]' : 'hover:bg-white/[0.02]'
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSolved}
        onChange={onToggle}
        className="custom-checkbox flex-shrink-0"
        id={`problem-${problem.id}`}
      />

      {/* Problem Name */}
      <span
        className={`flex-1 text-xs font-mono truncate transition-colors duration-200 ${
          isSolved ? 'text-white/40 line-through' : 'text-white/80'
        }`}
      >
        {problem.name}
      </span>

      {/* Badge */}
      <Badge difficulty={problem.difficulty} />

      {/* LeetCode Number */}
      <span className="text-[10px] font-mono text-white/20 w-8 text-right hidden sm:block">
        #{problem.leetcode}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
        {/* LeetCode Link */}
        <a
          href={problem.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-white/30 hover:text-neon-green transition-colors"
          title="Open on LeetCode"
          id={`link-${problem.id}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* Note Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenNote(); }}
          className="p-1 text-white/30 hover:text-medium transition-colors"
          title="Add note"
          id={`note-${problem.id}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
