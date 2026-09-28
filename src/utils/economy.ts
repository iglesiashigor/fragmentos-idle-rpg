import { getGuildGoldBonus } from '../data/guild';
import { Character, Enemy } from '../types/game';

export const REST_COST = 20;
export const RESPAWN_COST = 100;
export const BOSS_LAIR_ENTRY_COST = 40;

export function getSellPrice(itemPrice: number, quantity: number) {
  return Math.floor(itemPrice * 0.7) * quantity;
}

export function getCombatGoldReward(
  enemy: Pick<Enemy, 'level' | 'isBoss'>,
  guild: Character['guild']
) {
  const level = Math.max(1, enemy.level);
  const base = enemy.isBoss ? 70 + level * 18 : 10 + level * 5;
  return Math.floor(base * getGuildGoldBonus(guild));
}
