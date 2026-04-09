import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export default function StepAccordion({ step, title, problems, progress, onToggleProblem }) {
  const [isOpen, setIsOpen] = useState(false);

  const solvedCount = problems.filter(p => progress[p.id]).length;
  const totalCount = problems.length;
  const isCompleted = solvedCount === totalCount && totalCount > 0;

  return (
    <div className="mb-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all duration-300">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-mono text-sm">
            {step}
          </div>
          <div>
            <h3 className="font-semibold text-white/90">{title}</h3>
            <p className="text-xs text-white/50 font-mono mt-1">
              {solvedCount} / {totalCount} Problems Solved
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress ring/bar or simple text */}
          <div className="hidden sm:block w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${isCompleted ? 'bg-neon-green' : 'bg-neon-green/60'}`}
              style={{ width: `${totalCount === 0 ? 0 : (solvedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-white/50">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/5 p-2 bg-black/20">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-white/40 font-mono border-b border-white/5">
                <th className="py-2 px-4 font-normal w-12">Status</th>
                <th className="py-2 px-4 font-normal">Problem</th>
                <th className="py-2 px-4 font-normal w-24">Difficulty</th>
                <th className="py-2 px-4 font-normal w-24">Link</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => {
                const isSolved = progress[problem.id];
                return (
                  <tr key={problem.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleProblem(problem.id, !isSolved)}
                        className="text-white/50 hover:text-neon-green transition-colors focus:outline-none flex items-center justify-center p-1 rounded-full"
                      >
                        {isSolved ? (
                          <CheckCircle2 size={22} className="text-neon-green" fill="rgba(8, 255, 8, 0.1)" />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-white/80">
                      {isSolved ? <span className="line-through text-white/40">{problem.title}</span> : problem.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        problem.difficulty === 'Easy' ? 'border-green-400/30 text-green-400 bg-green-400/10' :
                        problem.difficulty === 'Medium' ? 'border-yellow-400/30 text-yellow-400 bg-yellow-400/10' :
                        'border-red-400/30 text-red-400 bg-red-400/10'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                        title="Solve Problem"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
