import { CURRICULUM_LEVEL_COUNT } from '../components/database-city-data';
type Progress = { completedLevels: number[]; badges: string[]; inventory: string[]; xp: number; coins: number; level: number };
export function completePlayerLevel<T extends Progress>(player: T, level: number): T {
  if (player.completedLevels.includes(level)) return player;
  return { ...player, xp: player.xp + 100, coins: player.coins + 35,
    level: Math.min(CURRICULUM_LEVEL_COUNT, Math.max(player.level, level + 1)),
    completedLevels: [...player.completedLevels, level],
    badges: [...player.badges, 'BADGE LV.' + String(level).padStart(2, '0')],
    inventory: [...player.inventory, '📜 Case Solved Doc #' + level],
  };
}
