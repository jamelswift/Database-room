'use client';
import { useState } from 'react';
import { Music2, Volume2, VolumeX } from 'lucide-react';

type Settings = { muted: boolean; music: number; effects: number };
export function GameAudioControls({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => void }) {
  const [open, setOpen] = useState(false);
  return <div data-audio-controls className="sticky top-0 z-[60] flex flex-wrap items-center justify-end gap-2 border-b border-slate-700 bg-slate-950/95 px-4 py-2 text-sm">
    <button type="button" aria-pressed={!settings.muted} onClick={() => update({ muted: !settings.muted })} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 font-bold hover:bg-slate-800">
      {settings.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}{settings.muted ? 'เปิดเสียง' : 'ปิดเสียง'}
    </button>
    <button type="button" aria-expanded={open} aria-controls="game-audio-settings" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 hover:bg-slate-800"><Music2 size={18} />ปรับเสียง</button>
    {open && <div id="game-audio-settings" className="flex w-full flex-wrap justify-end gap-4 py-2">
      <label className="flex items-center gap-2">เพลง {Math.round(settings.music * 100)}%<input aria-label="ระดับเสียงเพลง" type="range" min="0" max="1" step="0.05" value={settings.music} onChange={event => update({ music: Number(event.target.value) })} className="w-28 accent-sky-400" /></label>
      <label className="flex items-center gap-2">เอฟเฟกต์ {Math.round(settings.effects * 100)}%<input aria-label="ระดับเสียงเอฟเฟกต์" type="range" min="0" max="1" step="0.05" value={settings.effects} onChange={event => update({ effects: Number(event.target.value) })} className="w-28 accent-amber-400" /></label>
    </div>}
  </div>;
}
