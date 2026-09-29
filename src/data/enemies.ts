import { Character, Enemy } from '../types/game';
import { getBossBalance, getEnemyBalance } from './balance';
import { CRAFTED_ITEMS, LOOT, RARE_ITEMS } from './items';
import { RESOURCE_BY_ID } from './resources';
import { calculateCharacterStats } from '../utils/combatStats';

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
    earlyLoot: [{ item: CRAFTED_ITEMS[0], chance: 0.55 }, { item: LOOT[0], chance: 1.0 }],
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
    earlyLoot: [{ item: CRAFTED_ITEMS[4], chance: 0.55 }, { item: LOOT[1], chance: 1.0 }],
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
    earlyLoot: [{ item: CRAFTED_ITEMS[5], chance: 0.55 }, { item: LOOT[2], chance: 1.0 }],
  },
  {
    name: 'Ent da Floresta', title: 'Guardião das Raízes',
    description: 'Um ancestral do bosque que golpeia invasores com galhos de madeira de lei.',
    baseHealth: 225, baseDamage: 24, baseExp: 128,
    ability: { name: 'Raízes Esmagadoras', damageRatio: 1.3 },
    loot: [{ item: RARE_ITEMS[1], chance: 0.3 }, { item: CRAFTED_ITEMS[8], chance: 0.45 }, { item: RESOURCE_BY_ID.forest_resin, chance: 1 }],
    earlyLoot: [{ item: CRAFTED_ITEMS[7], chance: 0.5 }, { item: RESOURCE_BY_ID.hardwood, chance: 1 }],
  },
  {
    name: 'Aranha da Lua', title: 'Rainha da Clareira',
    description: 'Tecelã monstruosa que protege as flores noturnas da clareira.',
    baseHealth: 200, baseDamage: 27, baseExp: 132,
    ability: { name: 'Teia Cortante', damageRatio: 1.4 },
    loot: [{ item: RARE_ITEMS[7], chance: 0.3 }, { item: CRAFTED_ITEMS[10], chance: 0.45 }, { item: RESOURCE_BY_ID.thorn_fiber, chance: 1 }],
    earlyLoot: [{ item: CRAFTED_ITEMS[13], chance: 0.5 }, { item: RESOURCE_BY_ID.moonflower, chance: 1 }],
  },
  {
    name: 'Sentinela Rúnica', title: 'Vigia das Ruínas',
    description: 'Construto antigo movido por um núcleo de relíquia.',
    baseHealth: 245, baseDamage: 25, baseExp: 140,
    ability: { name: 'Pulso Rúnico', damageRatio: 1.35 },
    loot: [{ item: RARE_ITEMS[8], chance: 0.3 }, { item: CRAFTED_ITEMS[14], chance: 0.45 }, { item: RESOURCE_BY_ID.relic_core, chance: 1 }],
    earlyLoot: [{ item: CRAFTED_ITEMS[6], chance: 0.5 }, { item: RESOURCE_BY_ID.rune_dust, chance: 1 }],
  },
];

export function getBossPreview(level: number, character?: Character) {
  const safeLevel = Math.max(1, level);
  const bossType = BOSS_TYPES[safeLevel % BOSS_TYPES.length];
  const balance = getBossBalance(safeLevel);
  const playerStats = character && calculateCharacterStats(character);

  return {
    name: bossType.name,
    title: bossType.title,
    description: bossType.description,
    abilityName: bossType.ability.name,
    estimatedHealth: Math.max(
      Math.floor(bossType.baseHealth * balance.healthMultiplier),
      playerStats ? Math.round(Math.max(playerStats.attack, playerStats.magicPower) * 6) : 0
    ),
    estimatedDamage: Math.max(
      Math.floor(bossType.baseDamage * balance.damageMultiplier),
      playerStats ? Math.round(playerStats.maxHealth * 0.16 + playerStats.defense * 0.35) : 0
    ),
    possibleLoot: (safeLevel >= 8 ? bossType.loot : bossType.earlyLoot)
      .filter((lootItem) => lootItem.item.type !== 'loot')
      .map((lootItem) => lootItem.item.name),
  };
}

export function generateBoss(level: number, character?: Character): Enemy {
  const safeLevel = Math.max(1, level);
  const bossType = BOSS_TYPES[safeLevel % BOSS_TYPES.length];
  const balance = getBossBalance(safeLevel);
  const preview = getBossPreview(safeLevel, character);
  const damage = preview.estimatedDamage;
  const maxHealth = preview.estimatedHealth;
  const loot = (safeLevel >= 8 ? bossType.loot : bossType.earlyLoot)
    .filter((lootItem) => Math.random() <= lootItem.chance)
    .map((lootItem) => lootItem.item);

  return {
    name: bossType.name,
    health: maxHealth,
    maxHealth,
    damage,
    defense: balance.defenseBonus,
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
      minLevel: 1,
      baseHealth: 42,
      baseDamage: 8,
      baseLoot: [{ item: LOOT[2], chance: 0.4 }],
      baseExp: 28,
    },
    {
      name: 'Lobo',
      minLevel: 1,
      baseHealth: 36,
      baseDamage: 10,
      baseLoot: [{ item: LOOT[1], chance: 0.8 }],
      baseExp: 24,
    },
    {
      name: 'Bandido',
      minLevel: 1,
      baseHealth: 46,
      baseDamage: 9,
      baseLoot: [{ item: LOOT[2], chance: 0.4 }],
      baseExp: 30,
    },
    {
      name: 'Ogros',
      minLevel: 3,
      baseHealth: 58,
      baseDamage: 12,
      baseLoot: [{ item: LOOT[0], chance: 0.9 }],
      baseExp: 35,
    },
    { name: 'Aranha de Espinhos', minLevel: 2, baseHealth: 39, baseDamage: 11, baseLoot: [{ item: RESOURCE_BY_ID.thorn_fiber, chance: 0.6 }], baseExp: 27, ability: { name: 'Mordida Venenosa', ratio: 1.2 } },
    { name: 'Saqueador da Pedreira', minLevel: 3, baseHealth: 51, baseDamage: 10, baseLoot: [{ item: RESOURCE_BY_ID.silver_ore, chance: 0.45 }], baseExp: 33, ability: { name: 'Golpe de Picareta', ratio: 1.25 } },
    { name: 'Espírito das Ruínas', minLevel: 4, baseHealth: 44, baseDamage: 13, baseLoot: [{ item: RESOURCE_BY_ID.rune_dust, chance: 0.55 }], baseExp: 34, ability: { name: 'Toque Espectral', ratio: 1.25 } },
    { name: 'Javali de Casca', minLevel: 2, baseHealth: 56, baseDamage: 11, baseLoot: [{ item: RESOURCE_BY_ID.hardwood, chance: 0.5 }], baseExp: 31, ability: { name: 'Investida Selvagem', ratio: 1.2 } },
    { name: 'Sentinela Quebrada', minLevel: 6, baseHealth: 66, baseDamage: 14, baseLoot: [{ item: RESOURCE_BY_ID.relic_core, chance: 0.3 }], baseExp: 42, ability: { name: 'Pulso Instável', ratio: 1.3 } },
    { name: 'Lobo Lunar', minLevel: 5, baseHealth: 48, baseDamage: 14, baseLoot: [{ item: RESOURCE_BY_ID.moonflower, chance: 0.5 }], baseExp: 37, ability: { name: 'Salto Lunar', ratio: 1.25 } },
  ];

  const availableTypes = types.filter((type) => type.minLevel <= safeLevel);
  const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const balance = getEnemyBalance(safeLevel);
  const loot = enemyType.baseLoot
    .filter(() => Math.random() <= 0.7)
    .filter((lootItem) => Math.random() <= lootItem.chance)
    .map((lootItem) => lootItem.item);
  const damage = enemyType.baseDamage + balance.damageBonus;
  const ability = 'ability' in enemyType ? enemyType.ability : undefined;

  return {
    name: enemyType.name,
    health: enemyType.baseHealth + balance.healthBonus,
    maxHealth: enemyType.baseHealth + balance.healthBonus,
    damage,
    defense: balance.defenseBonus,
    level: safeLevel,
    loot,
    experience: enemyType.baseExp * balance.experienceMultiplier,
    abilities: ability ? [{ name: ability.name, damage: Math.floor(damage * ability.ratio), cooldown: 3 }] : undefined,
    isBoss: false,
  };
}
