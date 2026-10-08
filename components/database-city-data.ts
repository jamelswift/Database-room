import { CURRICULUM_LEVEL_COUNT } from './access-curriculum';
export { CURRICULUM_MAP_NODES, CURRICULUM_LEVEL_COUNT, ACCESS_PROJECT } from './access-curriculum';

export const DEFAULT_PLAYER = {
  name: "DETECTIVE 01",
  username: "detective01",
  password: "123",
  hp: 100,
  maxHp: 100,
  level: 1,
  xp: 0,
  maxXp: CURRICULUM_LEVEL_COUNT * 100,
  coins: 100,
  character: {
    gender: 'boy',
    skin: '#ffd1b3',
    hair: '#2c1810',
    hairStyle: 'short',
    outfit: '#3b82f6',
    hat: 'sherlock',
    tool: 'magnifier',
  },
  completedLevels: [],
  answerStats: { correct: 0, incorrect: 0 },
  inventory: ["🔍 Data Magnifier", "📁 Case Folder #01", "💾 Storage Floppy"],
  badges: [],
};

export const CLASSMATES_ON_MAP = [
  { id: 'c1', name: 'NONG PLOY (ปวช.1)', level: 8, x: 260, y: 660, hair: '#ff758f', outfit: '#a855f7', status: 'กำลังสืบคดี' },
  { id: 'c2', name: 'DETECTIVE OAT', level: 12, x: 860, y: 320, hair: '#38bdf8', outfit: '#10b981', status: 'อยู่ที่ Primary Key Shrine' },
  { id: 'c3', name: 'TECH MEEN', level: 15, x: 1300, y: 490, hair: '#fbbf24', outfit: '#f43f5e', status: 'กำลังทำ Query' },
  { id: 'c4', name: 'BOSS TEE', level: 4, x: 550, y: 390, hair: '#4ade80', outfit: '#3b82f6', status: 'ออนไลน์' },
];
