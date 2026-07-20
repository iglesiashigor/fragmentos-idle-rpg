import { Enemy } from '../types/game';
import { LOOT, RARE_ITEMS } from './items';

const BOSS_TYPES = [
  {
    name: 'Dragão Ancião',
    baseHealth: 210,
    baseDamage: 26,
    baseExp: 120,
    loot: [
      { item: RARE_ITEMS[0], chance: 0.4 }, // Espada Lendária
      { item: RARE_ITEMS[1], chance: 0.3 }, // Armadura do Dragão
      { item: RARE_ITEMS[6], chance: 0.25 },
      { item: LOOT[0], chance: 1.0 }, // Garantido
    ],
  },
  {
    name: 'Lich Supremo',
    baseHealth: 190,
    baseDamage: 28,
    baseExp: 130,
    loot: [
      { item: RARE_ITEMS[2], chance: 0.4 }, // Cajado do Poder
      { item: RARE_ITEMS[3], chance: 0.3 }, // Manto das Sombras
      { item: RARE_ITEMS[7], chance: 0.25 },
      { item: LOOT[1], chance: 1.0 }, // Garantido
    ],
  },
  {
    name: 'Golem Ancestral',
    baseHealth: 250,
    baseDamage: 23,
    baseExp: 125,
    loot: [
      { item: RARE_ITEMS[4], chance: 0.4 }, // Martelo Titânico
      { item: RARE_ITEMS[5], chance: 0.3 }, // Armadura de Cristal
      { item: RARE_ITEMS[8], chance: 0.25 },
      { item: RARE_ITEMS[9], chance: 0.25 },
      { item: LOOT[2], chance: 1.0 }, // Garantido
    ],
  },
];

export function generateBoss(level: number): Enemy {
  const bossType = BOSS_TYPES[Math.floor(Math.random() * BOSS_TYPES.length)];
  
  // Generate loot based on chances
  const loot = bossType.loot
    .filter(lootItem => Math.random() <= lootItem.chance)
    .map(lootItem => lootItem.item);

  const healthScalingFactor = 1 + level * 0.28;
  const damageScalingFactor = 1 + level * 0.18;

  return {
    name: bossType.name,
    health: Math.floor(bossType.baseHealth * healthScalingFactor),
    maxHealth: Math.floor(bossType.baseHealth * healthScalingFactor),
    damage: Math.floor(bossType.baseDamage * damageScalingFactor),
    level,
    loot,
    experience: bossType.baseExp * level,
    isBoss: true,
  };
}

export function generateEnemy(level: number): Enemy {
  const types = [
    { 
      name: 'Goblim', 
      baseHealth: 42,
      baseDamage: 8,
      baseLoot: [
        { item: LOOT[2], chance: 0.4 },
      ],
      baseExp: 28 
    },
    { 
      name: 'Lobo', 
      baseHealth: 36,
      baseDamage: 10,
      baseLoot: [
        { item: LOOT[1], chance: 0.8 },
      ],
      baseExp: 24 
    },
    { 
      name: 'Bandido', 
      baseHealth: 46,
      baseDamage: 9,
      baseLoot: [
        { item: LOOT[2], chance: 0.4 },
      ],
      baseExp: 30 
    },
    { 
      name: 'Ogros', 
      baseHealth: 58,
      baseDamage: 12,
      baseLoot: [
        { item: LOOT[0], chance: 0.9 },
      ],
      baseExp: 35 
    },
  ];

  const enemyType = types[Math.floor(Math.random() * types.length)];
  
  const loot = enemyType.baseLoot
    .filter(() => Math.random() <= 0.7)
    .filter(lootItem => Math.random() <= lootItem.chance)
    .map(lootItem => lootItem.item);

  return {
    name: enemyType.name,
    health: enemyType.baseHealth + level * 22,
    maxHealth: enemyType.baseHealth + level * 22,
    damage: enemyType.baseDamage + level * 4,
    level,
    loot,
    experience: enemyType.baseExp * level,
    isBoss: false,
  };
}
