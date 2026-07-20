import { Item } from '../types/game';

export const WEAPONS: Item[] = [
  {
    id: 'sword',
    name: 'Espada de Ferro',
    type: 'weapon',
    price: 70,
    power: 8,
    description: 'Uma espada bÃ¡sica e confiÃ¡vel',
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
    description: 'Cajado mÃ¡gico',
  },
  {
    id: 'bow',
    name: 'Arco de Caça',
    type: 'weapon',
    price: 90,
    power: 10,
    description: 'Arco leve para ataques precisos à distância',
  },
];

export const ARMORS: Item[] = [
  {
    id: 'leather',
    name: 'Armadura de Couro',
    type: 'armor',
    price: 65,
    power: 5,
    description: 'ProteÃ§Ã£o bÃ¡sica para o peitoral',
  },
  {
    id: 'chainmail',
    name: 'Armadura de Placa',
    type: 'armor',
    price: 110,
    power: 9,
    description: 'Armadura pesada e resistente',
  },
  {
    id: 'robe',
    name: 'Manto MÃ¡gico',
    type: 'armor',
    price: 80,
    power: 6,
    description: 'Manto imbuÃ­do em magia',
  },
];

export const HELMETS: Item[] = [
  {
    id: 'iron_helmet',
    name: 'Elmo de Ferro',
    type: 'helmet',
    price: 60,
    power: 4,
    description: 'Protege a cabeÃ§a contra golpes diretos',
  },
  {
    id: 'mage_hat',
    name: 'ChapÃ©u de Mago',
    type: 'helmet',
    price: 70,
    power: 3,
    description: 'ChapÃ©u leve usado por conjuradores',
  },
];

export const GLOVES: Item[] = [
  {
    id: 'leather_gloves',
    name: 'Luvas de Couro',
    type: 'gloves',
    price: 45,
    power: 3,
    description: 'Luvas simples para proteger as mÃ£os',
  },
  {
    id: 'iron_gauntlets',
    name: 'Manoplas de Ferro',
    type: 'gloves',
    price: 75,
    power: 5,
    description: 'Manoplas pesadas para combate prÃ³ximo',
  },
];

export const PANTS: Item[] = [
  {
    id: 'traveler_pants',
    name: 'CalÃ§as de Viajante',
    type: 'pants',
    price: 50,
    power: 3,
    description: 'CalÃ§as reforÃ§adas para longas jornadas',
  },
  {
    id: 'iron_leggings',
    name: 'Grevas de Ferro',
    type: 'pants',
    price: 85,
    power: 6,
    description: 'ProteÃ§Ã£o pesada para as pernas',
  },
];

export const BOOTS: Item[] = [
  {
    id: 'leather_boots',
    name: 'Botas de Couro',
    type: 'boots',
    price: 45,
    power: 3,
    description: 'Botas resistentes para trilhas perigosas',
  },
  {
    id: 'iron_boots',
    name: 'Botas de Ferro',
    type: 'boots',
    price: 80,
    power: 5,
    description: 'Botas pesadas para proteÃ§Ã£o extra',
  },
];

export const EQUIPMENT_ITEMS: Item[] = [
  ...WEAPONS,
  ...ARMORS,
  ...HELMETS,
  ...GLOVES,
  ...PANTS,
  ...BOOTS,
];

export const POTIONS: Item[] = [
  {
    id: 'health_potion',
    name: 'PoÃ§Ã£o de Cura',
    type: 'potion',
    price: 25,
    power: 45,
    healing: 45,
    description: 'Recupera 45 pontos de vida',
  },
  {
    id: 'mana_potion',
    name: 'PoÃ§Ã£o de Mana',
    type: 'potion',
    price: 25,
    power: 45,
    manaRestore: 45,
    description: 'Recupera 45 pontos de mana',
  },
  {
    id: 'stamina_potion',
    name: 'PoÃ§Ã£o de Estamina',
    type: 'potion',
    price: 25,
    power: 45,
    staminaRestore: 45,
    description: 'Recupera 45 pontos de estamina',
  },
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
    name: 'Porrete de Madeira',
    type: 'loot',
    price: 20,
    description: 'Pode ser vendido na loja',
  },
];

export const RARE_ITEMS: Item[] = [
  {
    id: 'legendary_sword',
    name: 'Espada LendÃ¡ria',
    type: 'weapon',
    price: 1000,
    power: 50,
    description: 'Uma espada forjada com poder ancestral',
    rarity: 'legendary',
  },
  {
    id: 'dragon_armor',
    name: 'Armadura do DragÃ£o',
    type: 'armor',
    price: 1000,
    power: 50,
    description: 'Armadura forjada com escamas de dragÃ£o',
    rarity: 'legendary',
  },
  {
    id: 'power_staff',
    name: 'Cajado do Poder',
    type: 'weapon',
    price: 1000,
    power: 50,
    description: 'Cajado imbuÃ­do com energia pura',
    rarity: 'legendary',
  },
  {
    id: 'shadow_robe',
    name: 'Manto das Sombras',
    type: 'armor',
    price: 1000,
    power: 50,
    description: 'Manto tecido com essÃªncia das sombras',
    rarity: 'legendary',
  },
  {
    id: 'titan_hammer',
    name: 'Martelo TitÃ¢nico',
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
    description: 'Armadura feita de cristais mÃ¡gicos inquebrÃ¡veis',
    rarity: 'legendary',
  },
  {
    id: 'dragon_helm',
    name: 'Elmo do DragÃ£o',
    type: 'helmet',
    price: 900,
    power: 28,
    description: 'Elmo forjado com escamas resistentes',
    rarity: 'legendary',
  },
  {
    id: 'shadow_gloves',
    name: 'Luvas das Sombras',
    type: 'gloves',
    price: 850,
    power: 24,
    description: 'Luvas leves envoltas em energia sombria',
    rarity: 'legendary',
  },
  {
    id: 'crystal_leggings',
    name: 'Grevas de Cristal',
    type: 'pants',
    price: 900,
    power: 30,
    description: 'Grevas cristalinas quase indestrutÃ­veis',
    rarity: 'legendary',
  },
  {
    id: 'ancient_boots',
    name: 'Botas Antigas',
    type: 'boots',
    price: 850,
    power: 24,
    description: 'Botas encontradas em ruÃ­nas esquecidas',
    rarity: 'legendary',
  },
];
