import { Enemy } from '../types/game';
import { getBossBalance, getEnemyBalance } from './balance';
import { LOOT, RARE_ITEMS } from './items';

export const BOSS_TYPES = [
  {
    name: 'Dragão Ancião',
    title: 'Guardião das Cinzas',
    description: 'Um chefe agressivo, com golpes pesados e chance de equipamentos dracônicos.',
    baseHealth: 210,
    baseDamage: 26,
    baseExp: 120,
    ability: { name: 'Sopro de Cinzas', damageRatio: 1.35 },
    loot: [
      { item: RARE_ITEMS[0], chance: 0.45 },
      { item: RARE_ITEMS[1], chance: 0.35 },
      { item: RARE_ITEMS[6], chance: 0.25 },
      { item: LOOT[0], chance: 1.0 },
    ],
  },
  {
    name: 'Lich Supremo',
    title: 'Arquimago Esquecido',
    description: 'Um chefe arcano, perigoso para personagens com pouca defesa mágica.',
    baseHealth: 190,
    baseDamage: 28,
    baseExp: 130,
    ability: { name: 'Ruína Sombria', damageRatio: 1.45 },
    loot: [
      { item: RARE_ITEMS[2], chance: 0.45 },
      { item: RARE_ITEMS[3], chance: 0.35 },
      { item: RARE_ITEMS[7], chance: 0.25 },
      { item: LOOT[1], chance: 1.0 },
    ],
  },
  {
    name: 'Golem Ancestral',
    title: 'Colosso da Pedreira',
    description: 'Um chefe resistente, ideal para testar equipamentos melhorados.',
    baseHealth: 250,
    baseDamage: 23,
    baseExp: 125,
    ability: { name: 'Impacto Sísmico', damageRatio: 1.25 },
    loot: [
      { item: RARE_ITEMS[4], chance: 0.45 },
      { item: RARE_ITEMS[5], chance: 0.35 },
      { item: RARE_ITEMS[8], chance: 0.25 },
      { item: RARE_ITEMS[9], chance: 0.25 },
      { item: LOOT[2], chance: 1.0 },
    ],
  },
];

export function getBossPreview(level: number) {
  const safeLevel = Math.max(1, level);
  const bossType = BOSS_TYPES[safeLevel % BOSS_TYPES.length];
  const balance = getBossBalance(safeLevel);

  return {
    name: bossType.name,
    title: bossType.title,
    description: bossType.description,
    abilityName: bossType.ability.name,
    estimatedHealth: Math.floor(bossType.baseHealth * balance.healthMultiplier),
    estimatedDamage: Math.floor(bossType.baseDamage * balance.damageMultiplier),
    possibleLoot: bossType.loot.slice(0, 3).map((lootItem) => lootItem.item.name),
  };
}

export function generateBoss(level: number): Enemy {
  const safeLevel = Math.max(1, level);
  const bossType = BOSS_TYPES[Math.floor(Math.random() * BOSS_TYPES.length)];
  const balance = getBossBalance(safeLevel);
  const damage = Math.floor(bossType.baseDamage * balance.damageMultiplier);
  const maxHealth = Math.floor(bossType.baseHealth * balance.healthMultiplier);
  const loot = bossType.loot
    .filter((lootItem) => Math.random() <= lootItem.chance)
    .map((lootItem) => lootItem.item);

  return {
    name: bossType.name,
    health: maxHealth,
    maxHealth,
    damage,
    level: safeLevel,
    loot,
    experience: bossType.baseExp * balance.experienceMultiplier,
    abilities: [
      {
        name: bossType.ability.name,
        damage: Math.floor(damage * bossType.ability.damageRatio),
        cooldown: 3,
      },
    ],
    isBoss: true,
  };
}

export function generateEnemy(level: number): Enemy {
  const safeLevel = Math.max(1, level);
  const types = [
    {
      name: 'Goblim',
      baseHealth: 42,
      baseDamage: 8,
      baseLoot: [{ item: LOOT[2], chance: 0.4 }],
      baseExp: 28,
    },
    {
      name: 'Lobo',
      baseHealth: 36,
      baseDamage: 10,
      baseLoot: [{ item: LOOT[1], chance: 0.8 }],
      baseExp: 24,
    },
    {
      name: 'Bandido',
      baseHealth: 46,
      baseDamage: 9,
      baseLoot: [{ item: LOOT[2], chance: 0.4 }],
      baseExp: 30,
    },
    {
      name: 'Ogros',
      baseHealth: 58,
      baseDamage: 12,
      baseLoot: [{ item: LOOT[0], chance: 0.9 }],
      baseExp: 35,
    },
  ];

  const enemyType = types[Math.floor(Math.random() * types.length)];
  const balance = getEnemyBalance(safeLevel);
  const loot = enemyType.baseLoot
    .filter(() => Math.random() <= 0.7)
    .filter((lootItem) => Math.random() <= lootItem.chance)
    .map((lootItem) => lootItem.item);

  return {
    name: enemyType.name,
    health: enemyType.baseHealth + balance.healthBonus,
    maxHealth: enemyType.baseHealth + balance.healthBonus,
    damage: enemyType.baseDamage + balance.damageBonus,
    level: safeLevel,
    loot,
    experience: enemyType.baseExp * balance.experienceMultiplier,
    isBoss: false,
  };
}
