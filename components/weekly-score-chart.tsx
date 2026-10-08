'use client';

import { useId, useState } from 'react';
import { weeklyChartData, type StudentReport } from '@/lib/weekly-scores';
import { CURRICULUM_LEVEL_COUNT } from './database-city-data';

export function WeeklyScoreChart({ students, title, week, onSelectWeek }: {
  students: StudentReport[]; title: string; week: number; onSelectWeek: (week: number) => void;
}) {
  const id = useId();
  const [mode, setMode] = useState<'answers' | 'accuracy'>('answers');
  const points = weeklyChartData(students, CURRICULUM_LEVEL_COUNT);
  const selected = points[week - 1];
  const maximum = mode === 'accuracy' ? 100 : Math.max(1, ...points.flatMap(p => [p.correct, p.incorrect]));
  const scale = (value: number) => value / maximum * 160;
  const hasAnswers = points.some(p => p.total > 0);
  const left = 55;
  const step = 48;
  const baseline = 195;
  return <figure className="my-5 rounded-2xl border border-slate-600 bg-slate-950/70 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <figcaption id={`${id}-title`} className="font-bold text-white">{title}</figcaption>
      <div className="flex gap-2" aria-label="รูปแบบกราฟ">
        <button type="button" aria-pressed={mode === 'answers'} className={`rounded-lg px-3 py-2 text-sm ${mode === 'answers' ? 'bg-sky-700' : 'bg-slate-800'}`} onClick={() => setMode('answers')}>จำนวนคำตอบ</button>
        <button type="button" aria-pressed={mode === 'accuracy'} className={`rounded-lg px-3 py-2 text-sm ${mode === 'accuracy' ? 'bg-sky-700' : 'bg-slate-800'}`} onClick={() => setMode('accuracy')}>ความแม่นยำ (%)</button>
      </div>
    </div>
    <p className="mt-2 text-sm text-slate-400">{mode === 'answers' ? 'สีเขียว = ตอบถูก • สีชมพู = ตอบผิด • หน่วย: ครั้ง' : 'สีฟ้า = ตอบถูก ÷ คำตอบทั้งหมด × 100 • ไม่มีคำตอบจะแสดง —'} • คลิกสัปดาห์เพื่อดูตาราง</p>
    <div className="mt-3 overflow-x-auto">
      <svg viewBox="0 0 850 245" className="w-full min-w-[700px]" role="group" aria-labelledby={`${id}-title`}>
        {[0, 1, 2, 3, 4].map(tick => {
          const value = maximum * tick / 4;
          const y = baseline - scale(value);
          return <g key={tick}><line x1={left - 10} y1={y} x2={825} y2={y} stroke="#334155" /><text x={left - 16} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{mode === 'accuracy' ? `${value}%` : Number(value.toFixed(1))}</text></g>;
        })}
        {points.map((point, index) => {
          const x = left + index * step;
          const active = point.week === week;
          const description = `สัปดาห์ ${point.week}: ${point.recorded ? `ตอบถูก ${point.correct} ครั้ง ตอบผิด ${point.incorrect} ครั้ง` : 'ยังไม่มีคะแนน'} ความแม่นยำ ${point.accuracy === null ? 'ยังไม่มีข้อมูล' : point.accuracy + '%'} ผ่านแบบฝึก ${point.completed} คน`;
          return <g key={point.week} role="button" tabIndex={0} aria-label={description} aria-pressed={active}
            onClick={() => onSelectWeek(point.week)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectWeek(point.week); } }}
            className="cursor-pointer outline-none focus:[&>rect:first-of-type]:stroke-sky-300">
            <title>{description}</title>
            <rect x={x - 5} y={24} width={43} height={196} rx={6} fill={active ? '#0c4a6e' : 'transparent'} stroke={active ? '#38bdf8' : 'transparent'} />
            {mode === 'answers' ? <>
              <rect x={x} y={baseline - scale(point.correct)} width={14} height={scale(point.correct)} rx={2} fill="#34d399" />
              <rect x={x + 17} y={baseline - scale(point.incorrect)} width={14} height={scale(point.incorrect)} rx={2} fill="#fb7185" />
              {!point.recorded && <text x={x + 15} y={baseline - 8} textAnchor="middle" fill="#64748b" fontSize="13">—</text>}
            </> : point.accuracy !== null ? <rect x={x + 4} y={baseline - scale(point.accuracy)} width={23} height={scale(point.accuracy)} rx={3} fill="#38bdf8" />
              : <text x={x + 15} y={baseline - 8} textAnchor="middle" fill="#64748b" fontSize="13">—</text>}
            <text x={x + 15} y={214} textAnchor="middle" fill={active ? '#e0f2fe' : '#cbd5e1'} fontSize="12">{point.week}</text>
          </g>;
        })}
        <text x={435} y={240} textAnchor="middle" fill="#94a3b8" fontSize="12">สัปดาห์บทเรียน</text>
      </svg>
    </div>
    <p aria-live="polite" className="mt-2 text-sm text-slate-200">สัปดาห์ {week} • ตอบถูก {selected.recorded ? selected.correct : '—'} • ตอบผิด {selected.recorded ? selected.incorrect : '—'} • ความแม่นยำ {selected.accuracy === null ? '—' : `${selected.accuracy}%`} • ผ่านแบบฝึก {selected.completed}/{students.length} คน</p>
    {!hasAnswers && <p className="mt-2 text-sm text-amber-200">ยังไม่มีคะแนนที่ระบุสัปดาห์ กราฟจะแสดงเมื่อเด็กเริ่มตอบคำถามใหม่</p>}
    <p className="mt-1 text-xs text-slate-400">รวมการเล่นซ้ำ • ไม่รวมคะแนนเดิมที่ยังไม่ระบุสัปดาห์ • เลื่อนกราฟแนวนอนบนหน้าจอเล็ก</p>
  </figure>;
}
