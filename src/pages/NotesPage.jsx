import { useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { getAllProblems } from '../data/dsaProblems';
import Badge from '../components/UI/Badge';
import NoteModal from '../components/Notes/NoteModal';

export default function NotesPage() {
  const { notes, loading, saveNote, deleteNote, getNote } = useProgress();
  const [editingProblem, setEditingProblem] = useState(null);
  const allProblems = getAllProblems();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Notes</h1>
          <p className="text-xs font-mono text-white/30 mt-1">Loading notes...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse h-32">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
              <div className="h-2 bg-white/5 rounded w-full mb-2" />
              <div className="h-2 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get problems that have notes
  const problemsWithNotes = allProblems.filter(p => notes[p.id]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          My Notes
        </h1>
        <p className="text-xs font-mono text-white/30 mt-1">
          All your problem notes in one place · {problemsWithNotes.length} notes
        </p>
      </div>

      {/* Notes Grid */}
      {problemsWithNotes.length === 0 ? (
        <div className="glass-card-static p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-sm font-mono font-semibold text-white/60">No notes yet</h3>
          <p className="text-xs font-mono text-white/30 mt-1 max-w-sm mx-auto">
            Start adding notes to problems from the Tracker page. Notes help you remember your approach and key insights.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {problemsWithNotes.map((problem, idx) => {
            const note = notes[problem.id];
            return (
              <div
                key={problem.id}
                className="glass-card p-4 ambient-glow"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge difficulty={problem.difficulty} />
                      <span className="text-[10px] font-mono text-white/20">#{problem.leetcode}</span>
                    </div>
                    <h3 className="text-xs font-mono font-semibold text-white truncate">
                      {problem.name}
                    </h3>
                    <span className="text-[9px] font-mono text-white/20">
                      M{problem.monthNum} W{problem.weekNum} · {problem.weekTitle}
                    </span>
                  </div>
                </div>

                <div className="gradient-divider my-2" />

                {/* Note Text */}
                <p className="text-xs font-body text-white/50 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {note.text}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[9px] font-mono text-white/15">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProblem(problem)}
                      className="text-[10px] font-mono text-white/30 hover:text-neon-green transition-colors"
                      id={`edit-note-${problem.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(problem.id)}
                      className="text-[10px] font-mono text-white/30 hover:text-hard transition-colors"
                      id={`delete-note-${problem.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingProblem && (
        <NoteModal
          problem={editingProblem}
          note={getNote(editingProblem.id)}
          onSave={saveNote}
          onDelete={deleteNote}
          onClose={() => setEditingProblem(null)}
        />
      )}
    </div>
  );
}
