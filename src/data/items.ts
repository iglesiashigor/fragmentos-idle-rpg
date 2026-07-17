import { Item } from '../types/game';

export const WEAPONS: Item[] = [
  {
    id: 'sword',
    name: 'Espada de Ferro',
    type: 'weapon',
    price: 70,
    power: 8,
    description: 'Uma espada básica e confiável',
  },
  {
    id: 'axe',
    name: 'Machado de Batalha',
    type: 'weapon',
    price: 95,
    power: 12,
    description: 'Machado pesado e poderoso',
  },
  {
    id: 'staff',
    name: 'Cajado Arcano',
    type: 'weapon',
    price: 85,
    power: 9,
    description: 'Cajado magico',
  },
];

export const ARMORS: Item[] = [
  {
    id: 'leather',
    name: 'Armadura de Couro',
    type: 'armor',
    price: 65,
    power: 5,
    description: 'Proteção basica',
  },
  {
    id: 'chainmail',
    name: 'Armadura de Placa',
    type: 'armor',
    price: 110,
    power: 9,
    description: 'Sturdy chain armor',
  },
  {
    id: 'robe',
    name: 'Manto Magico',
    type: 'armor',
    price: 80,
    power: 6,
    description: 'Manto imbuido em magia',
  },
];

export const POTIONS: Item[] = [
  {
    id: 'health_potion',
    name: 'Poção de Cura',
    type: 'potion',
    price: 25,
    power: 30,
    healing: 30,
    description: 'Recupera 30 pontos de vida',
  },
  {
    id: 'mana_potion',
    name: 'Poção de Mana',
    type: 'potion',
    price: 25,
    power: 30,
    manaRestore: 30,
    description: 'Recupera 30 pontos de mana',
  },
  {
    id: 'stamina_potion',
    name: 'Poção de Estamina',
    type: 'potion',
    price: 25,
    power: 30,
    staminaRestore: 30,
    description: 'Recupera 30 pontos de estamina',
  }
];

export const LOOT: Item[] = [
  {
    id: 'garra',
    name: 'Garra',
    type: 'loot',
    price: 20,
    description: 'Pode ser vendida na loja',
  },
  {
    id: 'couro',
    name: 'Couro',
    type: 'loot',
    price: 20,
    description: 'Pode ser vendido na loja',
  },
  {
    id: 'porrete',
    name: 'Porrete de madeira',
    type: 'loot',
    price: 20,
    description: 'Pode ser vendido na loja',
  },
];

export const RARE_ITEMS: Item[] = [
  {
    id: 'legendary_sword',
    name: 'Espada Lendária',
    type: 'weapon',
    price: 1000,
    power: 50,
    description: 'Uma espada forjada com poder ancestral',
    rarity: 'legendary',
  },
  {
    id: 'dragon_armor',
    name: 'Armadura do Dragão',
    type: 'armor',
    price: 1000,
    power: 50,
    description: 'Armadura forjada com escamas de dragão',
    rarity: 'legendary',
  },
  {
    id: 'power_staff',
    name: 'Cajado do Poder',
    type: 'weapon',
    price: 1000,
    power: 50,
    description: 'Cajado imbuído com energia pura',
    rarity: 'legendary',
  },
  {
    id: 'shadow_robe',
    name: 'Manto das Sombras',
    type: 'armor',
    price: 1000,
    power: 50,
    description: 'Manto tecido com essência das sombras',
    rarity: 'legendary',
  },
  {
    id: 'titan_hammer',
    name: 'Martelo Titânico',
    type: 'weapon',
    price: 1000,
    power: 50,
    description: 'Martelo forjado por gigantes ancestrais',
    rarity: 'legendary',
  },
  {
    id: 'crystal_armor',
    name: 'Armadura de Cristal',
    type: 'armor',
    price: 1000,
    power: 50,
    description: 'Armadura feita de cristais mágicos inquebraveis',
    rarity: 'legendary',
  },
];
