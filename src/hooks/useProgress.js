// ═══════════════════════════════════════════════════════════
// useProgress — Auth-Aware Progress Hook
// ═══════════════════════════════════════════════════════════
// Loads data from Supabase when logged in, localStorage when not.
// Handles async operations and migration on first login.
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import storageService from '../services/storageService';
import migrationService from '../services/migrationService';
import { DSA_DATA, getTotalProblems } from '../data/dsaProblems';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function useProgress() {
  const [solved, setSolved] = useState({});
  const [notes, setNotes] = useState({});
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null });
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const loadedRef = useRef(false);

  // Get auth state (returns default values when AuthProvider is absent)
  let authState = { user: null, isAuthenticated: false };
  try {
    authState = useAuth();
  } catch {
    // useAuth throws if not inside AuthProvider — use defaults
  }
  const { user, isAuthenticated } = authState;

  // ─── Load all data ───────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Set the userId in storageService for routing
      if (isAuthenticated && user?.id && isSupabaseConfigured()) {
        storageService.setUserId(user.id);

        // Run migration on first login
        if (!migrationService.isMigrationDone(user.id) && migrationService.hasLocalData()) {
          setMigrating(true);
          await migrationService.migrateToSupabase(user.id);
          setMigrating(false);
        }
      } else {
        storageService.setUserId(null);
      }

      const [solvedData, notesData, streakData, todayData] = await Promise.all([
        storageService.getSolvedProblems(),
        storageService.getNotes(),
        storageService.getStreak(),
        storageService.getTodayCount(),
      ]);

      setSolved(solvedData || {});
      setNotes(notesData || {});
      setStreak(streakData || { current: 0, longest: 0, lastDate: null });
      setTodayCount(todayData || 0);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Reload data when auth state changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Toggle problem ──────────────────────────────────────
  const toggleProblem = useCallback(async (problemId) => {
    const currentlySolved = !!solved[problemId];

    // Optimistic update
    setSolved(prev => {
      const next = { ...prev };
      if (currentlySolved) {
        delete next[problemId];
      } else {
        next[problemId] = {
          solvedAt: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
        };
      }
      return next;
    });

    try {
      const newSolved = await storageService.toggleProblem(problemId, currentlySolved);
      setSolved(newSolved || {});

      const [newStreak, newToday] = await Promise.all([
        storageService.getStreak(),
        storageService.getTodayCount(),
      ]);
      setStreak(newStreak);
      setTodayCount(newToday);
    } catch (error) {
      console.error('Error toggling problem:', error);
      // Revert on error
      loadData();
    }
  }, [solved, loadData]);

  // ─── Save note ───────────────────────────────────────────
  const saveNote = useCallback(async (problemId, text) => {
    // Optimistic update
    setNotes(prev => ({
      ...prev,
      [problemId]: { text, updatedAt: new Date().toISOString() },
    }));

    try {
      await storageService.saveNote(problemId, text);
      const freshNotes = await storageService.getNotes();
      setNotes(freshNotes);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, []);

  // ─── Delete note ─────────────────────────────────────────
  const deleteNote = useCallback(async (problemId) => {
    // Optimistic update
    setNotes(prev => {
      const next = { ...prev };
      delete next[problemId];
      return next;
    });

    try {
      await storageService.deleteNote(problemId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  // ─── Get note ────────────────────────────────────────────
  const getNote = useCallback((problemId) => {
    return notes[problemId] || null;
  }, [notes]);

  // ─── Check if a problem is solved ────────────────────────
  const isProblemSolved = useCallback((problemId) => {
    return !!solved[problemId];
  }, [solved]);

  // ─── Total counts ────────────────────────────────────────
  const totalSolved = Object.keys(solved).length;
  const totalProblems = getTotalProblems();
  const overallPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  // ─── Per-month progress ──────────────────────────────────
  const getMonthProgress = useCallback((monthNum) => {
    const month = DSA_DATA.find(m => m.month === monthNum);
    if (!month) return { solved: 0, total: 0, percentage: 0 };

    let monthTotal = 0;
    let monthSolved = 0;

    month.weeks.forEach(week => {
      week.problems.forEach(problem => {
        monthTotal++;
        if (solved[problem.id]) monthSolved++;
      });
    });

    return {
      solved: monthSolved,
      total: monthTotal,
      percentage: monthTotal > 0 ? Math.round((monthSolved / monthTotal) * 100) : 0,
    };
  }, [solved]);

  // ─── Current active week ─────────────────────────────────
  const getCurrentWeek = useCallback(() => {
    for (const month of DSA_DATA) {
      for (const week of month.weeks) {
        const allSolved = week.problems.every(p => solved[p.id]);
        if (!allSolved) {
          return {
            monthNum: month.month,
            monthTitle: month.title,
            weekNum: week.week,
            weekTitle: week.title,
            monthColor: month.color,
            solvedCount: week.problems.filter(p => solved[p.id]).length,
            totalCount: week.problems.length,
          };
        }
      }
    }
    return null;
  }, [solved]);

  return {
    solved,
    notes,
    streak,
    todayCount,
    totalSolved,
    totalProblems,
    overallPercentage,
    loading,
    migrating,
    toggleProblem,
    saveNote,
    deleteNote,
    getNote,
    isProblemSolved,
    getMonthProgress,
    getCurrentWeek,
    reload: loadData,
  };
}
