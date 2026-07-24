import { MaterialCost } from './recipes';
import { GuildProgress } from '../types/game';

export const MAX_GUILD_LEVEL = 10;

export const GUILD_FOUNDATION_COST: {
  goldCost: number;
  materials: MaterialCost[];
} = {
  goldCost: 300,
  materials: [
    { itemId: 'wood', quantity: 12 },
    { itemId: 'stone', quantity: 8 },
    { itemId: 'iron_ore', quantity: 3 },
  ],
};

export function createGuild(name: string): GuildProgress {
  return {
    name: name.trim() || 'Guilda dos Fragmentos',
    level: 1,
    foundedAt: Date.now(),
  };
}

export function getGuildUpgradeCost(level: number): {
  goldCost: number;
  materials: MaterialCost[];
} {
  const nextLevel = level + 1;
  return {
    goldCost: 180 + nextLevel * 110,
    materials: [
      { itemId: 'wood', quantity: 6 + nextLevel * 2 },
      { itemId: 'stone', quantity: 4 + nextLevel * 2 },
      { itemId: 'iron_ore', quantity: 1 + Math.ceil(nextLevel / 2) },
      ...(nextLevel >= 5
        ? [{ itemId: 'ancient_fragment', quantity: nextLevel - 3 }]
        : []),
    ],
  };
}

export function getGuildGoldBonus(guild?: GuildProgress) {
  return guild ? 1 + guild.level * 0.01 : 1;
}

export function getGuildExperienceBonus(guild?: GuildProgress) {
  return guild ? 1 + guild.level * 0.01 : 1;
}

export function getGuildGatheringBonus(guild?: GuildProgress) {
  if (!guild) return 0;
  return Math.floor(guild.level / 3);
}

export function getGuildBonusSummary(guild?: GuildProgress) {
  if (!guild) {
    return ['Bônus liberados após fundar uma guilda.'];
  }

  return [
    `+${guild.level}% ouro de combate`,
    `+${guild.level}% experiência de combate`,
    `+${getGuildGatheringBonus(guild)} recurso extra por coleta`,
  ];
}
