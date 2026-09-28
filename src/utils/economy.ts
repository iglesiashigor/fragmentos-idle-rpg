import { getGuildGoldBonus } from '../data/guild';
import { Character, Enemy } from '../types/game';

export const RESPAWN_COST = 100;

export function getRestCost(level: number) {
  return 20 + Math.max(0, level - 1) * 3;
}

export function getBossLairEntryCost(level: number) {
  return 40 + Math.max(0, level - 1) * 10;
}

export function getSellPrice(itemPrice: number, quantity: number, rarity?: 'common' | 'rare' | 'epic' | 'legendary') {
  const rate = rarity === 'legendary' ? 0.25 : rarity === 'epic' ? 0.4 : 0.5;
  return Math.max(1, Math.floor(itemPrice * rate)) * quantity;
}

export function getCombatGoldReward(
  enemy: Pick<Enemy, 'level' | 'isBoss'>,
  guild: Character['guild']
) {
  const level = Math.max(1, enemy.level);
  const base = enemy.isBoss ? 40 + level * 12 : 8 + level * 3;
  return Math.floor(base * getGuildGoldBonus(guild));
}
