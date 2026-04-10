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
      else await supabaseService.recordUserActivity(userId, false);
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
      else await supabaseService.recordUserActivity(userId, true);
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
      .maybeSingle();

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
      .maybeSingle();

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
      .maybeSingle();

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

  // ─── Striver Progress ────────────────────────────────────
  getStriverProgress: async (userId) => {
    const { data, error } = await supabase
      .from('striver_progress')
      .select('problem_id, is_solved')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching striver progress:', error);
      return {};
    }

    const progress = {};
    (data || []).forEach(row => {
      if (row.is_solved) {
        progress[row.problem_id] = true;
      }
    });
    return progress;
  },

  toggleStriverProblem: async (userId, problemId, isSolved) => {
    const { error } = await supabase
      .from('striver_progress')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        is_solved: isSolved,
        solved_at: isSolved ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,problem_id' });

    if (error) console.error('Error toggling striver problem:', error);
    else await supabaseService.recordUserActivity(userId, isSolved);
  },

  // ─── Custom Sheets ───────────────────────────────────────
  getCustomSheets: async (userId) => {
    const { data, error } = await supabase
      .from('custom_sheets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching custom sheets:', error);
      return [];
    }
    return data;
  },

  createCustomSheet: async (userId, title) => {
    const { data, error } = await supabase
      .from('custom_sheets')
      .insert([{ user_id: userId, title }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating custom sheet:', error);
      return null;
    }
    return data;
  },

  updateCustomSheet: async (userId, sheetId, title) => {
    const { error } = await supabase
      .from('custom_sheets')
      .update({ title })
      .eq('id', sheetId)
      .eq('user_id', userId);

    if (error) console.error('Error updating custom sheet:', error);
  },

  deleteCustomSheet: async (userId, sheetId) => {
    const { error } = await supabase
      .from('custom_sheets')
      .delete()
      .eq('id', sheetId)
      .eq('user_id', userId);
    
    if (error) console.error('Error deleting custom sheet:', error);
  },

  // ─── Custom Sheet Problems ────────────────────────────────
  getCustomSheetProblems: async (userId, sheetId) => {
    const { data, error } = await supabase
      .from('custom_sheet_problems')
      .select('*')
      .eq('sheet_id', sheetId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching custom sheet problems:', error);
      return [];
    }
    return data;
  },

  toggleCustomSheetProblem: async (userId, problemId, isSolved) => {
    const { error } = await supabase
      .from('custom_sheet_problems')
      .update({ is_solved: isSolved })
      .eq('id', problemId)
      .eq('user_id', userId);
    
    if (error) console.error('Error toggling custom sheet problem:', error);
    else await supabaseService.recordUserActivity(userId, isSolved);
  },

  updateCustomSheetProblem: async (userId, problemId, problemData) => {
    const { data, error } = await supabase
      .from('custom_sheet_problems')
      .update(problemData)
      .eq('id', problemId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating custom sheet problem:', error);
      return null;
    }
    return data;
  },

  deleteCustomSheetProblem: async (userId, problemId) => {
    const { error } = await supabase
      .from('custom_sheet_problems')
      .delete()
      .eq('id', problemId)
      .eq('user_id', userId);
    
    if (error) console.error('Error deleting custom sheet problem:', error);
  },

  // Used later by Feature 2
  createCustomSheetProblem: async (userId, sheetId, problemData) => {
    const { data, error } = await supabase
      .from('custom_sheet_problems')
      .insert([{ 
        user_id: userId, 
        sheet_id: sheetId, 
        ...problemData 
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error inserting problem:', error);
      return null;
    }
    return data;
  },

  getCustomProblem: async (problemId) => {
    const { data, error } = await supabase
      .from('custom_sheet_problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching custom problem:', error);
      return null;
    }
    return data;
  },

  // ─── User Stats & Daily Activity (Feature 4 & 5 unified) ────────────────────────────────
  recordUserActivity: async (userId, isSolved) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Update Daily Activity
    const { data: activityData } = await supabase
      .from('daily_activity')
      .select('problems_solved')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .maybeSingle();

    const currentDaily = activityData?.problems_solved || 0;
    const newDaily = isSolved ? currentDaily + 1 : Math.max(0, currentDaily - 1);

    await supabase
      .from('daily_activity')
      .upsert({ user_id: userId, activity_date: today, problems_solved: newDaily }, { onConflict: 'user_id,activity_date' });

    // 2. Update User Stats
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let { current_streak = 0, longest_streak = 0, last_solved_date = null, total_solved = 0 } = statsData || {};

    total_solved = isSolved ? total_solved + 1 : Math.max(0, total_solved - 1);

    if (isSolved) {
      if (last_solved_date === yesterday && newDaily === 1) {
        current_streak += 1; // Unmaintained streak grows
      } else if (last_solved_date !== today) {
        current_streak = 1; // Restart streak
      }
      last_solved_date = today;
      longest_streak = Math.max(current_streak, longest_streak);
    }
    
    // We do not decrement streak immediately if they un-solve, just let it recalculate dynamically or stand.

    await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        current_streak,
        longest_streak,
        last_solved_date,
        total_solved
      }, { onConflict: 'user_id' });
  },

  getUserStats: async (userId) => {
    const { data } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
    return data || { current_streak: 0, longest_streak: 0, last_solved_date: null, total_solved: 0 };
  },

  resetStreak: async (userId) => {
    await supabase.from('user_stats').update({ current_streak: 0 }).eq('user_id', userId);
  },

  getWeeklyActivity: async (userId) => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const dateStr = lastWeek.toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', dateStr)
      .order('activity_date', { ascending: true });
    
    return data || [];
  },

  getAllActivity: async (userId) => {
    const { data } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  },

  // ─── Friendships & Leaderboard (Feature 5 + Auth profile) ────────────────────────────────
  getProfile: async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return data;
  },

  getEmailByUsername: async (username) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return data.email;
  },

  checkUsernameUnique: async (username, currentUserId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    // If no data, it's unique. If data exists but it's the current user, it's okay.
    if (!data) return true;
    return data.id === currentUserId;
  },

  upsertProfile: async (userId, profileData) => {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...profileData });
    if (error) {
      console.error('Error upserting profile:', error);
      throw error; // Let caller handle error 
    }
  },

  uploadAvatar: async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    // Use deterministic filename so re-uploads overwrite the old avatar
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite existing file
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Add cache-busting timestamp so browsers always fetch the latest avatar
    return `${data.publicUrl}?t=${Date.now()}`;
  },

  searchUsers: async (query) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10);
    return data || [];
  },

  sendFriendRequest: async (requesterId, addresseeId) => {
    const { error } = await supabase
      .from('friendships')
      .insert([{ requester_id: requesterId, addressee_id: addresseeId }]);
    if (error) console.error('Error sending friend request:', error);
  },

  getFriendshipStatus: async (currentUserId, targetUserId) => {
    const { data, error } = await supabase
      .from('friendships')
      .select('status')
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (error || !data) return 'none';
    return data.status; // 'pending' | 'accepted' | 'rejected'
  },

  handleFriendRequest: async (requestId, status) => {
    if (status === 'rejected') {
      await supabase.from('friendships').delete().eq('id', requestId);
    } else {
      await supabase.from('friendships').update({ status }).eq('id', requestId);
    }
  },

  getFriendRequests: async (userId) => {
    const { data } = await supabase
      .from('friendships')
      .select('id, status, created_at, requester:requester_id(id, username, avatar_url)')
      .eq('addressee_id', userId)
      .eq('status', 'pending');
    return data || [];
  },

  getFriendsLeaderboard: async (userId) => {
    // Fetch accepted friendships where user is requester OR addressee
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    const friendIds = (friendships || []).map(f => f.requester_id === userId ? f.addressee_id : f.requester_id);
    const allIds = [userId, ...friendIds];

    // Fetch stats & profiles of these users concurrently
    const [statsResponse, profilesResponse] = await Promise.all([
      supabase.from('user_stats').select('user_id, total_solved, current_streak').in('user_id', allIds).order('total_solved', { ascending: false }),
      supabase.from('profiles').select('id, username, avatar_url').in('id', allIds)
    ]);

    const statsData = statsResponse.data;
    const profilesData = profilesResponse.data;

    return (statsData || []).map(stat => {
      const profile = profilesData?.find(p => p.id === stat.user_id) || {};
      return {
        ...stat,
        username: profile.username || 'Unknown',
        avatar_url: profile.avatar_url,
      };
    });
  },

  subscribeToLeaderboard: (userId, callback) => {
    // Subs to user_stats for real-time leaderboard
    return supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_stats' }, () => {
        // Simple approach: When any user_stats updates, refetch the leaderboard.
        // Or we just trigger callback and let component refetch.
        callback();
      })
      .subscribe();
  },

  // ─── Badges & Achievements (Feature 6) ────────────────────────────────
  getBadges: async (userId) => {
    const { data } = await supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', userId);
    return data || [];
  },

  awardBadge: async (userId, badgeId) => {
    const { error } = await supabase.from('user_badges').insert([{ user_id: userId, badge_id: badgeId }]);
    if (error) console.error('Error awarding badge:', error);
  },

  getFriendCount: async (userId) => {
    const { count } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    return count || 0;
  },

  checkAndAwardBadges: async (userId, evaluateFn) => {
    // Collect all data required to check conditions concurrently
    const [stats, daily, friends, striverMap, existing] = await Promise.all([
      supabaseService.getUserStats(userId),
      supabaseService.getAllActivity(userId),
      supabaseService.getFriendCount(userId),
      supabaseService.getStriverProgress(userId),
      supabaseService.getBadges(userId)
    ]);
    
    const striverRows = Object.keys(striverMap).length;
    const existingIds = existing.map(b => b.badge_id);

    const newAwards = evaluateFn(stats, daily, friends, striverRows, existingIds);
    for (const badge of newAwards) {
      await supabaseService.awardBadge(userId, badge.id);
    }
    
    return [
      ...existing, 
      ...newAwards.map(b => ({ badge_id: b.id, earned_at: new Date().toISOString() }))
    ];
  },

  getFriendsBadges: async (userId) => {
    // 1. Get friend IDs
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    const friendIds = (friendships || []).map(f => f.requester_id === userId ? f.addressee_id : f.requester_id);
    if (friendIds.length === 0) return [];

    // 2 & 3. Get profiles and badges concurrently
    const [profilesRes, badgesRes] = await Promise.all([
      supabase.from('profiles').select('id, username').in('id', friendIds),
      supabase.from('user_badges').select('user_id, badge_id, earned_at').in('user_id', friendIds)
    ]);

    const profilesData = profilesRes.data;
    const badgesData = badgesRes.data;

    // 4. Assemble
    return (badgesData || []).map(b => {
      const p = profilesData?.find(prof => prof.id === b.user_id);
      return {
        ...b,
        username: p?.username || 'Unknown'
      };
    });
  }
};

export default supabaseService;
