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
  { id: 'hardwood', name: 'Madeira de Lei', type: 'loot', price: 5, resourceCategory: 'wood', description: 'Madeira densa para arcos e cabos superiores.' },
  { id: 'forest_resin', name: 'Resina do Bosque', type: 'loot', price: 4, resourceCategory: 'wood', description: 'Resina usada para fortalecer e impermeabilizar equipamentos.' },
  { id: 'silver_ore', name: 'Minério de Prata', type: 'loot', price: 6, resourceCategory: 'ore', description: 'Metal raro para armas de precisão.' },
  { id: 'crystal_shard', name: 'Cristal Bruto', type: 'loot', price: 7, resourceCategory: 'stone', description: 'Cristal que amplifica magia e reforços avançados.' },
  { id: 'moonflower', name: 'Flor Lunar', type: 'loot', price: 5, resourceCategory: 'herb', description: 'Flor rara usada em poções potentes.' },
  { id: 'thorn_fiber', name: 'Fibra de Espinho', type: 'loot', price: 4, resourceCategory: 'fiber', description: 'Fibra firme usada em vestimentas resistentes.' },
  { id: 'rune_dust', name: 'Pó Rúnico', type: 'loot', price: 6, resourceCategory: 'stone', description: 'Pó antigo para inscrições arcanas.' },
  { id: 'relic_core', name: 'Núcleo de Relíquia', type: 'loot', price: 10, resourceCategory: 'stone', description: 'Peça intacta de um artefato esquecido.' },
];

export const RESOURCE_BY_ID = Object.fromEntries(
  RESOURCES.map((resource) => [resource.id, resource])
) as Record<string, Item>;

export const RESOURCE_UNLOCK_LEVELS: Record<string, number> = {
  forest_resin: 2, thorn_fiber: 2, hardwood: 3, moonflower: 3,
  silver_ore: 4, rune_dust: 4, crystal_shard: 5, relic_core: 6,
};

export const RESOURCE_POOLS: Record<string, { name: string; items: string[] }> = {
  forest: {
    name: 'Bosque Antigo',
    items: ['wood', 'wood', 'wood', 'hardwood', 'forest_resin'],
  },
  quarry: {
    name: 'Pedreira',
    items: ['stone', 'stone', 'iron_ore', 'iron_ore', 'silver_ore', 'crystal_shard'],
  },
  grove: {
    name: 'Clareira de Ervas',
    items: ['herb', 'herb', 'fiber', 'fiber', 'moonflower', 'thorn_fiber'],
  },
  ruins: {
    name: 'Ruínas Abandonadas',
    items: ['ancient_fragment', 'ancient_fragment', 'rune_dust', 'relic_core'],
  },
};
