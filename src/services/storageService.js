// ═══════════════════════════════════════════════════════════
// STORAGE SERVICE — UNIFIED ABSTRACTION LAYER
// ═══════════════════════════════════════════════════════════
// This service routes data operations:
//   • Authenticated user → Supabase (cloud sync)
//   • No auth / offline  → localStorage (local only)
//
// All components call this service. They never touch
// localStorage or Supabase directly.
// ═══════════════════════════════════════════════════════════

import supabaseService from './supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

// ─── localStorage helpers (fallback) ───────────────────────
const KEYS = {
  SOLVED: 'dsa_tracker_solved',
  NOTES: 'dsa_tracker_notes',
  STREAK: 'dsa_tracker_streak',
  LAST_ACTIVE: 'dsa_tracker_last_active',
  SOLVE_HISTORY: 'dsa_tracker_solve_history',
};

function localGet(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function localSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail
  }
}

// ─── Local-only implementations ────────────────────────────
const localService = {
  getSolvedProblems: () => localGet(KEYS.SOLVED) || {},

  saveSolvedProblems: (data) => { localSet(KEYS.SOLVED, data); return true; },

  toggleProblem: (problemId) => {
    const solved = localService.getSolvedProblems();
    if (solved[problemId]) {
      delete solved[problemId];
    } else {
      solved[problemId] = {
        solvedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      };
    }
    localService.saveSolvedProblems(solved);
    localService.updateStreak();
    localService.updateSolveHistory(problemId, !!solved[problemId]);
    return solved;
  },

  getNotes: () => localGet(KEYS.NOTES) || {},

  saveNote: (problemId, note) => {
    const notes = localService.getNotes();
    notes[problemId] = { text: note, updatedAt: new Date().toISOString() };
    localSet(KEYS.NOTES, notes);
    return true;
  },

  deleteNote: (problemId) => {
    const notes = localService.getNotes();
    delete notes[problemId];
    localSet(KEYS.NOTES, notes);
    return true;
  },

  getNote: (problemId) => {
    const notes = localService.getNotes();
    return notes[problemId] || null;
  },

  getStreak: () => localGet(KEYS.STREAK) || { current: 0, longest: 0, lastDate: null },

  updateStreak: () => {
    const streak = localService.getStreak();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (streak.lastDate === today) return streak;
    if (streak.lastDate === yesterday) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }
    streak.lastDate = today;
    streak.longest = Math.max(streak.current, streak.longest);
    localSet(KEYS.STREAK, streak);
    return streak;
  },

  updateSolveHistory: (problemId, isSolved) => {
    const history = localGet(KEYS.SOLVE_HISTORY) || {};
    const today = new Date().toISOString().split('T')[0];
    if (!history[today]) history[today] = [];
    if (isSolved) {
      if (!history[today].includes(problemId)) history[today].push(problemId);
    } else {
      history[today] = history[today].filter(id => id !== problemId);
    }
    localSet(KEYS.SOLVE_HISTORY, history);
    return history;
  },

  getTodayCount: () => {
    const history = localGet(KEYS.SOLVE_HISTORY) || {};
    const today = new Date().toISOString().split('T')[0];
    return history[today] ? history[today].length : 0;
  },
};

// ═══════════════════════════════════════════════════════════
// UNIFIED STORAGE SERVICE (exported)
// ═══════════════════════════════════════════════════════════
// The useProgress hook sets the userId when user authenticates.
// If userId is set → Supabase. If null → localStorage.
// ═══════════════════════════════════════════════════════════

let _userId = null;

const storageService = {
  // Called by useProgress when auth state changes
  setUserId: (userId) => { _userId = userId; },
  getUserId: () => _userId,
  isCloudMode: () => !!_userId && isSupabaseConfigured(),

  // ─── Solved Problems ──────────────────────────────────
  getSolvedProblems: async () => {
    if (storageService.isCloudMode()) {
      return supabaseService.getSolvedProblems(_userId);
    }
    return localService.getSolvedProblems();
  },

  toggleProblem: async (problemId, currentlySolved) => {
    if (storageService.isCloudMode()) {
      await supabaseService.toggleProblem(_userId, problemId, currentlySolved);
      await supabaseService.updateStreak(_userId);
      await supabaseService.updateSolveHistory(_userId, problemId, !currentlySolved);
      return supabaseService.getSolvedProblems(_userId);
    }
    return localService.toggleProblem(problemId);
  },

  // ─── Notes ────────────────────────────────────────────
  getNotes: async () => {
    if (storageService.isCloudMode()) {
      return supabaseService.getNotes(_userId);
    }
    return localService.getNotes();
  },

  saveNote: async (problemId, text) => {
    if (storageService.isCloudMode()) {
      return supabaseService.saveNote(_userId, problemId, text);
    }
    return localService.saveNote(problemId, text);
  },

  deleteNote: async (problemId) => {
    if (storageService.isCloudMode()) {
      return supabaseService.deleteNote(_userId, problemId);
    }
    return localService.deleteNote(problemId);
  },

  getNote: async (problemId) => {
    if (storageService.isCloudMode()) {
      const notes = await supabaseService.getNotes(_userId);
      return notes[problemId] || null;
    }
    return localService.getNote(problemId);
  },

  // ─── Streak ───────────────────────────────────────────
  getStreak: async () => {
    if (storageService.isCloudMode()) {
      return supabaseService.getStreak(_userId);
    }
    return localService.getStreak();
  },

  updateStreak: async () => {
    if (storageService.isCloudMode()) {
      return supabaseService.updateStreak(_userId);
    }
    return localService.updateStreak();
  },

  // ─── Solve History ────────────────────────────────────
  getTodayCount: async () => {
    if (storageService.isCloudMode()) {
      return supabaseService.getTodayCount(_userId);
    }
    return localService.getTodayCount();
  },

  // ─── Reset ────────────────────────────────────────────
  resetAll: () => {
    try {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  },
};

export default storageService;
