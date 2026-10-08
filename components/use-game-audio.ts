'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type EffectName = 'click' | 'correct' | 'incorrect' | 'mission' | 'victory';
const defaults = { muted: false, music: 0.3, effects: 0.65 };
const storageKey = 'database-city-audio-v1';

export function useGameAudio(screen: string) {
  const [settings, setSettings] = useState(defaults);
  const settingsRef = useRef(defaults);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const effectsRef = useRef<Set<HTMLAudioElement>>(new Set());
  const unlockedRef = useRef(false);
  const track = screen === 'MISSION_PLAY' ? 'mission-theme' : 'city-theme';
  const trackRef = useRef(track);
  trackRef.current = track;

  const syncMusic = useCallback(() => {
    if (!unlockedRef.current) return;
    const current = settingsRef.current;
    const source = '/audio/' + trackRef.current + '.wav?v=action-5';
    if (!musicRef.current || musicRef.current.getAttribute('src') !== source) {
      musicRef.current?.pause();
      musicRef.current = new Audio(source);
      musicRef.current.loop = true;
    }
    const music = musicRef.current;
    music.volume = current.music;
    if (current.muted || current.music === 0 || document.hidden) music.pause();
    else void music.play().catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved) {
        const bounded = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
        const next = { muted: typeof saved.muted === 'boolean' ? saved.muted : false, music: bounded(saved.music, defaults.music), effects: bounded(saved.effects, defaults.effects) };
        settingsRef.current = next;
        setSettings(next);
      }
    } catch {}
    const unlock = () => { unlockedRef.current = true; syncMusic(); };
    const visibility = () => {
      if (document.hidden) effectsRef.current.forEach(audio => audio.pause());
      syncMusic();
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', visibility);
      musicRef.current?.pause();
      effectsRef.current.forEach(audio => audio.pause());
      effectsRef.current.clear();
    };
  }, [syncMusic]);

  useEffect(() => { syncMusic(); }, [track, syncMusic]);

  const update = (patch: Partial<typeof defaults>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    effectsRef.current.forEach(audio => {
      audio.volume = next.effects;
      if (next.muted || next.effects === 0) audio.pause();
    });
    unlockedRef.current = true;
    syncMusic();
  };

  const play = useCallback((name: EffectName) => {
    const current = settingsRef.current;
    if (!unlockedRef.current || current.muted || current.effects === 0 || document.hidden) return;
    // Feedback replaces the UI click so answer and victory cues stay clear.
    if (name !== 'click') effectsRef.current.forEach(audio => { audio.pause(); effectsRef.current.delete(audio); });
    if (effectsRef.current.size >= 6) return;
    const audio = new Audio('/audio/' + name + '.wav?v=action-5');
    audio.volume = current.effects;
    effectsRef.current.add(audio);
    const cleanup = () => effectsRef.current.delete(audio);
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    void audio.play().catch(cleanup);
  }, []);

  return { settings, update, play };
}
