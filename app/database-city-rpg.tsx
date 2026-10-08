// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CURRICULUM_MAP_NODES, CURRICULUM_LEVEL_COUNT, ACCESS_PROJECT, DEFAULT_PLAYER } from '@/components/database-city-data';
import { PixelDetectiveAvatar } from '@/components/pixel-detective-avatar';
import { scoresCsv } from '@/lib/sheets-export';
import { useGameAudio } from '@/components/use-game-audio';
import { GameAudioControls } from '@/components/game-audio-controls';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { Landmark, LibraryBig, Files, ShieldCheck, Network, KeyRound, Link2, Wrench, Table2, Vault, Search, Fingerprint, PanelsTopLeft, ChartNoAxesCombined, Building2, Crown, LockKeyhole, Check, ArrowRight } from 'lucide-react';

const CASE_ICONS = [Landmark, LibraryBig, Files, ShieldCheck, Network, KeyRound, Link2, Wrench, Table2, Vault, Search, Fingerprint, PanelsTopLeft, ChartNoAxesCombined, Building2, Crown];


export default function App() {
  const [screen, setScreen] = useState('START'); // 'START', 'AUTH', 'CREATE_CHAR', 'WORLD_MAP', 'MISSION_PLAY', 'CLASSROOM', 'INVENTORY'
  const audio = useGameAudio(screen);
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'

  const [accounts, setAccounts] = useState([]);
  const [player, setPlayer] = useState(null);
  const [saveStatus, setSaveStatus] = useState('loading');
  const [databaseError, setDatabaseError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState('');
  const revisionRef = useRef(0);
  const persistedRef = useRef('');
  const pendingSaveRef = useRef(null);
  const saveTaskRef = useRef(null);

  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  const [customSkin, setCustomSkin] = useState('#ffd1b3');
  const [customHair, setCustomHair] = useState('#2c1810');
  const [customOutfit, setCustomOutfit] = useState('#3b82f6');
  const [customHat, setCustomHat] = useState('sherlock');
  const [customTool, setCustomTool] = useState('magnifier');

  const [playerPos, setPlayerPos] = useState({ x: 180, y: 720 });
  const [isWalking, setIsWalking] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [activeLevelNum, setActiveLevelNum] = useState(1);
  const [missionPhase, setMissionPhase] = useState('briefing'); // 'briefing', 'lessons', 'game', 'result'
  
  // Interactive Mini-game States
  const [userSelectedOption, setUserSelectedOption] = useState(null);
  const [quizSuccess, setQuizSuccess] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [quizRound, setQuizRound] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(null);

  // Sorting Mini-game State
  const [sortingItems, setSortingItems] = useState([]);
  const [sortingResultMsg, setSortingResultMsg] = useState(null);

  // Matching Mini-game State
  const [userMatches, setUserMatches] = useState({});
  const [matchingResultMsg, setMatchingResultMsg] = useState(null);

  const [toastMsg, setToastMsg] = useState(null);
  const mapScrollRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const api = async (body) => {
    const response = await fetch('/api/game', body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    } : { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'ไม่สามารถเชื่อมต่อได้');
      error.status = response.status;
      throw error;
    }
    return data;
  };

  const acceptPlayer = (found) => {
    revisionRef.current = found.revision;
    persistedRef.current = JSON.stringify(found);
    pendingSaveRef.current = null;
    setPlayer(found);
    setDatabaseError('');
    setSaveStatus('saved');
    setCustomSkin(found.character.skin);
    setCustomHair(found.character.hair);
    setCustomOutfit(found.character.outfit);
    setCustomHat(found.character.hat);
    setCustomTool(found.character.tool);
  };

  const flushSave = () => {
    if (saveTaskRef.current) return saveTaskRef.current;
    const task = (async () => {
      while (pendingSaveRef.current) {
        const snapshot = pendingSaveRef.current;
        setSaveStatus('saving');
        try {
          const result = await api({ action: 'save', player: snapshot, revision: revisionRef.current });
          revisionRef.current = result.revision;
          persistedRef.current = JSON.stringify(snapshot);
          if (pendingSaveRef.current === snapshot) pendingSaveRef.current = null;
          setDatabaseError('');
          setSaveStatus('saved');
        } catch (error) {
          setDatabaseError(error.message);
          setSaveStatus('error');
          return false;
        }
      }
      return true;
    })();
    saveTaskRef.current = task;
    task.finally(() => { saveTaskRef.current = null; });
    return task;
  };

  useEffect(() => {
    let cancelled = false;
    api().then(data => {
      if (cancelled) return;
      setAccounts(data.accounts);
      if (data.player) { acceptPlayer(data.player); setScreen(data.player.role === 'teacher' ? 'CLASSROOM' : 'WORLD_MAP'); }
      else setSaveStatus('saved');
    }).catch(error => {
      if (!cancelled) { setDatabaseError(error.message); setSaveStatus('error'); }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!player || JSON.stringify(player) === persistedRef.current) return;
    pendingSaveRef.current = player;
    void flushSave();
  }, [player]);

  useEffect(() => {
    const warnIfUnsaved = (event) => {
      if (pendingSaveRef.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warnIfUnsaved);
    return () => window.removeEventListener('beforeunload', warnIfUnsaved);
  }, []);

  useEffect(() => {
    if (screen !== 'CLASSROOM' || !player) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        if (!await flushSave()) return;
        const data = await api();
        if (!data.player) throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง');
        if (!cancelled) { setAccounts(data.accounts); setDatabaseError(''); }
      } catch (error) { if (!cancelled) setDatabaseError(error.message); }
    };
    void refresh();
    const timer = setInterval(refresh, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [screen, player?.username]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    try {
      let result;
      try { result = await api({ action: 'login', username: authUsername, password: authPassword }); }
      catch (error) {
        if (error.status !== 401) throw error;
        let legacyAccounts = [];
        try { legacyAccounts = JSON.parse(localStorage.getItem('database_city_rpg_accounts_v3') || '[]'); } catch {}
        const legacy = Array.isArray(legacyAccounts) && legacyAccounts.find(account => account.username.toLowerCase() === authUsername.trim().toLowerCase() && account.password === authPassword);
        if (!legacy) throw error;
        result = await api({ action: 'register', username: legacy.username, name: legacy.name, password: authPassword, legacyPlayer: legacy });
        try {
          localStorage.setItem('database_city_rpg_accounts_v3', JSON.stringify(legacyAccounts.filter(account => account !== legacy)));
          localStorage.removeItem('database_city_rpg_active_player_v3');
        } catch {}
      }
      acceptPlayer(result.player);
      setAuthPassword('');
      triggerToast('เข้าสู่ระบบเรียบร้อย');
      setScreen(result.player.role === 'teacher' ? 'CLASSROOM' : 'WORLD_MAP');
    } catch (error) { triggerToast(error.message); }
    finally { setAuthBusy(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    try {
      const result = await api({ action: 'register', username: authUsername, password: authPassword, name: authName });
      acceptPlayer(result.player);
      setAuthPassword('');
      triggerToast('สร้างบัญชีสำเร็จ! เชิญปรับแต่งตัวละครนักสืบ');
      setScreen('CREATE_CHAR');
    } catch (error) { triggerToast(error.message); }
    finally { setAuthBusy(false); }
  };

  const handleLogout = async () => {
    if (player && JSON.stringify(player) !== persistedRef.current) pendingSaveRef.current = player;
    if (!await flushSave()) return;
    try {
      await api({ action: 'logout' });
      setPlayer(null);
      setAccounts([]);
      persistedRef.current = '';
      setScreen('START');
    } catch (error) { triggerToast(error.message); }
  };

  const handleSaveCharacter = (e) => {
    e.preventDefault();
    if (!player) return;

    const updatedChar = {
      ...player.character,
      skin: customSkin,
      hair: customHair,
      outfit: customOutfit,
      hat: customHat,
      tool: customTool,
    };

    const updatedPlayer = { ...player, character: updatedChar };
    setPlayer(updatedPlayer);
    triggerToast('✨ บันทึกตัวละครเรียบร้อย! ก้าวสู่แผนที่โลก Database City');
    setScreen('WORLD_MAP');
  };

  const createQuizRound = (node, round = 0) => {
    // Start with this unit, then review up to nine preceding units using authored questions.
    const questionNode = CURRICULUM_MAP_NODES[node.level - 1 - round];
    const choices = questionNode.options;
    const correctIndex = questionNode.correctIndex;
    setQuizQuestion(questionNode.question);
    const shuffled = choices.map((text, originalIndex) => ({
      text: text.replace(/^\s*[\u0e01\u0e02\u0e04\u0e07]\s*[.)]\s*/, ''),
      originalIndex,
    }));
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    setQuizRound(round);
    setShowHint(false);
    setQuizOptions(shuffled.map(option => option.text));
    setQuizCorrectIndex(shuffled.findIndex(option => option.originalIndex === correctIndex));
    setUserSelectedOption(null);
    setQuizSuccess(null);
  };

  const initMiniGameForNode = (node) => {
    setQuizSuccess(null);
    setQuizCorrectCount(0);
    if (node.gameType === 'sorting') {
      const shuffled = [...node.items].sort(() => Math.random() - 0.5);
      setSortingItems(shuffled);
      setSortingResultMsg(null);
    } else if (node.gameType === 'matching') {
      setUserMatches({});
      setMatchingResultMsg(null);
    } else {
      createQuizRound(node, 0);
    }
  };

  const handleNodeClick = (node) => {
    const isUnlocked = node.level === 1 || player?.completedLevels.includes(node.level - 1);
    
    if (!isUnlocked) {
      triggerToast(`🔒 ด่านนี้ยังไม่ปลดล็อก! ต้องผ่านด่าน Level 0${node.level - 1} ก่อนนะนักสืบ`);
      return;
    }

    audio.play('mission');
    setSelectedNode(node);
    setIsWalking(true);
    setPlayerPos({ x: node.x, y: node.y + 40 });

    setTimeout(() => {
      setIsWalking(false);
      setActiveLevelNum(node.level);
      setMissionPhase('briefing');
      setShowHint(false);
      initMiniGameForNode(node);
      setScreen('MISSION_PLAY');
    }, 700);
  };

  const recordAnswer = (correct) => {
    audio.play(correct ? 'correct' : 'incorrect');
    setPlayer(previous => previous ? {
      ...previous,
      weeklyScores: {
        ...previous.weeklyScores,
        [activeLevelNum]: {
          correct: (previous.weeklyScores?.[activeLevelNum]?.correct ?? 0) + (correct ? 1 : 0),
          incorrect: (previous.weeklyScores?.[activeLevelNum]?.incorrect ?? 0) + (correct ? 0 : 1),
        },
      },
      answerStats: {
        correct: (previous.answerStats?.correct ?? 0) + (correct ? 1 : 0),
        incorrect: (previous.answerStats?.incorrect ?? 0) + (correct ? 0 : 1),
      },
    } : previous);
  };

  const classroomRanking = accounts
    .map(account => account.username === player?.username ? player : account)
    .map(account => ({
      username: account.username,
      name: account.name,
      correct: account.answerStats?.correct ?? 0,
      incorrect: account.answerStats?.incorrect ?? 0,
    }))
    .sort((a, b) => Number(b.correct + b.incorrect > 0) - Number(a.correct + a.incorrect > 0)
      || b.correct - a.correct || a.incorrect - b.incorrect || a.username.localeCompare(b.username));

  const exportScores = async () => {
    setExportBusy(true);
    setExportError('');
    try {
      if (!await flushSave()) throw new Error('บันทึกคะแนนยังไม่สำเร็จ กรุณาลองอีกครั้ง');
      const response = await fetch('/api/game', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'โหลดข้อมูลไม่ได้');
      if (!data.player) throw new Error('กรุณาเข้าสู่ระบบอีกครั้ง');
      const url = URL.createObjectURL(new Blob([scoresCsv(data.accounts)], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `database-city-scores-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error.message || 'ส่งออกข้อมูลไม่ได้ กรุณาลองอีกครั้ง');
    } finally {
      setExportBusy(false);
    }
  };

  const handleCompleteLevel = (levelNum) => {
    if (!player) return;
    audio.play('victory');

    if (!player.completedLevels.includes(levelNum)) {
      const earnedXp = 100;
      const earnedCoins = 35;
      const newCompleted = [...player.completedLevels, levelNum];
      const newBadges = [...player.badges, `BADGE LV.${levelNum < 10 ? '0' + levelNum : levelNum}`];
      const newInventory = [...player.inventory, `📜 Case Solved Doc #${levelNum}`];
      const nextLevelUnlocked = Math.min(CURRICULUM_LEVEL_COUNT, Math.max(player.level, levelNum + 1));

      const updated = {
        ...player,
        xp: player.xp + earnedXp,
        coins: player.coins + earnedCoins,
        level: nextLevelUnlocked,
        completedLevels: newCompleted,
        badges: newBadges,
        inventory: newInventory,
      };

      setPlayer(previous => ({ ...updated, answerStats: previous.answerStats }));
      triggerToast(`🎉 ผ่านภารกิจ Level ${levelNum}! ปลดล็อกด่านถัดไปและรับ 100 XP`);
    }
  };

  const renderHUD = () => {
    if (!player || screen === 'START' || screen === 'AUTH' || screen === 'CREATE_CHAR') return null;
    const hpPercent = Math.max(0, Math.floor((player.hp / player.maxHp) * 100));

    return (
      <header className="sticky top-0 z-50 bg-[#1e1b4b] border-b-4 border-[#38bdf8] text-white px-4 py-2.5 flex justify-between md:grid md:grid-cols-[1fr_auto_1fr] items-center shadow-lg font-thai">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black/40 border-2 border-[#fbbf24] rounded-lg overflow-hidden flex items-center justify-center p-1">
            <PixelDetectiveAvatar character={player.character} scale={0.7} showTool={false} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-[#fef08a]">{player.name}</span>
              <span className="text-[10px] bg-[#38bdf8] text-black px-1.5 py-0.2 rounded font-black font-retro">
                LV.{player.level}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[14px] text-red-400 font-bold">HP</span>
              <div className="w-20 bg-black/70 h-2 rounded border border-gray-600 overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${hpPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center hidden md:block">
          <h1 className="text-sm font-black text-[#fbbf24] font-retro tracking-wider drop-shadow-[2px_2px_0px_#000]">
            DATABASE CITY
          </h1>
          <span className="text-[14px] text-[#93c5fd] font-semibold">
            แผนที่ผจญภัยนักสืบฐานข้อมูล • 16 สัปดาห์ ปวช.1
          </span>
        </div>

        <div className="flex items-center justify-self-end space-x-3 text-base">
          <div className="bg-black/60 border-2 border-[#fbbf24] px-2.5 py-1 rounded-md text-[#fde047] font-black font-retro">
            🪙 {player.coins}
          </div>
          <div className="hidden sm:block bg-black/60 border-2 border-[#a855f7] px-2.5 py-1 rounded-md text-[#d8b4fe] font-black font-retro">
            XP: {player.xp}
          </div>
          <button
            onClick={() => setScreen('WORLD_MAP')}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-base px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            🗺️ แผนที่
          </button>
        </div>
      </header>
    );
  };

  return (
    <div onClickCapture={event => { const target = event.target as HTMLElement; if (target.closest('button') && !target.closest('[data-audio-controls]') && !target.closest('button')?.hasAttribute('disabled')) audio.play('click'); }} className="min-h-screen bg-[#0f172a] text-slate-100 font-thai flex flex-col select-none relative overflow-x-hidden">
      <GameAudioControls settings={audio.settings} update={audio.update} />

      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#fde047] text-black font-black px-6 py-2.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] text-base md:text-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      {renderHUD()}
      {(saveStatus === 'loading' || saveStatus === 'saving' || databaseError) && (
        <div role="status" className="bg-slate-900 border-b border-slate-600 px-4 py-2 text-sm text-center">
          {databaseError || (saveStatus === 'loading' ? 'กำลังโหลดข้อมูล…' : 'กำลังบันทึก…')}
          {databaseError && <button className="ml-3 text-amber-300 underline" onClick={() => pendingSaveRef.current ? flushSave() : window.location.reload()}>ลองอีกครั้ง</button>}
        </div>
      )}


      <main className="flex-1 flex flex-col pb-20">
        {/* ===================== SCREEN 1: START SCREEN ===================== */}
        {screen === 'START' && (
          <div className="min-h-screen flex flex-col justify-between items-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#1e293b] to-[#0f172a]">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none"></div>

            <div className="w-full max-w-4xl flex justify-between items-center bg-[#1e293b]/90 border-4 border-[#38bdf8] p-3.5 rounded-2xl shadow-[6px_6px_0px_#000] z-10">
              <span className="text-xs text-[#4ade80] font-black font-retro">16-BIT OVERWORLD MAP</span>
              <span className="text-base text-[#fbbf24] font-bold">★ รายวิชา 20901-2001 การจัดการฐานข้อมูลเบื้องต้น ★</span>
              <span className="text-xs text-[#f472b6] font-black font-retro">ปวช.1</span>
            </div>

            <div className="my-auto py-8 space-y-6 z-10 max-w-2xl">
              <div className="inline-block bg-[#0f172a] border-2 border-[#fbbf24] px-6 py-1.5 rounded-full shadow-[3px_3px_0px_#000]">
                <span className="text-base text-[#fef08a] font-black">🕹️ สไตล์เกมผจญภัยแผนที่โลก (Retro World Adventure)</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#fbbf24] to-[#4ade80] font-retro py-2 drop-shadow-[4px_4px_0px_#000] leading-tight">
                DATABASE CITY
              </h1>

              <h2 className="text-xl md:text-2xl text-white font-extrabold tracking-wide">
                ภารกิจนักสืบฐานข้อมูล 16 สัปดาห์ พร้อมโครงงาน Microsoft Access
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed font-medium">
                ร่วมผจญภัยเดินสำรวจดินแดนฐานข้อมูล ไขคดีปริศนา ศึกษาบทเรียนเชิงลึกในแต่ละสัปดาห์ มินิเกมจัดเต็ม และปราบ Boss ประจำ Citadel เพื่อกู้คืนความสมบูรณ์ของข้อมูลเมือง
              </p>

              <div className="p-4 flex justify-center">
                <div className="bg-slate-900/80 p-5 rounded-2xl border-4 border-[#38bdf8] shadow-[6px_6px_0px_#000]">
                  <PixelDetectiveAvatar character={DEFAULT_PLAYER.character} scale={1.4} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setScreen('AUTH');
                  }}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-sm px-8 py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer transition-transform hover:-translate-y-1 font-retro"
                >
                  [ เข้าสู่ระบบ (LOGIN) ]
                </button>
                <button
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setScreen('AUTH');
                  }}
                  className="bg-[#38bdf8] hover:bg-[#0284c7] text-black font-black text-sm px-8 py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer transition-transform hover:-translate-y-1 font-retro"
                >
                  [ สมัครสมาชิก (REGISTER) ]
                </button>
              </div>
            </div>

            <footer className="text-base text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 z-10">
              DATABASE CITY • 16 Weeks • Microsoft Access Project
            </footer>
          </div>
        )}

        {/* ===================== SCREEN 2: AUTH MODAL ===================== */}
        {screen === 'AUTH' && (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
            <div className="bg-[#1e293b] border-4 border-[#38bdf8] rounded-3xl shadow-[8px_8px_0px_#000] p-6 md:p-8 max-w-md w-full relative">
              <div className="absolute -top-4 left-6 bg-[#fbbf24] text-black px-4 py-1 text-xs font-black rounded-lg border-2 border-black font-retro">
                {authMode === 'LOGIN' ? 'LOGIN' : 'REGISTER'}
              </div>

              <div className="text-center mb-6 mt-2">
                <h3 className="text-lg font-black text-white">
                  {authMode === 'LOGIN' ? 'เข้าสู่ระบบนักสืบฐานข้อมูล' : 'ลงทะเบียนนักสืบใหม่ ปวช.1'}
                </h3>
                <p className="text-base text-slate-400 mt-1">เก็บประวัติการเดินทางและเลเวลของคุณไว้เสมอ</p>
              </div>

              <form onSubmit={authMode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
                {authMode === 'REGISTER' && (
                  <div>
                    <label className="block text-base text-[#38bdf8] mb-1 font-bold">ชื่อ-นามสกุลนักศึกษา:</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="เช่น นายเอกชัย ใฝ่เรียนรู้"
                      className="w-full bg-black/60 border-2 border-slate-600 rounded-xl p-3 text-white text-lg focus:outline-none focus:border-[#22c55e]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-base text-[#38bdf8] mb-1 font-bold">ชื่อผู้ใช้ (USERNAME):</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="เช่น detective01"
                    className="w-full bg-black/60 border-2 border-slate-600 rounded-xl p-3 text-white text-lg focus:outline-none focus:border-[#22c55e]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-[#38bdf8] mb-1 font-bold">รหัสผ่าน (PASSWORD):</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/60 border-2 border-slate-600 rounded-xl p-3 text-white text-lg focus:outline-none focus:border-[#22c55e]"
                    required
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={authBusy || saveStatus === 'loading'}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-3.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] cursor-pointer font-retro text-xs"
                  >
                    [ {authBusy ? 'กำลังดำเนินการ…' : authMode === 'LOGIN' ? 'ยืนยันเข้าสู่ระบบ' : 'ลงทะเบียนและสร้างตัวละคร'} ]
                  </button>

                  <div className="flex justify-between items-center text-base pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className="text-[#fde047] hover:underline font-bold"
                    >
                      {authMode === 'LOGIN' ? 'ยังไม่มีบัญชี? สมัครสมาชิกใหม่' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreen('START')}
                      className="text-slate-400 hover:text-white"
                    >
                      ย้อนกลับ
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {screen === 'CREATE_CHAR' && (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
            <div className="bg-[#1e293b] border-4 border-[#fbbf24] rounded-3xl shadow-[8px_8px_0px_#000] p-6 md:p-8 max-w-xl w-full relative">
              <div className="absolute -top-4 left-6 bg-[#22c55e] text-black px-4 py-1 text-xs font-black rounded-lg border-2 border-black font-retro">
                CUSTOMIZE DETECTIVE
              </div>

              <div className="text-center mb-4 mt-2">
                <h3 className="text-lg font-black text-white">ปรับแต่งตัวละครนักสืบฐานข้อมูล</h3>
                <p className="text-base text-slate-300">สร้างเอกลักษณ์ของคุณก่อนก้าวสู่แผนที่โลก</p>
              </div>

              <div className="flex justify-center p-4 bg-slate-900/90 rounded-2xl border-2 border-slate-700 my-3">
                <PixelDetectiveAvatar
                  character={{ skin: customSkin, hair: customHair, outfit: customOutfit, hat: customHat, tool: customTool }}
                  scale={1.5}
                />
              </div>

              <form onSubmit={handleSaveCharacter} className="space-y-4">
                <div>
                  <label className="block text-base font-bold text-[#38bdf8] mb-1.5">1. สีผิวตัวละคร (Skin Tone):</label>
                  <div className="flex space-x-3">
                    {[
                      { label: 'ขาวสว่าง', hex: '#ffd1b3' },
                      { label: 'ผิวสองสี', hex: '#e0ac69' },
                      { label: 'ผิวแทน', hex: '#c68642' },
                      { label: 'ผิวเข้ม', hex: '#8d5524' }
                    ].map(s => (
                      <div
                        key={s.hex}
                        onClick={() => setCustomSkin(s.hex)}
                        title={s.label}
                        className={`w-9 h-9 rounded-xl border-3 cursor-pointer transition-transform ${customSkin === s.hex ? 'border-white scale-110 shadow-[2px_2px_0px_#22c55e]' : 'border-black'}`}
                        style={{ backgroundColor: s.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-[#38bdf8] mb-1.5">2. สีผม (Hair Color):</label>
                  <div className="flex space-x-3">
                    {[
                      { label: 'น้ำตาลเข้ม', hex: '#2c1810' },
                      { label: 'ดำขลับ', hex: '#18181b' },
                      { label: 'ทองประกาย', hex: '#eab308' },
                      { label: 'ฟ้านีออน', hex: '#0284c7' },
                      { label: 'ชมพูคิ้วท์', hex: '#ec4899' },
                    ].map(h => (
                      <div
                        key={h.hex}
                        onClick={() => setCustomHair(h.hex)}
                        title={h.label}
                        className={`w-9 h-9 rounded-xl border-3 cursor-pointer transition-transform ${customHair === h.hex ? 'border-white scale-110 shadow-[2px_2px_0px_#22c55e]' : 'border-black'}`}
                        style={{ backgroundColor: h.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold text-[#38bdf8] mb-1.5">3. สีเสื้อชุดนักสืบ (Jacket Color):</label>
                  <div className="flex space-x-3">
                    {[
                      { label: 'น้ำเงินกรมท่า', hex: '#2563eb' },
                      { label: 'เขียวเรนเจอร์', hex: '#16a34a' },
                      { label: 'แดงสืบสวน', hex: '#dc2626' },
                      { label: 'ม่วงไซเบอร์', hex: '#9333ea' },
                      { label: 'เทานักสืบ', hex: '#4b5563' },
                    ].map(o => (
                      <div
                        key={o.hex}
                        onClick={() => setCustomOutfit(o.hex)}
                        title={o.label}
                        className={`w-9 h-9 rounded-xl border-3 cursor-pointer transition-transform ${customOutfit === o.hex ? 'border-white scale-110 shadow-[2px_2px_0px_#22c55e]' : 'border-black'}`}
                        style={{ backgroundColor: o.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-bold text-[#38bdf8] mb-1.5">หมวก (Hat):</label>
                    <select
                      value={customHat}
                      onChange={(e) => setCustomHat(e.target.value)}
                      className="w-full bg-black/60 border-2 border-slate-600 rounded-xl p-2 text-white text-base font-bold"
                    >
                      <option value="sherlock">หมวกเชอร์ล็อกโฮล์มส์ 🕵️</option>
                      <option value="cap">หมวกแก๊ปนักศึกษา 🧢</option>
                      <option value="headband">สายคาดหน้าผาก 🎽</option>
                      <option value="none">ไม่สวมหมวก</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-[#38bdf8] mb-1.5">อุปกรณ์ถือ (Item):</label>
                    <select
                      value={customTool}
                      onChange={(e) => setCustomTool(e.target.value)}
                      className="w-full bg-black/60 border-2 border-slate-600 rounded-xl p-2 text-white text-base font-bold"
                    >
                      <option value="magnifier">แว่นขยายข้อมูล 🔍</option>
                      <option value="file">แฟ้มเอกสารคดี 📁</option>
                      <option value="badge">ตราประจำตัว ⭐</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer font-retro text-xs"
                  >
                    [ บันทึกตัวละคร & ก้าวสู่แผนที่ ]
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {screen === 'WORLD_MAP' && player && (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="bg-[#1e293b] border-b-2 border-[#38bdf8] px-4 py-2 flex justify-between items-center z-10 text-base">
              <div className="text-[#fbbf24] font-bold flex items-center space-x-1">
                <span>🧭 แผนที่โลก: คลิกที่หมุดอาคารเพื่อเดินตัวละครไปยังด่านที่ปลดล็อกแล้ว (ด่าน 01 - 16)</span>
              </div>
              <div className="text-[#4ade80] font-black hidden sm:block">
                ผ่านแบบฝึกแล้ว: {player.completedLevels.length} / {CURRICULUM_LEVEL_COUNT} ด่าน
              </div>
            </div>

            <div 
              ref={mapScrollRef}
              className="atlas-scroll flex-1 overflow-auto relative p-5"
              style={{ minHeight: '620px' }}
            >
              <div 
                className="world-atlas relative mx-auto w-[1600px] h-[900px] overflow-hidden"
              >
                <div className="absolute left-8 top-7 z-[1] pointer-events-none rounded-sm border border-[#d8b27a]/40 bg-[#241d19]/55 px-4 py-2 rotate-[-2deg] shadow-lg">
                  <div className="text-[9px] font-black tracking-[0.28em] text-[#e8c58d] font-retro">CASE BOARD 01</div>
                  <div className="mt-1 text-[14px] tracking-wide text-[#b9c5c6]">DATABASE CITY • EVIDENCE MAP</div>
                </div>
                <div className="absolute right-8 top-7 z-[1] pointer-events-none rounded-full border-2 border-[#d26d55]/60 bg-[#401f26]/50 px-3 py-1 text-[14px] font-bold tracking-widest text-[#ef9a7c] rotate-[3deg]">
                  CONFIDENTIAL
                </div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {CURRICULUM_MAP_NODES.map((node, i) => {
                    if (i === CURRICULUM_MAP_NODES.length - 1) return null;
                    const nextNode = CURRICULUM_MAP_NODES[i + 1];
                    const isUnlocked = player.completedLevels.includes(node.level);

                    return (
                      <line
                        key={`road-${node.level}`}
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke={isUnlocked ? '#ffd479' : '#ecede5'}
                        strokeWidth="6"
                        strokeDasharray={isUnlocked ? '8 7' : '2 10'}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                        style={{ filter: 'drop-shadow(0 1px 2px #10202f)' }}
                      />
                    );
                  })}
                </svg>

                <div className="absolute left-20 bottom-3 bg-black/70 border-2 border-emerald-400 px-3 py-1 rounded-lg text-[14px] text-emerald-300 font-bold">
                  🌿 ZONE 1: THE ACADEMY QUARTER
                </div>
                <div className="absolute left-[700px] bottom-3 bg-black/70 border-2 border-sky-400 px-3 py-1 rounded-lg text-[14px] text-sky-300 font-bold">
                  🌊 ZONE 2: THAMES ARCHIVES
                </div>
                <div className="absolute right-20 bottom-3 bg-black/70 border-2 border-amber-400 px-3 py-1 rounded-lg text-[14px] text-amber-300 font-bold">
                  ⚙️ ZONE 3: SCOTLAND YARD
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-black/80 border-2 border-purple-400 px-4 py-1.5 rounded-lg text-xs text-purple-300 font-black font-retro whitespace-nowrap">
                  ZONE 4: BAKER STREET BUREAU
                </div>

                {CURRICULUM_MAP_NODES.map((node) => {
                  const isCompleted = player.completedLevels.includes(node.level);
                  const isUnlocked = node.level === 1 || player.completedLevels.includes(node.level - 1);
                  const CaseIcon = CASE_ICONS[(node.level - 1) % CASE_ICONS.length];
                  const status = isCompleted ? 'complete' : isUnlocked ? 'ready' : 'locked';

                  return (
                    <button
                      type="button"
                      key={node.level}
                      onClick={() => handleNodeClick(node)}
                      aria-disabled={!isUnlocked}
                      aria-label={`${node.title} - ${node.subtitle}`}
                      title={node.subtitle}
                      className={`case-location case-location--${status}`}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    >
                      <span className="case-location__topline">
                        <span>CASE FILE</span>
                        <span className="case-location__number">{String(node.level).padStart(2, '0')}</span>
                        <span>{node.week}</span>
                      </span>
                      <span className="case-location__body">
                        <span className="case-location__emblem"><CaseIcon size={30} strokeWidth={1.5} /></span>
                        <span className="case-location__copy">
                          <span className="case-location__title">{node.title}</span>
                          <span className="case-location__subtitle">{node.subtitle}</span>
                        </span>
                      </span>
                      <span className="case-location__footer">
                        <span className="case-location__status">
                          {isCompleted ? <Check size={13} /> : isUnlocked ? <Search size={13} /> : <LockKeyhole size={12} />}
                          {isCompleted ? 'ปิดคดีแล้ว' : isUnlocked ? 'เริ่มสืบคดี' : 'ยังไม่ปลดล็อก'}
                        </span>
                        {isUnlocked ? <ArrowRight size={14} /> : <span className="case-location__requirement">LV.{String(node.level - 1).padStart(2, '0')}</span>}
                      </span>
                    </button>
                  );
                })}

                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-30 flex flex-col items-center pointer-events-none"
                  style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
                  aria-label={player.name}
                >
                  <div className="bg-[#facc15] text-black text-[14px] font-black px-2 py-0.5 rounded-full border-2 border-black shadow mb-1">
                    {player.name}
                  </div>
                  <PixelDetectiveAvatar
                    character={player.character}
                    isMoving={isWalking}
                    scale={1.2}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'MISSION_PLAY' && player && (() => {
          const loc = CURRICULUM_MAP_NODES.find(l => l.level === activeLevelNum) || CURRICULUM_MAP_NODES[0];

          return (
            <div className="max-w-3xl mx-auto p-4 md:p-8 w-full">
              <div className="bg-[#1e293b] border-4 border-[#38bdf8] rounded-3xl shadow-[8px_8px_0px_#000] p-6 md:p-8 relative">
                <div className="absolute -top-4 left-6 bg-[#fbbf24] text-black px-4 py-1 text-xs font-black rounded-lg border-2 border-black font-retro">
                  LEVEL {loc.level < 10 ? `0${loc.level}` : loc.level} : {loc.week}
                </div>

                <div className="flex items-center space-x-4 mt-2 pb-4 border-b-2 border-slate-700">
                  <div className="w-16 h-16 bg-slate-900 border-3 border-[#38bdf8] rounded-2xl flex items-center justify-center text-3xl shadow">
                    {loc.icon}
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-white">{loc.title}</h2>
                    <p className="text-base text-[#38bdf8] font-bold">{loc.subtitle}</p>
                  </div>
                </div>

                {/* PHASE 1: Detective Case Briefing */}
                {missionPhase === 'briefing' && (
                  <div className="mt-6 space-y-6">
                    <div className="bg-slate-900/90 border-2 border-[#22c55e] rounded-2xl p-5 shadow-inner">
                      <span className="text-base text-[#4ade80] font-black font-mono">[ ภารกิจสืบสวน: {loc.caseName} ]</span>
                      <p className="mt-3 text-lg md:text-base text-slate-200 leading-relaxed font-semibold">
                        "{loc.description}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setScreen('WORLD_MAP')}
                        className="bg-black/50 text-slate-300 px-4 py-2.5 rounded-xl border-2 border-slate-600 text-base font-bold hover:bg-black/80"
                      >
                        ◀ กลับสู่แผนที่โลก
                      </button>
                      <button
                        onClick={() => setMissionPhase('lessons')}
                        className="bg-[#38bdf8] hover:bg-[#0284c7] text-black font-black px-6 py-3 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] cursor-pointer text-base"
                      >
                        ศึกษาบทเรียนเชิงลึก ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 2: Expanded Curriculum Lessons (Multiple Bullet Points) */}
                {missionPhase === 'lessons' && (
                  <div className="mt-6 space-y-6">
                    <div className="bg-slate-900/90 border-2 border-[#fbbf24] rounded-2xl p-5 shadow-inner space-y-4">
                      <h4 className="text-lg font-black text-[#facc15]">📚 บทเรียนวิชา 20901-2001 ปวช.1 ({loc.week}):</h4>
                      <div className="space-y-3">
                        {loc.lessons.map((lessonText, lIdx) => (
                          <div key={lIdx} className="flex items-start space-x-2.5 bg-black/40 p-3 rounded-xl border border-slate-700">
                            <span className="text-[#38bdf8] font-black text-base">📌</span>
                            <p className="text-base md:text-lg text-slate-200 leading-relaxed font-medium">
                              {lessonText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <section className="bg-slate-900/90 border-2 border-sky-400 rounded-2xl p-5 space-y-4" aria-label="งานปฏิบัติ Microsoft Access">
                      <h4 className="text-xl font-black text-sky-300">งานปฏิบัติตามแผนการสอน</h4>
                      <div className="space-y-2 text-slate-200">
                        <p><strong>K1 ความรู้:</strong> {loc.knowledge}</p>
                        <p><strong>S1 ทักษะ:</strong> {loc.skill}</p>
                        <p><strong>A1 ความรับผิดชอบ:</strong> {loc.attitude}</p>
                      </div>
                      <div className="rounded-xl bg-black/30 p-4 space-y-2">
                        <h5 className="font-bold text-amber-300">{ACCESS_PROJECT.title}</h5>
                        <p>{ACCESS_PROJECT.description}</p>
                        <p>ชื่อไฟล์ชิ้นงาน: <code>{ACCESS_PROJECT.file}</code></p>
                      </div>
                      <ol className="list-decimal pl-6 space-y-3 text-slate-100">
                        {loc.steps.map((step, index) => <li key={index}>{step}</li>)}
                      </ol>
                      <div className="space-y-2 border-t border-slate-600 pt-4">
                        <p><strong className="text-sky-300">หลักฐานที่ต้องส่ง:</strong> {loc.evidence}</p>
                        <p><strong className="text-sky-300">เกณฑ์ตรวจ:</strong> {loc.assessment}</p>
                        <p className="text-amber-200">{ACCESS_PROJECT.deadline}</p>
                        <p>{ACCESS_PROJECT.submission}</p>
                        <p className="text-sm text-slate-300">การผ่านด่านบันทึกผลแบบฝึกทบทวน ส่วนทักษะปฏิบัติและการส่งตรงเวลาประเมินจากชิ้นงานโดยครู</p>
                      </div>
                    </section>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setMissionPhase('briefing')}
                        className="bg-black/50 text-slate-300 px-4 py-2.5 rounded-xl border-2 border-slate-600 text-base font-bold hover:bg-black/80"
                      >
                        ◀ บรีฟคดี
                      </button>
                      <button
                        onClick={() => setMissionPhase('game')}
                        className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black px-6 py-3 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] cursor-pointer text-base"
                      >
                        ทำแบบฝึกทบทวน 🎮
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 3: Dynamic Mini-Game based on node type */}
                {missionPhase === 'game' && (
                  <div className="mt-6 space-y-5">
                    {/* TYPE A: Standard Multiple Choice Quiz */}
                    {loc.gameType === 'quiz' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-black text-[#38bdf8]">ทบทวนสัปดาห์นี้และสัปดาห์ก่อนหน้า • ข้อที่ {quizRound + 1}/{Math.min(10, loc.level)}</span>
                          <button
                            onClick={() => {
                              setShowHint(true);
                            }}
                            className="bg-[#facc15] hover:bg-white text-black text-base font-black px-3 py-1.5 rounded-lg border-2 border-black shadow"
                          >
                            💡 ขอคำใบ้ (Hint)
                          </button>
                        </div>

                        <div className="bg-black/50 border-2 border-slate-600 p-4 rounded-xl">
                          <p className="text-lg md:text-base text-white font-bold">{quizQuestion}</p>
                          <p className="text-[14px] text-slate-400 mt-2">ทำให้ครบ {Math.min(10, loc.level)} ข้อ • ตอบถูก {quizCorrectCount} ข้อ • ตอบแล้วกดข้อถัดไปได้เลย</p>
                        </div>

                        {showHint && (
                          <div className="bg-amber-400/20 border-2 border-amber-400 rounded-xl p-3 text-base text-amber-300 font-bold">
                            💡 คำใบ้จากอาจารย์ที่ปรึกษา: {CURRICULUM_MAP_NODES[loc.level - 1 - quizRound].hint}
                          </div>
                        )}

                        <div className="space-y-2.5">
                          {quizOptions.map((option, idx) => (
                            <button
                              key={`${quizRound}-${idx}-${option}`}
                              disabled={userSelectedOption !== null || quizSuccess === true}
                              onClick={() => {
                                if (userSelectedOption !== null || quizSuccess === true) return;
                                setUserSelectedOption(idx);
                                recordAnswer(idx === quizCorrectIndex);
                                if (idx === quizCorrectIndex) {
                                  setQuizCorrectCount(count => count + 1);
                                }
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border-3 text-base md:text-lg font-semibold transition-all shadow-[2px_2px_0px_#000] ${
                                userSelectedOption === idx
                                  ? idx === quizCorrectIndex
                                    ? 'bg-[#22c55e] text-black border-white font-black'
                                    : 'bg-rose-500 text-white border-white font-black'
                                  : 'bg-slate-900 text-slate-100 border-slate-700 hover:border-[#38bdf8]'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                            </button>
                          ))}
                        </div>
                        {userSelectedOption !== null && quizSuccess !== true && (
                          <div className="flex items-center justify-between gap-3" aria-live="polite">
                            <p className={`text-lg font-bold ${userSelectedOption === quizCorrectIndex ? 'text-green-400' : 'text-rose-400'}`}>
                              {userSelectedOption === quizCorrectIndex ? '✓ ตอบถูก' : '✗ ตอบผิด'}
                            </p>
                            <button
                              onClick={() => {
                                if (quizRound === Math.min(10, loc.level) - 1) {
                                  setQuizSuccess(true);
                                  handleCompleteLevel(loc.level);
                                } else {
                                  createQuizRound(loc, quizRound + 1);
                                }
                              }}
                              className="bg-[#38bdf8] hover:bg-sky-300 text-black font-black px-5 py-3 rounded-xl border-2 border-black"
                            >
                              {quizRound === Math.min(10, loc.level) - 1 ? 'ดูผลคะแนน' : 'ข้อถัดไป ➜'}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* TYPE B: Sorting Hierarchy Mini-game (e.g., Level 2) */}
                    {loc.gameType === 'sorting' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-black text-[#38bdf8]">มินิเกมเรียงลำดับข้อมูล (Data Hierarchy Sorting)</span>
                          <button
                            onClick={() => {
                              setShowHint(true);
                              triggerToast(`💡 คำใบ้: ${loc.hint}`);
                            }}
                            className="bg-[#facc15] text-black text-base font-black px-3 py-1.5 rounded-lg border-2 border-black shadow"
                          >
                            💡 ขอคำใบ้
                          </button>
                        </div>

                        <div className="bg-black/50 border-2 border-slate-600 p-4 rounded-xl">
                          <p className="text-lg text-white font-bold">{loc.prompt}</p>
                          <p className="text-base text-slate-400 mt-1">คลิกสลับตำแหน่งไอเทมด้านล่างให้เรียงจากเล็กไปใหญ่</p>
                        </div>

                        {showHint && (
                          <div className="bg-amber-400/20 border-2 border-amber-400 rounded-xl p-3 text-base text-amber-300 font-bold">
                            💡 คำใบ้: {loc.hint}
                          </div>
                        )}

                        <div className="space-y-2">
                          {sortingItems.map((item, idx) => (
                            <div key={idx} className={`flex items-center justify-between border-2 p-3 rounded-xl ${sortingResultMsg === 'CORRECT' ? 'bg-green-600 border-green-300' : 'bg-slate-900 border-slate-700'}`}>
                              <span className="text-base md:text-lg font-bold text-white">{idx + 1}. {item}</span>
                              <div className="space-x-2">
                                <button
                                  disabled={quizSuccess === true || idx === 0}
                                  onClick={() => {
                                    const copy = [...sortingItems];
                                    const temp = copy[idx];
                                    copy[idx] = copy[idx - 1];
                                    copy[idx - 1] = temp;
                                    setSortingItems(copy);
                                  }}
                                  className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-base border border-slate-600 disabled:opacity-30"
                                >
                                  ▲ ขึ้น
                                </button>
                                <button
                                  disabled={quizSuccess === true || idx === sortingItems.length - 1}
                                  onClick={() => {
                                    const copy = [...sortingItems];
                                    const temp = copy[idx];
                                    copy[idx] = copy[idx + 1];
                                    copy[idx + 1] = temp;
                                    setSortingItems(copy);
                                  }}
                                  className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-base border border-slate-600 disabled:opacity-30"
                                >
                                  ▼ ลง
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const isMatched = sortingItems.every((val, i) => val === loc.correctOrder[i]);
                            recordAnswer(isMatched);
                            if (isMatched) {
                              setSortingResultMsg('CORRECT');
                              setQuizSuccess(true);
                              handleCompleteLevel(loc.level);
                            } else {
                              setSortingResultMsg('INCORRECT');
                              setQuizSuccess(false);
                            }
                          }}
                          className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-3 rounded-xl border-3 border-black shadow text-base"
                        >
                          ตรวจคำตอบการเรียงลำดับ ✓
                        </button>
                      </>
                    )}

                    {/* TYPE C: Matching Data Types Mini-game (e.g., Level 10) */}
                    {loc.gameType === 'matching' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-black text-[#38bdf8]">มินิเกมจับคู่ชนิดข้อมูล (Data Type Matching)</span>
                          <button
                            onClick={() => {
                              setShowHint(true);
                              triggerToast(`💡 คำใบ้: ${loc.hint}`);
                            }}
                            className="bg-[#facc15] text-black text-base font-black px-3 py-1.5 rounded-lg border-2 border-black shadow"
                          >
                            💡 ขอคำใบ้
                          </button>
                        </div>

                        <div className="bg-black/50 border-2 border-slate-600 p-4 rounded-xl">
                          <p className="text-lg text-white font-bold">{loc.prompt}</p>
                        </div>

                        {showHint && (
                          <div className="bg-amber-400/20 border-2 border-amber-400 rounded-xl p-3 text-base text-amber-300 font-bold">
                            💡 คำใบ้: {loc.hint}
                          </div>
                        )}

                        <div className="space-y-3">
                          {loc.pairs.map((pair, idx) => (
                            <div key={idx} className={`border-2 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2 ${matchingResultMsg === 'CORRECT' ? 'bg-green-600 border-green-300' : 'bg-slate-900 border-slate-700'}`}>
                              <span className="text-base font-bold text-white">🗂️ {pair.field}</span>
                              <select
                                disabled={quizSuccess === true}
                                value={userMatches[idx] || ''}
                                onChange={(e) => setUserMatches({ ...userMatches, [idx]: e.target.value })}
                                className="bg-black/80 border-2 border-[#38bdf8] text-base text-white p-2 rounded-lg font-bold"
                              >
                                <option value="">-- เลือก Data Type --</option>
                                <option value="Date/Time">Date/Time</option>
                                <option value="Currency">Currency</option>
                                <option value="Yes/No">Yes/No</option>
                                <option value="Long Text">Long Text</option>
                                <option value="Number">Number</option>
                              </select>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const allCorrect = loc.pairs.every((pair, idx) => userMatches[idx] === pair.type);
                            recordAnswer(allCorrect);
                            if (allCorrect) {
                              setMatchingResultMsg('CORRECT');
                              setQuizSuccess(true);
                              handleCompleteLevel(loc.level);
                            } else {
                              setMatchingResultMsg('INCORRECT');
                              setQuizSuccess(false);
                            }
                          }}
                          className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-3 rounded-xl border-3 border-black shadow text-base"
                        >
                          ตรวจคำตอบการจับคู่ ✓
                        </button>
                      </>
                    )}

                    {/* Feedback Messages */}
                    {quizSuccess === true && (
                      <div className="bg-emerald-500/20 border-3 border-emerald-400 rounded-2xl p-5 text-center space-y-3">
                        {loc.gameType === 'quiz' && (
                          <p className="text-lg font-black text-white">คะแนนแบบฝึก {quizCorrectCount}/{Math.min(10, loc.level)}</p>
                        )}
                        <h4 className="text-emerald-400 font-black text-sm font-retro">
                          ★ CASE CLEAR! สำเร็จภารกิจ ★
                        </h4>
                        <p className="text-base text-slate-200 font-bold">
                          ได้รับรางวัล: +100 XP | +35 COINS | 🏅 ปลดล็อก BADGE ประจำสัปดาห์
                        </p>
                        <button
                          onClick={() => setScreen('WORLD_MAP')}
                          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-base px-6 py-2.5 rounded-xl border-2 border-black shadow cursor-pointer"
                        >
                          กลับสู่แผนที่โลก ➔
                        </button>
                      </div>
                    )}

                    {quizSuccess === false && (
                      <div className="bg-rose-500/20 border-2 border-rose-500 rounded-xl p-3 text-center">
                        <p className="text-rose-300 text-base font-bold">
                          ยังไม่ถูกต้องนะนักสืบ! ลองทบทวนบทเรียนเชิงลึกหรือกดดูคำใบ้แล้วลองใหม่อีกครั้ง
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {screen === 'CLASSROOM' && player?.role === 'teacher' && <TeacherDashboard />}
        {screen === 'CLASSROOM' && player && player.role !== 'teacher' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8 w-full space-y-6">
            <div className="bg-[#1e293b] border-4 border-[#38bdf8] rounded-3xl shadow-[8px_8px_0px_#000] p-6 md:p-8 relative">
              <div className="absolute -top-4 left-6 bg-[#fbbf24] text-black px-4 py-1 text-xs font-black rounded-lg border-2 border-black font-retro">
                VIRTUAL CLASSROOM
              </div>

              <div className="text-center mb-6 mt-2">
                <h2 className="text-xl md:text-2xl font-black text-white">อันดับการตอบคำถาม</h2>
                {player.role === 'teacher' && <p className="mt-2 text-sm font-bold text-emerald-400">บัญชีครู</p>}
                <p className="text-base text-[#38bdf8] mt-2">เรียงจากตอบถูกมากที่สุด หากเท่ากันเรียงจากตอบผิดน้อยที่สุด</p>
                <p className="text-sm text-slate-400 mt-1">ผู้เล่นทั้งหมด • อัปเดตทุก 15 วินาที • นับรวมการเล่นซ้ำและมินิเกม</p>
              </div>

              <div className="mb-5 rounded-xl border border-emerald-700 bg-emerald-950/40 p-4">
                <button type="button" disabled={exportBusy} onClick={exportScores} className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
                  {exportBusy ? 'กำลังเตรียมข้อมูล…' : 'ดาวน์โหลดคะแนนสำหรับ Google Sheets (.csv)'}
                </button>
                <p className="mt-2 text-sm text-slate-300">ใน Google Sheets เลือก ไฟล์ → นำเข้า → อัปโหลด แล้วเลือกไฟล์ที่ดาวน์โหลด</p>
                <p className="mt-1 text-sm text-slate-400">เป็นสำเนาคะแนน ณ เวลาที่ดาวน์โหลด ไม่ซิงก์อัตโนมัติ และไม่มีรหัสผ่าน</p>
                {exportError && <p role="alert" className="mt-2 text-sm text-rose-300">{exportError}</p>}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-600">
                <table className="w-full min-w-[480px] text-left text-base">
                  <caption className="sr-only">อันดับผู้เล่นตามจำนวนคำตอบถูกและผิด</caption>
                  <thead className="bg-slate-950 text-sky-300">
                    <tr>
                      <th scope="col" className="p-3 text-center">อันดับ</th>
                      <th scope="col" className="p-3">ผู้เล่น</th>
                      <th scope="col" className="p-3 text-center">ตอบถูก</th>
                      <th scope="col" className="p-3 text-center">ตอบผิด</th>
                      <th scope="col" className="p-3 text-center">ความแม่นยำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroomRanking.map((account, index, ranking) => {
                      const total = account.correct + account.incorrect;
                      const rank = ranking.findIndex(entry => entry.correct === account.correct && entry.incorrect === account.incorrect) + 1;
                      const isYou = account.username === player.username;
                      return (
                        <tr key={account.username} className={`border-t border-slate-700 ${isYou ? 'bg-sky-950/70' : 'bg-slate-900/70'}`}>
                          <td className="p-3 text-center font-black text-amber-300">{total ? rank : '—'}</td>
                          <th scope="row" className="p-3 font-bold">
                            {account.name}
                            {isYou && <span className="ml-2 text-xs text-sky-300">คุณ</span>}
                            {!total && <span className="block text-sm font-normal text-slate-400">ยังไม่ได้ตอบคำถาม</span>}
                          </th>
                          <td className="p-3 text-center font-bold text-emerald-400">{account.correct}</td>
                          <td className="p-3 text-center font-bold text-rose-400">{account.incorrect}</td>
                          <td className="p-3 text-center">{total ? `${Math.round(account.correct / total * 100)}%` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-slate-400">มินิเกมเรียงลำดับและจับคู่นับหนึ่งครั้งต่อการกดตรวจคำตอบ</p>
            </div>
          </div>
        )}
        {screen === 'INVENTORY' && player && (
          <div className="max-w-3xl mx-auto p-4 md:p-8 w-full space-y-6">
            <div className="bg-[#1e293b] border-4 border-[#fbbf24] rounded-3xl shadow-[8px_8px_0px_#000] p-6 md:p-8 relative">
              <div className="absolute -top-4 left-6 bg-[#38bdf8] text-black px-4 py-1 text-xs font-black rounded-lg border-2 border-black font-retro">
                INVENTORY & BADGES
              </div>

              <div className="bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl flex justify-between items-center mt-2">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black/50 border border-slate-600 rounded-xl flex items-center justify-center p-1">
                    <PixelDetectiveAvatar character={player.character} scale={0.7} showTool={false} />
                  </div>
                  <div>
                    <div className="text-base text-[#38bdf8] font-bold">บัญชี: {player.username}</div>
                    <div className="text-lg font-black text-white">{player.name}</div>
                    <div className="text-[14px] text-yellow-400">เหรียญ: 🪙 {player.coins} | XP: {player.xp}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setScreen('CREATE_CHAR')}
                    className="bg-[#fbbf24] text-black font-bold text-base px-3 py-2 rounded-xl border border-black hover:bg-white"
                  >
                    เปลี่ยนชุด
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-rose-600 text-white font-bold text-base px-3 py-2 rounded-xl border border-black hover:bg-rose-700"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-black text-[#facc15] mb-3 uppercase font-retro">
                  🎒 กระเป๋าอุปกรณ์นักสืบ (ITEMS)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {player.inventory.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/80 border-2 border-slate-700 rounded-xl p-3 flex items-center space-x-3">
                      <span className="text-xl">📦</span>
                      <div>
                        <div className="text-base font-bold text-white">{item}</div>
                        <div className="text-[14px] text-[#38bdf8]">ไอเทมหลักฐานคดี</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-black text-[#facc15] mb-3 uppercase font-retro">
                  🏅 เหรียญเกียรติยศ (BADGES)
                </h3>
                {player.badges.length === 0 ? (
                  <p className="text-base text-slate-400 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                    ยังไม่มีเหรียญตรา ทำภารกิจในแผนที่เพื่อปลดล็อก!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {player.badges.map((badge, idx) => (
                      <div key={idx} className="bg-slate-900/90 border-2 border-[#22c55e] rounded-xl p-3 text-center">
                        <span className="text-2xl">🏆</span>
                        <div className="text-[14px] font-black text-[#4ade80] mt-1">{badge}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {player && screen !== 'START' && screen !== 'AUTH' && screen !== 'CREATE_CHAR' && (
        <nav className="fixed bottom-0 left-0 w-full bg-[#1e1b4b]/95 border-t-4 border-[#38bdf8] py-2.5 px-4 flex justify-around items-center z-50 shadow-2xl">
          {[
            { id: 'WORLD_MAP', label: 'WORLD MAP', icon: '🗺️' },
            { id: 'CLASSROOM', label: player.role === 'teacher' ? 'ห้องเรียนของครู' : 'CLASSROOM', icon: '🏫' },
            { id: 'INVENTORY', label: 'INVENTORY', icon: '🎒' },
          ].map(tab => {
            const isActive = screen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className={`font-thai text-base sm:text-lg px-6 py-2 rounded-2xl border-2 flex items-center space-x-2 font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#fbbf24] text-black border-black shadow-[2px_2px_0px_#000] scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
