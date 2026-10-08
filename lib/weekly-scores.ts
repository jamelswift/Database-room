export type WeeklyScore = { correct: number; incorrect: number };
export type StudentReport = {
  username: string; name: string; completedLevels: number[];
  answerStats: WeeklyScore; weeklyScores: Record<string, WeeklyScore>;
  unassignedAnswers: number; updatedAt: string;
};

export function weeklyChartData(students: StudentReport[], count: number) {
  return Array.from({ length: count }, (_, index) => {
    const week = index + 1;
    let correct = 0;
    let incorrect = 0;
    let recorded = 0;
    let completed = 0;
    for (const student of students) {
      const score = student.weeklyScores[week];
      if (score) { correct += score.correct; incorrect += score.incorrect; recorded += 1; }
      if (student.completedLevels.includes(week)) completed += 1;
    }
    const total = correct + incorrect;
    return { week, correct, incorrect, recorded, completed, total, accuracy: total ? Math.round(correct / total * 10000) / 100 : null };
  });
}

export function allWeeksTotals(students: StudentReport[], count: number) {
  return students.map(student => {
    const weeks = weeklyChartData([student], count);
    const correct = weeks.reduce((sum, week) => sum + week.correct, 0);
    const incorrect = weeks.reduce((sum, week) => sum + week.incorrect, 0);
    const total = correct + incorrect;
    return { username: student.username, name: student.name, correct, incorrect, total,
      recorded: weeks.some(week => week.recorded > 0),
      accuracy: total ? Math.round(correct / total * 10000) / 100 : null };
  }).sort((a, b) => b.correct - a.correct || a.incorrect - b.incorrect || a.username.localeCompare(b.username));
}

export function validWeeklyScores(input: unknown, count: number): Record<string, WeeklyScore> {
  if (input === undefined) return {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID_WEEKLY_SCORES');
  const result: Record<string, WeeklyScore> = {};
  for (const [key, score] of Object.entries(input)) {
    if (!/^\d+$/.test(key) || String(Number(key)) !== key || Number(key) < 1 || Number(key) > count
      || !score || typeof score !== 'object' || Array.isArray(score)
      || !Number.isSafeInteger(score.correct) || score.correct < 0 || score.correct > 1000000
      || !Number.isSafeInteger(score.incorrect) || score.incorrect < 0 || score.incorrect > 1000000) throw new Error('INVALID_WEEKLY_SCORES');
    result[key] = { correct: score.correct, incorrect: score.incorrect };
  }
  return result;
}
