// ═══════════════════════════════════════════════════════════
// MIGRATION SERVICE — localStorage → Supabase
// ═══════════════════════════════════════════════════════════
// Runs once on first login. Checks if local data exists and
// migrates it to Supabase, then marks migration as complete.
// ═══════════════════════════════════════════════════════════

import supabaseService from './supabaseService';

const MIGRATION_KEY = 'dsa_tracker_migration_done';

const KEYS = {
  SOLVED: 'dsa_tracker_solved',
  NOTES: 'dsa_tracker_notes',
  STREAK: 'dsa_tracker_streak',
  SOLVE_HISTORY: 'dsa_tracker_solve_history',
};

function getLocalData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

const migrationService = {
  // Check if migration has already been performed for this user
  isMigrationDone: (userId) => {
    try {
      const done = localStorage.getItem(`${MIGRATION_KEY}_${userId}`);
      return done === 'true';
    } catch {
      return false;
    }
  },

  // Mark migration as complete for this user
  markMigrationDone: (userId) => {
    try {
      localStorage.setItem(`${MIGRATION_KEY}_${userId}`, 'true');
    } catch {
      // Silently fail
    }
  },

  // Check if there's local data worth migrating
  hasLocalData: () => {
    const solved = getLocalData(KEYS.SOLVED);
    const notes = getLocalData(KEYS.NOTES);
    const streak = getLocalData(KEYS.STREAK);

    const hasSolved = solved && Object.keys(solved).length > 0;
    const hasNotes = notes && Object.keys(notes).length > 0;
    const hasStreak = streak && (streak.current > 0 || streak.longest > 0);

    return hasSolved || hasNotes || hasStreak;
  },

  // Migrate all local data to Supabase
  migrateToSupabase: async (userId) => {
    if (migrationService.isMigrationDone(userId)) {
      console.log('📦 Migration already completed for this user.');
      return { migrated: false, reason: 'already_done' };
    }

    if (!migrationService.hasLocalData()) {
      console.log('📦 No local data to migrate.');
      migrationService.markMigrationDone(userId);
      return { migrated: false, reason: 'no_data' };
    }

    console.log('📦 Starting localStorage → Supabase migration...');

    try {
      // 1. Migrate solved problems
      const solved = getLocalData(KEYS.SOLVED);
      if (solved && Object.keys(solved).length > 0) {
        console.log(`  → Migrating ${Object.keys(solved).length} solved problems...`);
        await supabaseService.bulkUpsertSolved(userId, solved);
      }

      // 2. Migrate notes
      const notes = getLocalData(KEYS.NOTES);
      if (notes && Object.keys(notes).length > 0) {
        console.log(`  → Migrating ${Object.keys(notes).length} notes...`);
        await supabaseService.bulkUpsertNotes(userId, notes);
      }

      // 3. Migrate streak
      const streak = getLocalData(KEYS.STREAK);
      if (streak && (streak.current > 0 || streak.longest > 0)) {
        console.log(`  → Migrating streak data...`);
        await supabaseService.upsertStreak(userId, streak);
      }

      // 4. Migrate solve history
      const history = getLocalData(KEYS.SOLVE_HISTORY);
      if (history && Object.keys(history).length > 0) {
        console.log(`  → Migrating solve history (${Object.keys(history).length} days)...`);
        await supabaseService.bulkUpsertSolveHistory(userId, history);
      }

      migrationService.markMigrationDone(userId);
      console.log('✅ Migration complete!');

      return { migrated: true };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { migrated: false, reason: 'error', error };
    }
  },
};

export default migrationService;
