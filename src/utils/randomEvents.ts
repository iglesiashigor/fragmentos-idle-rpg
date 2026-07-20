import { Item, Spell } from '../types/game';
import { RARE_ITEMS } from '../data/items';
import { RESOURCE_BY_ID, RESOURCE_POOLS } from '../data/resources';

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

  const item = RARE_ITEMS[Math.floor(Math.random() * RARE_ITEMS.length)];
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
  const itemId = pool.items[Math.floor(Math.random() * pool.items.length)];
  const item = RESOURCE_BY_ID[itemId];
  const rewards = item
    ? [
        {
          item,
          quantity: Math.max(1, level),
        },
      ]
    : [];

  return {
    type: 'resource',
    sourceName: pool.name,
    rewards,
  };
}
