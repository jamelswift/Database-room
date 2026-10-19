'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { teacherReport } from '@/lib/game-client';
import { CURRICULUM_LEVEL_COUNT, CURRICULUM_MAP_NODES } from './database-city-data';
import type { StudentReport } from '@/lib/weekly-scores';
import { weeklyScoresCsv } from '@/lib/sheets-export';
import { WeeklyScoreChart } from './weekly-score-chart';
import { TotalScoreChart } from './total-score-chart';

export function TeacherDashboard() {
  const refreshTask = useRef<Promise<void> | null>(null);
  const refreshAgain = useRef(false);
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [week, setWeek] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshed, setRefreshed] = useState('');
  const refresh = useCallback((signal?: AbortSignal): Promise<void> => {
    if (refreshTask.current) { refreshAgain.current = true; return refreshTask.current; }
    const task = (async () => {
      do {
        refreshAgain.current = false;
        try {
          const data = await teacherReport(signal);
          if (signal?.aborted) return;
          setStudents(data.students);
          setError('');
          setRefreshed(new Date().toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' }));
        } catch (failure) {
          if (!signal?.aborted) setError(failure instanceof Error ? failure.message : 'โหลดข้อมูลไม่ได้');
        } finally {
          if (!signal?.aborted) setLoading(false);
        }
      } while (refreshAgain.current && !signal?.aborted);
    })();
    refreshTask.current = task;
    void task.finally(() => { if (refreshTask.current === task) refreshTask.current = null; });
    return task;
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const reload = () => { void refresh(controller.signal); };
    reload();
    window.addEventListener('online', reload);
    return () => { controller.abort(); window.removeEventListener('online', reload); };
  }, [refresh]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setInterval(() => { void refresh(controller.signal); }, 3000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refresh]);
  const filtered = students.filter(s => `${s.name} ${s.username}`.toLowerCase().includes(search.toLowerCase()));
  const detail = students.find(s => s.username === selected);
  const download = () => {
    const url = URL.createObjectURL(new Blob([weeklyScoresCsv(students, CURRICULUM_LEVEL_COUNT)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database-city-weekly-scores.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const cells = (student: StudentReport, currentWeek: number) => {
    const score = student.weeklyScores[currentWeek];
    const total = score ? score.correct + score.incorrect : 0;
    return <>
      <td className="p-3 text-emerald-300">{score?.correct ?? '—'}</td>
      <td className="p-3 text-rose-300">{score?.incorrect ?? '—'}</td>
      <td className="p-3">{total ? `${Math.round(score!.correct / total * 100)}%` : '—'}</td>
      <td className="p-3">{student.completedLevels.includes(currentWeek) ? 'ผ่านแบบฝึกแล้ว' : total ? 'กำลังทำ' : 'ยังไม่มีข้อมูล'}</td>
    </>;
  };
  return <section className="mx-auto w-full max-w-6xl space-y-5 p-4 md:p-8">
    <div className="rounded-3xl border-4 border-emerald-500 bg-slate-800 p-5 md:p-8">
      <h2 className="text-2xl font-black text-white">ห้องเรียนของครู</h2>
      <p className="mt-2 text-slate-300">นักเรียนทั้งหมด {students.length} คน • คะแนนตามสัปดาห์บทเรียน 1–16</p>
      <p role="status" className="mt-2 text-sm font-bold text-emerald-300">ตรวจคะแนนจากเซิร์ฟเวอร์ทุก 3 วินาที</p>
      <p className="mt-1 text-sm text-slate-400">ตอบถูก/ผิดเป็นยอดสะสม รวมการเล่นซ้ำและมินิเกม ไม่ใช่คะแนนสอบหรือคะแนนเต็มประจำสัปดาห์</p>
      <div className="my-5 flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-200">สัปดาห์บทเรียน
          <select className="mt-1 block rounded-lg border border-slate-600 bg-slate-950 p-2 text-white" value={week} onChange={e => setWeek(Number(e.target.value))}>
            {Array.from({ length: CURRICULUM_LEVEL_COUNT }, (_, i) => <option key={i + 1} value={i + 1}>สัปดาห์ {i + 1}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-200">ค้นหานักเรียน
          <input className="mt-1 block rounded-lg border border-slate-600 bg-slate-950 p-2 text-white" placeholder="ชื่อหรือชื่อบัญชี" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button type="button" className="rounded-lg bg-sky-700 px-4 py-2 font-bold" onClick={() => { void refresh(); }}>อัปเดตข้อมูล</button>
        <button type="button" className="rounded-lg bg-emerald-700 px-4 py-2 font-bold disabled:opacity-50" disabled={loading || !!error || !students.length} onClick={download}>ดาวน์โหลดทุกคนครบ 16 สัปดาห์ (.csv)</button>
      </div>
      {error && <p role="alert" className="mb-3 text-rose-300">{error} {refreshed && 'ตารางด้านล่างเป็นข้อมูลที่โหลดสำเร็จครั้งก่อน'}</p>}
      {loading ? <p role="status">กำลังโหลดข้อมูลนักเรียน…</p> : <>
        <TotalScoreChart students={filtered} selected={selected} onSelectStudent={setSelected} />
        <WeeklyScoreChart students={filtered} title={search ? `กราฟนักเรียนที่ค้นหา (${filtered.length} คน)` : 'กราฟคะแนนทั้งห้องรายสัปดาห์'} week={week} onSelectWeek={setWeek} />
        <div className="overflow-x-auto rounded-xl border border-slate-600">
          <table className="w-full min-w-[700px] text-left">
            <caption className="bg-slate-950 p-3 text-left font-bold text-sky-300">สัปดาห์ {week} • {CURRICULUM_MAP_NODES[week - 1]?.subtitle}</caption>
            <thead className="bg-slate-900"><tr><th className="p-3">นักเรียน</th><th className="p-3">ตอบถูก</th><th className="p-3">ตอบผิด</th><th className="p-3">ความแม่นยำ</th><th className="p-3">สถานะสัปดาห์นี้</th><th className="p-3">ผ่านทั้งหมด</th></tr></thead>
            <tbody>{filtered.map(student => <tr key={student.username} className="border-t border-slate-600">
              <th scope="row" className="p-3"><button type="button" className="text-left text-sky-300 underline" onClick={() => setSelected(student.username)}>{student.name}<span className="block text-sm font-normal text-slate-400">{student.username}</span></button></th>
              {cells(student, week)}<td className="p-3">{student.completedLevels.length}/{CURRICULUM_LEVEL_COUNT}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {!filtered.length && <p className="mt-3 text-slate-300">{students.length ? 'ไม่พบนักเรียนที่ค้นหา' : 'ยังไม่มีบัญชีนักเรียน เมื่อเด็กสมัครบัญชีจะแสดงที่นี่'}</p>}
      </>}
      <p className="mt-3 text-sm text-slate-400">{refreshed && `โหลดสำเร็จล่าสุด ${refreshed} (เวลาไทย) • `}คลิกชื่อนักเรียนเพื่อดูครบทุกสัปดาห์</p>
      <p className="mt-2 text-sm text-amber-200">คะแนนเดิมที่ยังไม่ระบุสัปดาห์จะไม่ถูกนำมาแบ่งย้อนหลัง เครื่องหมาย — หมายถึงยังไม่มีคะแนนของสัปดาห์นั้น</p>
    </div>
    {detail && <div className="rounded-2xl border border-slate-600 bg-slate-800 p-5">
      <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-bold">{detail.name} • {detail.username}</h3><button type="button" className="rounded-lg bg-slate-700 px-3 py-2" onClick={() => setSelected('')}>ปิดรายละเอียด</button></div>
      <p className="my-3 text-slate-300">รวมตอบถูก {detail.answerStats.correct} • ตอบผิด {detail.answerStats.incorrect} • คำตอบที่ยังไม่ระบุสัปดาห์ {detail.unassignedAnswers}</p>
      <WeeklyScoreChart students={[detail]} title={`กราฟรายสัปดาห์ของ ${detail.name}`} week={week} onSelectWeek={setWeek} />
      <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left"><thead><tr><th className="p-3">สัปดาห์</th><th className="p-3">ตอบถูก</th><th className="p-3">ตอบผิด</th><th className="p-3">ความแม่นยำ</th><th className="p-3">สถานะ</th></tr></thead><tbody>
        {Array.from({ length: CURRICULUM_LEVEL_COUNT }, (_, i) => <tr key={i + 1} className="border-t border-slate-600"><th scope="row" className="p-3">{i + 1}</th>{cells(detail, i + 1)}</tr>)}
      </tbody></table></div>
      <p className="mt-3 text-sm text-slate-400">ใน Google Sheets เลือก ไฟล์ → นำเข้า → อัปโหลด เพื่อเปิด CSV • ข้อมูลไม่ซิงก์อัตโนมัติ</p>
    </div>}
  </section>;
}
