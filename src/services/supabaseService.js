// ═══════════════════════════════════════════════════════════
// SUPABASE DATA SERVICE — Cloud Storage Layer
// ═══════════════════════════════════════════════════════════
// This service handles all Supabase database operations.
// It mirrors the storageService API but uses Supabase tables.
// ═══════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase';

const supabaseService = {
  // ─── Solved Problems ─────────────────────────────────────
  getSolvedProblems: async (userId) => {
    const { data, error } = await supabase
      .from('solved_problems')
      .select('problem_id, solved_at, solved_date')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching solved problems:', error);
      return {};
    }

    const solved = {};
    (data || []).forEach(row => {
      solved[row.problem_id] = {
        solvedAt: row.solved_at,
        date: row.solved_date,
      };
    });
    return solved;
  },

  toggleProblem: async (userId, problemId, currentlySolved) => {
    if (currentlySolved) {
      // Un-solve: delete the row
      const { error } = await supabase
        .from('solved_problems')
        .delete()
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (error) console.error('Error un-solving problem:', error);
    } else {
      // Solve: upsert the row
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      const { error } = await supabase
        .from('solved_problems')
        .upsert({
          user_id: userId,
          problem_id: problemId,
          solved_at: now,
          solved_date: today,
        }, { onConflict: 'user_id,problem_id' });

      if (error) console.error('Error solving problem:', error);
    }
  },

  // Batch upsert for migration
  bulkUpsertSolved: async (userId, solvedMap) => {
    const rows = Object.entries(solvedMap).map(([problemId, data]) => ({
      user_id: userId,
      problem_id: problemId,
      solved_at: data.solvedAt || new Date().toISOString(),
      solved_date: data.date || new Date().toISOString().split('T')[0],
    }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from('solved_problems')
      .upsert(rows, { onConflict: 'user_id,problem_id' });

    if (error) console.error('Error bulk upserting solved:', error);
  },

  // ─── Notes ───────────────────────────────────────────────
  getNotes: async (userId) => {
    const { data, error } = await supabase
      .from('notes')
      .select('problem_id, text, updated_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching notes:', error);
      return {};
    }

    const notes = {};
    (data || []).forEach(row => {
      notes[row.problem_id] = {
        text: row.text,
        updatedAt: row.updated_at,
      };
    });
    return notes;
  },

  saveNote: async (userId, problemId, text) => {
    const { error } = await supabase
      .from('notes')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        text: text,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,problem_id' });

    if (error) console.error('Error saving note:', error);
    return !error;
  },

  deleteNote: async (userId, problemId) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('problem_id', problemId);

    if (error) console.error('Error deleting note:', error);
    return !error;
  },

  // Batch upsert for migration
  bulkUpsertNotes: async (userId, notesMap) => {
    const rows = Object.entries(notesMap).map(([problemId, data]) => ({
      user_id: userId,
      problem_id: problemId,
      text: data.text,
      updated_at: data.updatedAt || new Date().toISOString(),
    }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from('notes')
      .upsert(rows, { onConflict: 'user_id,problem_id' });

    if (error) console.error('Error bulk upserting notes:', error);
  },

  // ─── Streak ──────────────────────────────────────────────
  getStreak: async (userId) => {
    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_date')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine for new users
      console.error('Error fetching streak:', error);
    }

    if (!data) return { current: 0, longest: 0, lastDate: null };

    return {
      current: data.current_streak || 0,
      longest: data.longest_streak || 0,
      lastDate: data.last_date || null,
    };
  },

  updateStreak: async (userId) => {
    const current = await supabaseService.getStreak(userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (current.lastDate === today) {
      return current;
    }

    let newCurrent;
    if (current.lastDate === yesterday) {
      newCurrent = current.current + 1;
    } else {
      newCurrent = 1;
    }

    const newLongest = Math.max(newCurrent, current.longest);

    const { error } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_date: today,
      }, { onConflict: 'user_id' });

    if (error) console.error('Error updating streak:', error);

    return { current: newCurrent, longest: newLongest, lastDate: today };
  },

  // Upsert streak for migration
  upsertStreak: async (userId, streakData) => {
    const { error } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: streakData.current || 0,
        longest_streak: streakData.longest || 0,
        last_date: streakData.lastDate || null,
      }, { onConflict: 'user_id' });

    if (error) console.error('Error upserting streak:', error);
  },

  // ─── Solve History (today's count) ───────────────────────
  getSolveHistory: async (userId) => {
    const { data, error } = await supabase
      .from('solve_history')
      .select('solve_date, problem_ids')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching solve history:', error);
      return {};
    }

    const history = {};
    (data || []).forEach(row => {
      history[row.solve_date] = row.problem_ids || [];
    });
    return history;
  },

  updateSolveHistory: async (userId, problemId, isSolved) => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch current day's record
    const { data } = await supabase
      .from('solve_history')
      .select('problem_ids')
      .eq('user_id', userId)
      .eq('solve_date', today)
      .single();

    let problemIds = data?.problem_ids || [];

    if (isSolved) {
      if (!problemIds.includes(problemId)) {
        problemIds.push(problemId);
      }
    } else {
      problemIds = problemIds.filter(id => id !== problemId);
    }

    const { error } = await supabase
      .from('solve_history')
      .upsert({
        user_id: userId,
        solve_date: today,
        problem_ids: problemIds,
      }, { onConflict: 'user_id,solve_date' });

    if (error) console.error('Error updating solve history:', error);
  },

  getTodayCount: async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('solve_history')
      .select('problem_ids')
      .eq('user_id', userId)
      .eq('solve_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today count:', error);
    }

    return data?.problem_ids?.length || 0;
  },

  // Bulk upsert for migration
  bulkUpsertSolveHistory: async (userId, historyMap) => {
    const rows = Object.entries(historyMap).map(([date, problemIds]) => ({
      user_id: userId,
      solve_date: date,
      problem_ids: problemIds,
    }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from('solve_history')
      .upsert(rows, { onConflict: 'user_id,solve_date' });

    if (error) console.error('Error bulk upserting solve history:', error);
  },
};

export default supabaseService;
