import { useState } from 'react';
import WeekAccordion from './WeekAccordion';

export default function MonthView({ month, solved, onToggleProblem, onOpenNote, filter }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Month Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{month.icon}</span>
        <div>
          <h2 className="text-lg font-display font-bold text-white">
            Month {month.month}: {month.title}
          </h2>
          <p className="text-xs font-mono text-white/30">
            {month.weeks.length} weeks · {month.weeks.reduce((t, w) => t + w.problems.length, 0)} problems
          </p>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-2">
        {month.weeks.map((week, idx) => (
          <WeekAccordion
            key={week.week}
            week={week}
            monthColor={month.color}
            solved={solved}
            onToggleProblem={onToggleProblem}
            onOpenNote={onOpenNote}
            filter={filter}
            defaultOpen={idx === 0}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}
