import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DSA_DATA } from '../data/dsaProblems';
import { useProgress } from '../hooks/useProgress';
import MonthView from '../components/Tracker/MonthView';
import NoteModal from '../components/Notes/NoteModal';

const FILTERS = ['All', 'Solved', 'Unsolved', 'Easy', 'Medium', 'Hard'];

export default function TrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = parseInt(searchParams.get('month')) || 1;
  const [activeMonth, setActiveMonth] = useState(initialMonth);
  const [filter, setFilter] = useState('All');
  const [noteModalProblem, setNoteModalProblem] = useState(null);

  const { solved, notes, loading, toggleProblem, saveNote, deleteNote, getNote, getMonthProgress } = useProgress();

  const currentMonthData = DSA_DATA.find(m => m.month === activeMonth);

  const handleMonthChange = (monthNum) => {
    setActiveMonth(monthNum);
    setSearchParams({ month: monthNum.toString() });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Problem Tracker</h1>
          <p className="text-xs font-mono text-white/30 mt-1">Loading your progress...</p>
        </div>
        <div className="flex gap-2 mb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-16 bg-white/5 animate-pulse rounded" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          Problem Tracker
        </h1>
        <p className="text-xs font-mono text-white/30 mt-1">
          Track your progress across all 143 problems
        </p>
      </div>

      {/* Month Tabs */}
      <div className="flex flex-wrap gap-2">
        {DSA_DATA.map(month => {
          const progress = getMonthProgress(month.month);
          const isActive = activeMonth === month.month;
          return (
            <button
              key={month.month}
              onClick={() => handleMonthChange(month.month)}
              className={`relative px-3 py-2 rounded text-xs font-mono transition-all duration-300 border ${
                isActive
                  ? 'border-opacity-30 text-white'
                  : 'border-white/5 text-white/40 hover:text-white/70 hover:border-white/10'
              }`}
              style={isActive ? {
                borderColor: `${month.color}50`,
                background: `${month.color}10`,
                color: month.color,
              } : {}}
              id={`month-tab-${month.month}`}
            >
              <span className="mr-1">{month.icon}</span>
              M{month.month}
              {progress.percentage === 100 && (
                <span className="ml-1 text-neon-green">✓</span>
              )}
              {/* Progress indicator dot */}
              {progress.percentage > 0 && progress.percentage < 100 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: month.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'filter-btn-active' : 'filter-btn'}
            id={`filter-${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Month Content */}
      {currentMonthData && (
        <MonthView
          month={currentMonthData}
          solved={solved}
          onToggleProblem={toggleProblem}
          onOpenNote={(problem) => setNoteModalProblem(problem)}
          filter={filter}
        />
      )}

      {/* Note Modal */}
      {noteModalProblem && (
        <NoteModal
          problem={noteModalProblem}
          note={getNote(noteModalProblem.id)}
          onSave={saveNote}
          onDelete={deleteNote}
          onClose={() => setNoteModalProblem(null)}
        />
      )}
    </div>
  );
}
