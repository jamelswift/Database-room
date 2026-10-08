import type { StudentReport } from './weekly-scores';

type Account = {
  username: string;
  name: string;
  answerStats?: { correct?: number; incorrect?: number };
};

function textCell(value: string) {
  // Quoting alone does not prevent spreadsheet formula execution.
  const safe = /^[\s\uFEFF]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function weeklyScoresCsv(students: StudentReport[], weekCount: number) {
  const rows = students.flatMap(student => Array.from({ length: weekCount }, (_, index) => {
    const week = index + 1;
    const score = student.weeklyScores[week];
    const total = score ? score.correct + score.incorrect : 0;
    return [textCell(`${student.username}-week-${week}`), textCell(student.username), textCell(student.name), week,
      score?.correct ?? '', score?.incorrect ?? '', score ? total : '',
      total ? Math.round(score!.correct / total * 10000) / 100 : '',
      student.completedLevels.includes(week) ? 'TRUE' : 'FALSE',
      textCell(student.updatedAt), student.unassignedAnswers].join(',');
  }));
  return '\uFEFF' + ['RecordId,Username,DisplayName,Week,CorrectAnswers,IncorrectAnswers,TotalAnswers,AccuracyPercent,Completed,PlayerUpdatedAt,UnassignedAnswers', ...rows].join('\r\n') + '\r\n';
}

export function scoresCsv(accounts: Account[]) {
  const rows = accounts.map(account => {
    const correct = Number.isSafeInteger(account.answerStats?.correct) && account.answerStats!.correct! >= 0 ? account.answerStats!.correct! : 0;
    const incorrect = Number.isSafeInteger(account.answerStats?.incorrect) && account.answerStats!.incorrect! >= 0 ? account.answerStats!.incorrect! : 0;
    const total = correct + incorrect;
    return { username: account.username, name: account.name, correct, incorrect, total };
  }).sort((a, b) => Number(b.total > 0) - Number(a.total > 0) || b.correct - a.correct || a.incorrect - b.incorrect || a.username.localeCompare(b.username));
  const header = 'Username,DisplayName,CorrectAnswers,IncorrectAnswers,TotalAnswers,AccuracyPercent';
  return '\uFEFF' + [header, ...rows.map(row => [
    textCell(row.username), textCell(row.name), row.correct, row.incorrect, row.total,
    row.total ? Math.round(row.correct / row.total * 10000) / 100 : '',
  ].join(','))].join('\r\n') + '\r\n';
}
