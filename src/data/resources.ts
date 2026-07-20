import { Item } from '../types/game';

export const RESOURCES: Item[] = [
  {
    id: 'wood',
    name: 'Madeira',
    type: 'loot',
    price: 1,
    resourceCategory: 'wood',
    description: 'Madeira comum usada para produzir e melhorar equipamentos.',
  },
  {
    id: 'herb',
    name: 'Ervas',
    type: 'loot',
    price: 1,
    resourceCategory: 'herb',
    description: 'Ervas medicinais usadas em poções e preparos.',
  },
  {
    id: 'stone',
    name: 'Pedra',
    type: 'loot',
    price: 1,
    resourceCategory: 'stone',
    description: 'Pedra bruta usada em melhorias simples.',
  },
  {
    id: 'iron_ore',
    name: 'Minério de Ferro',
    type: 'loot',
    price: 2,
    resourceCategory: 'ore',
    description: 'Minério resistente usado para armas e armaduras.',
  },
  {
    id: 'hide',
    name: 'Couro Cru',
    type: 'loot',
    price: 2,
    resourceCategory: 'hide',
    description: 'Couro de criatura usado em armaduras e reforços.',
  },
  {
    id: 'fiber',
    name: 'Fibra',
    type: 'loot',
    price: 1,
    resourceCategory: 'fiber',
    description: 'Fibra natural usada para costura e amarrações.',
  },
  {
    id: 'ancient_fragment',
    name: 'Fragmento Antigo',
    type: 'loot',
    price: 2,
    resourceCategory: 'stone',
    description: 'Fragmento encontrado em ruínas, útil para estudos e trocas.',
  },
];

export const RESOURCE_BY_ID = Object.fromEntries(
  RESOURCES.map((resource) => [resource.id, resource])
) as Record<string, Item>;

export const RESOURCE_POOLS: Record<string, { name: string; items: string[] }> = {
  forest: {
    name: 'Bosque Antigo',
    items: ['wood'],
  },
  quarry: {
    name: 'Pedreira',
    items: ['stone', 'iron_ore'],
  },
  grove: {
    name: 'Clareira de Ervas',
    items: ['herb', 'fiber'],
  },
  ruins: {
    name: 'Ruínas Abandonadas',
    items: ['ancient_fragment'],
  },
};
