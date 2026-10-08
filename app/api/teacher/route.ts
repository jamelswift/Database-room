import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { cleanProfile, sessionPlayer } from '@/lib/game-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  try {
    const teacher = await sessionPlayer(request.cookies.get('database_city_session')?.value);
    if (!teacher) return json({ error: 'กรุณาเข้าสู่ระบบ' }, 401);
    if (teacher.Role !== 'teacher') return json({ error: 'เฉพาะบัญชีครูเท่านั้น' }, 403);
    const students = (await database.studentRecords()).map(row => {
      const profile = cleanProfile(JSON.parse(row.ProfileJson), row.Username, row.DisplayName);
      const assigned = Object.values(profile.weeklyScores).reduce((sum, score) => sum + score.correct + score.incorrect, 0);
      return {
        username: row.Username, name: row.DisplayName, completedLevels: profile.completedLevels,
        answerStats: { correct: row.CorrectAnswers, incorrect: row.IncorrectAnswers },
        weeklyScores: profile.weeklyScores, unassignedAnswers: row.CorrectAnswers + row.IncorrectAnswers - assigned,
        updatedAt: row.UpdatedAt,
      };
    }).sort((a, b) => a.username.localeCompare(b.username));
    return json({ students });
  } catch {
    console.error('Teacher report failed');
    return json({ error: 'โหลดข้อมูลนักเรียนไม่ได้ กรุณาลองอีกครั้ง' }, 503);
  }
}
