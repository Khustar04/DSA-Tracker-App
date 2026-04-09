export const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', icon: '🌱', description: 'Solve your first problem', requirement: '1 problem solved', condition: (stats, daily, friends, striver) => stats.total_solved >= 1 },
  { id: 'on_fire', name: 'On Fire', icon: '🔥', description: 'Achieve a 7-day streak', requirement: '7d streak', condition: (stats, daily, friends, striver) => stats.longest_streak >= 7 },
  { id: 'century', name: 'Century', icon: '💯', description: 'Solve 100 problems globally', requirement: '100 problems', condition: (stats, daily, friends, striver) => stats.total_solved >= 100 },
  { id: 'elite', name: 'Elite Coder', icon: '🏆', description: 'Solve 500 problems globally', requirement: '500 problems', condition: (stats, daily, friends, striver) => stats.total_solved >= 500 },
  { id: 'month_warrior', name: 'Month Warrior', icon: '📅', description: 'Achieve a 30-day streak', requirement: '30d streak', condition: (stats, daily, friends, striver) => stats.longest_streak >= 30 },
  { id: 'speed_coder', name: 'Speed Coder', icon: '⚡', description: 'Solve 10 problems in a single day', requirement: '10 probs/day', condition: (stats, daily, friends, striver) => daily.some(d => d.problems_solved >= 10) },
  { id: 'striver_champ', name: 'Striver Champion', icon: '👑', description: 'Complete full Striver A2Z sheet', requirement: '455/455 Striver', condition: (stats, daily, friends, striver) => striver >= 455 },
  { id: 'social_coder', name: 'Social Coder', icon: '🤝', description: 'Add 5 friends', requirement: '5 friends', condition: (stats, daily, friends, striver) => friends >= 5 },
  { id: 'consistency_king', name: 'Consistency King', icon: '💪', description: 'Solve daily for 14 days', requirement: '14d streak', condition: (stats, daily, friends, striver) => stats.longest_streak >= 14 },
];
