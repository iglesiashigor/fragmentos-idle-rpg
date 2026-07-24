import { Item, Quest, Spell } from '../types/game';
import { RARE_ITEMS } from '../data/items';
import { RESOURCE_BY_ID, RESOURCE_POOLS } from '../data/resources';

export const RARE_SPELLS: Spell[] = [
  {
    id: 'lightning_bolt',
    name: 'Raio',
    damage: 35,
    manaCost: 25,
    level: 1,
    description: 'Atinge inimigos com uma descarga elétrica',
  },
  {
    id: 'meteor',
    name: 'Chuva de Meteoros',
    damage: 45,
    manaCost: 40,
    level: 1,
    description: 'Invoca meteoros devastadores contra o inimigo',
  },
];

export interface GatheringReward {
  type: 'resource';
  sourceName: string;
  rewards: { item: Item; quantity: number }[];
}

export interface GoldReward {
  type: 'gold';
  title: string;
  description: string;
  gold: number;
}

export interface BlessingReward {
  type: 'blessing';
  title: string;
  description: string;
  healthRestore: number;
  resourceRestore: number;
}

export interface QuestReward {
  type: 'quest';
  title: string;
  description: string;
  quest: Quest;
}

export type RandomEventReward =
  | { type: 'spell' | 'item'; reward: Spell | Item }
  | GatheringReward
  | GoldReward
  | BlessingReward
  | QuestReward;

export function generateRandomEvent(
  level: number,
  allowSpells = true
): RandomEventReward {
  const roll = Math.random();
  
  if (roll < 0.22) {
    return generateMysteryQuest(level);
  }

  if (roll < 0.4) {
    return {
      type: 'gold',
      title: 'Tesouro Perdido',
      description: 'Você encontrou uma bolsa antiga escondida entre marcas de viagem.',
      gold: 35 + level * 18,
    };
  }

  if (roll < 0.55) {
    return {
      type: 'blessing',
      title: 'Santuário Esquecido',
      description: 'Uma energia tranquila restaura parte das suas forças.',
      healthRestore: 30 + level * 12,
      resourceRestore: 20 + level * 8,
    };
  }

  if (allowSpells && roll < 0.72) {
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

function generateMysteryQuest(level: number): QuestReward {
  const questRoll = Math.random();

  if (questRoll < 0.5) {
    const amount = 2 + Math.ceil(level / 4);
    return {
      type: 'quest',
      title: 'Pedido de um Viajante',
      description: 'Um viajante ferido pede ajuda para afastar criaturas da estrada.',
      quest: {
        id: `mystery_hunt_${Date.now()}`,
        name: 'Contrato Misterioso',
        description: 'Derrote inimigos próximos para cumprir o pedido encontrado no mapa.',
        type: 'kill',
        requirements: { level: Math.max(1, level - 1) },
        objectives: [
          {
            target: 'any_enemy',
            label: 'Inimigos derrotados',
            amount,
            current: 0,
          },
        ],
        rewards: {
          gold: 80 + level * 25,
          experience: 60 + level * 18,
        },
        status: 'available',
      },
    };
  }

  const amount = 2 + Math.ceil(level / 5);
  return {
    type: 'quest',
    title: 'Mapa Rasgado',
    description: 'O mapa aponta para fragmentos antigos que alguém está disposto a comprar.',
    quest: {
      id: `mystery_relics_${Date.now()}`,
      name: 'Fragmentos no Caminho',
      description: 'Colete fragmentos antigos nas ruínas para completar o mapa rasgado.',
      type: 'collect',
      requirements: { level: Math.max(1, level - 1) },
      objectives: [
        {
          target: 'ancient_fragment',
          label: 'Fragmentos antigos',
          amount,
          current: 0,
        },
      ],
      rewards: {
        gold: 90 + level * 20,
        experience: 65 + level * 16,
      },
      status: 'available',
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
          quantity: Math.max(1, 1 + Math.floor(level / 2)),
        },
      ]
    : [];

  return {
    type: 'resource',
    sourceName: pool.name,
    rewards,
  };
}
