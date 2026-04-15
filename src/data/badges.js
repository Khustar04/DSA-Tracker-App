const hasComebackDay = (daily) => {
  const sorted = [...daily]
    .filter((d) => d.problems_solved > 0)
    .sort((a, b) => a.activity_date.localeCompare(b.activity_date));
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1].activity_date}T00:00:00`);
    const curr = new Date(`${sorted[i].activity_date}T00:00:00`);
    const gap = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (gap > 1) return true;
  }
  return false;
};

const hasWeekendPair = (daily) => {
  const solvedDates = new Set(
    daily.filter((d) => d.problems_solved > 0).map((d) => d.activity_date)
  );
  for (const dateStr of solvedDates) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (date.getDay() === 6) {
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 1);
      const sundayStr = sunday.toISOString().split('T')[0];
      if (solvedDates.has(sundayStr)) return true;
    }
  }
  return false;
};

const hasSteadyWeek = (daily) => {
  const solvedDates = new Set(
    daily.filter((d) => d.problems_solved > 0).map((d) => d.activity_date)
  );
  const dates = [...solvedDates].sort();
  if (dates.length < 5) return false;

  for (let i = 0; i < dates.length; i++) {
    const start = new Date(`${dates[i]}T00:00:00`);
    let count = 0;
    for (let j = i; j < dates.length; j++) {
      const curr = new Date(`${dates[j]}T00:00:00`);
      const gap = Math.round((curr.getTime() - start.getTime()) / 86400000);
      if (gap > 6) break;
      count += 1;
      if (count >= 5) return true;
    }
  }
  return false;
};

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
  { id: 'comeback_coder', name: 'Comeback Coder', icon: '🔁', description: 'Solve again after a missed day', requirement: 'Return after break', condition: (stats, daily) => hasComebackDay(daily) },
  { id: 'weekend_warrior', name: 'Weekend Warrior', icon: '📆', description: 'Solve on both Saturday and Sunday', requirement: 'Sat + Sun streak', condition: (stats, daily) => hasWeekendPair(daily) },
  { id: 'steady_week', name: 'Steady Week', icon: '🧭', description: 'Solve on 5 days within a week', requirement: '5 active days/7', condition: (stats, daily) => hasSteadyWeek(daily) },
];
