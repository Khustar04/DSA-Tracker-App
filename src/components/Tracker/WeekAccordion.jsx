import { useState, useRef, useEffect } from 'react';
import ProblemRow from './ProblemRow';

export default function WeekAccordion({ week, monthColor, solved, onToggleProblem, onOpenNote, filter, defaultOpen = false, index }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const solvedCount = week.problems.filter(p => solved[p.id]).length;
  const totalCount = week.problems.length;
  const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Filter problems
  const filteredProblems = week.problems.filter(problem => {
    if (filter === 'All') return true;
    if (filter === 'Solved') return solved[problem.id];
    if (filter === 'Unsolved') return !solved[problem.id];
    return problem.difficulty === filter;
  });

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, filteredProblems.length]);

  if (filteredProblems.length === 0 && filter !== 'All') return null;

  return (
    <div
      className="glass-card-static overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
        id={`week-${week.week}-accordion`}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono transition-transform duration-300"
            style={{
              color: monthColor,
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▸
          </span>
          <div className="text-left">
            <span className="text-xs font-mono font-medium text-white/80">
              Week {week.week}: {week.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/30">
            {solvedCount}/{totalCount}
          </span>
          {/* Mini progress bar */}
          <div className="w-16 h-1.5 rounded-full bg-surface-lowest overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: monthColor,
                boxShadow: percentage > 0 ? `0 0 4px ${monthColor}40` : 'none',
              }}
            />
          </div>
          {percentage === 100 && (
            <span className="text-neon-green text-xs">✓</span>
          )}
        </div>
      </button>

      {/* Content */}
      <div
        ref={contentRef}
        className="accordion-content"
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-3 space-y-0.5">
          <div className="gradient-divider mb-2" />
          {filteredProblems.map((problem, idx) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              isSolved={!!solved[problem.id]}
              onToggle={() => onToggleProblem(problem.id)}
              onOpenNote={() => onOpenNote(problem)}
              monthColor={monthColor}
              index={idx}
            />
          ))}
          {filteredProblems.length === 0 && (
            <p className="text-xs font-mono text-white/20 py-3 text-center">
              No problems match the current filter
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
