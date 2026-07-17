import { Item, Spell } from '../types/game';
import { RESOURCE_BY_ID, RESOURCE_POOLS } from '../data/resources';

export const RARE_WEAPONS: Item[] = [
  {
    id: 'legendary_sword',
    name: 'Legendary Sword',
    type: 'weapon',
    price: 500,
    power: 25,
    description: 'A powerful ancient sword',
  },
  {
    id: 'thunder_axe',
    name: 'Thunder Axe',
    type: 'weapon',
    price: 600,
    power: 30,
    description: 'An axe imbued with lightning',
  },
];

export const RARE_SPELLS: Spell[] = [
  {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    damage: 35,
    manaCost: 25,
    level: 1,
    description: 'Strikes enemies with lightning',
  },
  {
    id: 'meteor',
    name: 'Meteor Strike',
    damage: 45,
    manaCost: 40,
    level: 1,
    description: 'Calls down a devastating meteor',
  },
];

export interface GatheringReward {
  type: 'resource';
  sourceName: string;
  rewards: { item: Item; quantity: number }[];
}

export type RandomEventReward =
  | { type: 'spell' | 'item'; reward: Spell | Item }
  | GatheringReward;

export function generateRandomEvent(
  level: number,
  allowSpells = true
): RandomEventReward {
  const isSpell = allowSpells && Math.random() > 0.5;
  
  if (isSpell) {
    const spell = RARE_SPELLS[Math.floor(Math.random() * RARE_SPELLS.length)];
    return {
      type: 'spell',
      reward: {
        ...spell,
        damage: spell.damage + level * 5,
      },
    };
  }

  const item = RARE_WEAPONS[Math.floor(Math.random() * RARE_WEAPONS.length)];
  return {
    type: 'item',
    reward: {
      ...item,
      power: (item.power || 0) + level * 2,
    },
  };
}

export function generateGatheringEvent(
  level: number,
  resourcePool = 'forest'
): GatheringReward {
  const pool = RESOURCE_POOLS[resourcePool] || RESOURCE_POOLS.forest;
  const rewards = pool.items
    .map((itemId) => ({
      item: RESOURCE_BY_ID[itemId],
      quantity: Math.max(1, Math.floor(Math.random() * 2) + level),
    }))
    .filter((reward) => Boolean(reward.item));

  return {
    type: 'resource',
    sourceName: pool.name,
    rewards,
  };
}
