'use client';

import { allWeeksTotals, type StudentReport } from '@/lib/weekly-scores';
import { CURRICULUM_LEVEL_COUNT } from './database-city-data';

export function TotalScoreChart({ students, selected, onSelectStudent }: {
  students: StudentReport[]; selected: string; onSelectStudent: (username: string) => void;
}) {
  const totals = allWeeksTotals(students, CURRICULUM_LEVEL_COUNT);
  const correct = totals.reduce((sum, student) => sum + student.correct, 0);
  const incorrect = totals.reduce((sum, student) => sum + student.incorrect, 0);
  const total = correct + incorrect;
  const maximum = Math.max(1, ...totals.map(student => student.total));
  const hasRecords = totals.some(student => student.recorded);
  return <figure className="my-5 rounded-2xl border border-emerald-800 bg-slate-950/70 p-4">
    <figcaption className="text-lg font-bold text-white">คะแนนรวมทุกสัปดาห์ (1–{CURRICULUM_LEVEL_COUNT})</figcaption>
    <p className="mt-1 text-sm text-slate-400">รวมคะแนนรายสัปดาห์ของนักเรียนที่แสดง {students.length} คน • ไม่เปลี่ยนตามสัปดาห์ที่เลือก</p>
    <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        ['ตอบถูกทั้งหมด', hasRecords ? correct : '—', 'text-emerald-300'],
        ['ตอบผิดทั้งหมด', hasRecords ? incorrect : '—', 'text-rose-300'],
        ['คำตอบทั้งหมด', hasRecords ? total : '—', 'text-white'],
        ['ความแม่นยำรวม', total ? `${Math.round(correct / total * 10000) / 100}%` : '—', 'text-sky-300'],
      ].map(([label, value, color]) => <div key={label} className="rounded-xl bg-slate-800 p-3"><p className="text-sm text-slate-300">{label}</p><p className={`mt-1 text-2xl font-black ${color}`}>{value}</p></div>)}
    </div>
    <p className="mb-3 text-sm text-slate-400">สีเขียว = ตอบถูก • สีชมพู = ตอบผิด • เรียงตามยอดตอบถูก • หน่วย: ครั้ง</p>
    <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
      {totals.map(student => <button key={student.username} type="button" onClick={() => onSelectStudent(student.username)} aria-pressed={selected === student.username}
        aria-label={`${student.name} ${student.username}: ${student.recorded ? `ตอบถูก ${student.correct} ตอบผิด ${student.incorrect}` : 'ยังไม่มีคะแนนรายสัปดาห์'} ดูรายละเอียดนักเรียน`}
        className={`block w-full rounded-xl border p-3 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-sky-300 ${selected === student.username ? 'border-sky-400 bg-sky-950/50' : 'border-slate-700 bg-slate-900/60'}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0"><p className="break-words font-bold text-sky-200">{student.name}</p><p className="text-xs text-slate-400">{student.username}</p></div>
          <p className="text-sm text-slate-200">ถูก <span className="text-emerald-300">{student.recorded ? student.correct : '—'}</span> • ผิด <span className="text-rose-300">{student.recorded ? student.incorrect : '—'}</span> • {student.accuracy === null ? '—' : `${student.accuracy}%`}</p>
        </div>
        <div aria-hidden="true" className="mt-2 flex h-5 overflow-hidden rounded bg-slate-800">
          <span className="h-full bg-emerald-400" style={{ width: `${student.correct / maximum * 100}%` }} />
          <span className="h-full bg-rose-400" style={{ width: `${student.incorrect / maximum * 100}%` }} />
        </div>
        {!student.recorded && <p className="mt-1 text-xs text-slate-400">ยังไม่มีคะแนนรายสัปดาห์</p>}
      </button>)}
    </div>
    {!totals.length && <p className="text-sm text-slate-300">ยังไม่มีนักเรียนในกลุ่มนี้</p>}
    <p className="mt-3 text-xs text-slate-400">ความยาวแท่งเทียบกับยอดคำตอบสูงสุด {maximum === 1 && !total ? '—' : maximum} ครั้ง • คลิกนักเรียนเพื่อดูรายละเอียด • รวมการเล่นซ้ำ ไม่รวมคะแนนเก่าที่ยังไม่ระบุสัปดาห์</p>
  </figure>;
}
