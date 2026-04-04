import { useState, useEffect, useRef } from 'react';
import Badge from '../UI/Badge';
import Button from '../UI/Button';

export default function NoteModal({ problem, note, onSave, onDelete, onClose }) {
  const [text, setText] = useState(note?.text || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(problem.id, text.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(problem.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card border border-white/10 p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge difficulty={problem.difficulty} />
              <span className="text-[10px] font-mono text-white/30">#{problem.leetcode}</span>
            </div>
            <h3 className="text-sm font-mono font-semibold text-white truncate">
              {problem.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors ml-3"
            id="close-note-modal"
          >
            ✕
          </button>
        </div>

        <div className="gradient-divider mb-4" />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your notes, approach, time complexity, key insights..."
          className="w-full h-40 bg-surface-low rounded p-3 text-xs font-mono text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-neon-green/30 transition-all"
          id="note-textarea"
        />

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div>
            {note && (
              <Button variant="danger" onClick={handleDelete}>
                Delete Note
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
