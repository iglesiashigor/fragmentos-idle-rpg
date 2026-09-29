import { Item, Quest, Spell } from '../types/game';
import { CRAFTED_ITEMS } from '../data/items';
import { RESOURCE_BY_ID, RESOURCE_POOLS, RESOURCE_UNLOCK_LEVELS } from '../data/resources';

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
    const isCaravan = Math.random() < 0.5;
    return {
      type: 'gold',
      title: isCaravan ? 'Caravana Resgatada' : 'Tesouro Perdido',
      description: isCaravan
        ? 'Mercadores agradecem por abrir caminho e oferecem algumas moedas.'
        : 'Você encontrou uma bolsa antiga escondida entre marcas de viagem.',
      gold: 25 + level * 8,
    };
  }

  if (roll < 0.55) {
    const isSpring = Math.random() < 0.5;
    return {
      type: 'blessing',
      title: isSpring ? 'Fonte da Clareira' : 'Santuário Esquecido',
      description: isSpring
        ? 'A água brilhante devolve suas forças para a jornada.'
        : 'Uma energia tranquila restaura parte das suas forças.',
      healthRestore: 30 + level * 12,
      resourceRestore: 20 + level * 8,
    };
  }

  if (roll < 0.65) {
    const pools = ['forest', 'grove', 'quarry', 'ruins'];
    return generateGatheringEvent(level, pools[Math.floor(Math.random() * pools.length)]);
  }

  if (allowSpells && roll < 0.78) {
    const spell = RARE_SPELLS[Math.floor(Math.random() * RARE_SPELLS.length)];
    return {
      type: 'spell',
      reward: {
        ...spell,
        damage: spell.damage + level * 5,
      },
    };
  }

  const itemPool = level >= 8
    ? CRAFTED_ITEMS
    : CRAFTED_ITEMS.filter((candidate) => candidate.rarity === 'rare');
  const item = itemPool[Math.floor(Math.random() * itemPool.length)];
  return {
    type: 'item',
    reward: {
      ...item,
      power: (item.power || 0) + Math.floor(level / 3),
    },
  };
}

function generateMysteryQuest(level: number): QuestReward {
  const questRoll = Math.random();

  if (questRoll < 0.4) {
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
          gold: 55 + level * 12,
          experience: 60 + level * 18,
        },
        status: 'available',
      },
    };
  }

  if (questRoll >= 0.75) {
    const amount = 2 + Math.ceil(level / 5);
    return {
      type: 'quest', title: 'Cartas do Herbalista',
      description: 'Um bilhete pede flores raras para tratar os doentes da cidade.',
      quest: {
        id: `mystery_moonflower_${Date.now()}`,
        name: 'Flores para a Cidade',
        description: 'Colete flores lunares na clareira.',
        type: 'collect', requirements: { level: 1 },
        objectives: [{ target: 'moonflower', label: 'Flores lunares', amount, current: 0 }],
        rewards: { gold: 65 + level * 14, experience: 70 + level * 17 },
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
        gold: 60 + level * 12,
        experience: 65 + level * 16,
      },
      status: 'available',
    },
  };
}

export function generateGatheringEvent(
  level: number,
  resourcePool = 'forest',
  unlockLevel = level
): GatheringReward {
  const pool = RESOURCE_POOLS[resourcePool] || RESOURCE_POOLS.forest;
  const availableItems = pool.items.filter((id) => (RESOURCE_UNLOCK_LEVELS[id] || 1) <= unlockLevel);
  const itemId = availableItems[Math.floor(Math.random() * availableItems.length)];
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
