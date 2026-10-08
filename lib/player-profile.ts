import { DEFAULT_PLAYER, CURRICULUM_LEVEL_COUNT } from '../components/database-city-data';
import { validWeeklyScores } from './weekly-scores';
import { RequestError } from './request-error';

export function cleanProfile(input: any, username: string, name: string) {
  const integer = (value: unknown, max: number) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max ? Number(value) : 0;
  const completedLevels = Array.from(new Set<number>((Array.isArray(input?.completedLevels) ? input.completedLevels : []).filter((v: unknown) => Number.isInteger(v) && Number(v) >= 1 && Number(v) <= CURRICULUM_LEVEL_COUNT))).sort((a, b) => a - b);
  if (completedLevels.some((level, index) => level !== index + 1)) throw new RequestError('ข้อมูลด่านไม่ถูกต้อง');
  const character = { ...DEFAULT_PLAYER.character };
  for (const key of ['skin', 'hair', 'outfit'] as const) {
    if (/^#[0-9a-f]{6}$/i.test(input?.character?.[key])) character[key] = input.character[key];
  }
  if (['sherlock', 'cap', 'headband', 'none'].includes(input?.character?.hat)) character.hat = input.character.hat;
  if (['magnifier', 'file', 'badge'].includes(input?.character?.tool)) character.tool = input.character.tool;
  const { password: _password, ...defaults } = DEFAULT_PLAYER;
  let weeklyScores;
  try { weeklyScores = validWeeklyScores(input?.weeklyScores, CURRICULUM_LEVEL_COUNT); }
  catch { throw new RequestError('ข้อมูลคะแนนรายสัปดาห์ไม่ถูกต้อง'); }
  const answerStats = { correct: integer(input?.answerStats?.correct, 1000000), incorrect: integer(input?.answerStats?.incorrect, 1000000) };
  const weeklyTotals = Object.values(weeklyScores).reduce((sum, score) => ({ correct: sum.correct + score.correct, incorrect: sum.incorrect + score.incorrect }), { correct: 0, incorrect: 0 });
  if (weeklyTotals.correct > answerStats.correct || weeklyTotals.incorrect > answerStats.incorrect) throw new RequestError('คะแนนรายสัปดาห์เกินคะแนนรวม');
  return {
    ...defaults, username, name, character, completedLevels,
    level: Math.min(CURRICULUM_LEVEL_COUNT, completedLevels.length + 1), xp: completedLevels.length * 100,
    coins: 100 + completedLevels.length * 35,
    badges: completedLevels.map(level => `BADGE LV.${String(level).padStart(2, '0')}`),
    inventory: [...DEFAULT_PLAYER.inventory, ...completedLevels.map(level => `📜 Case Solved Doc #${level}`)],
    answerStats, weeklyScores,
  };
}

