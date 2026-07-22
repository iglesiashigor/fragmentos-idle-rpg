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
    description: 'Cajado mágico',
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
    description: 'Proteção básica para o peitoral',
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
    name: 'Manto Mágico',
    type: 'armor',
    price: 80,
    power: 6,
    description: 'Manto imbuído em magia',
  },
];

export const HELMETS: Item[] = [
  {
    id: 'iron_helmet',
    name: 'Elmo de Ferro',
    type: 'helmet',
    price: 60,
    power: 4,
    description: 'Protege a cabeça contra golpes diretos',
  },
  {
    id: 'mage_hat',
    name: 'Chapéu de Mago',
    type: 'helmet',
    price: 70,
    power: 3,
    description: 'Chapéu leve usado por conjuradores',
  },
];

export const GLOVES: Item[] = [
  {
    id: 'leather_gloves',
    name: 'Luvas de Couro',
    type: 'gloves',
    price: 45,
    power: 3,
    description: 'Luvas simples para proteger as mãos',
  },
  {
    id: 'iron_gauntlets',
    name: 'Manoplas de Ferro',
    type: 'gloves',
    price: 75,
    power: 5,
    description: 'Manoplas pesadas para combate próximo',
  },
];

export const PANTS: Item[] = [
  {
    id: 'traveler_pants',
    name: 'Calças de Viajante',
    type: 'pants',
    price: 50,
    power: 3,
    description: 'Calças reforçadas para longas jornadas',
  },
  {
    id: 'iron_leggings',
    name: 'Grevas de Ferro',
    type: 'pants',
    price: 85,
    power: 6,
    description: 'Proteção pesada para as pernas',
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
    description: 'Botas pesadas para proteção extra',
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

export const CRAFTED_ITEMS: Item[] = [
  {
    id: 'steel_sword',
    name: 'Espada de Aço',
    type: 'weapon',
    price: 180,
    power: 18,
    description: 'Espada reforçada, forjada para aventureiros experientes.',
    rarity: 'rare',
  },
  {
    id: 'hunters_bow',
    name: 'Arco do Caçador',
    type: 'weapon',
    price: 175,
    power: 17,
    description: 'Arco preciso feito com madeira tratada e fibras resistentes.',
    rarity: 'rare',
  },
  {
    id: 'runed_staff',
    name: 'Cajado Rúnico',
    type: 'weapon',
    price: 260,
    power: 24,
    description: 'Cajado gravado com fragmentos antigos das ruínas.',
    rarity: 'epic',
  },
  {
    id: 'reinforced_leather',
    name: 'Armadura Reforçada',
    type: 'armor',
    price: 170,
    power: 15,
    description: 'Armadura de couro reforçada com placas e fibras firmes.',
    rarity: 'rare',
  },
  {
    id: 'explorer_hood',
    name: 'Capuz do Explorador',
    type: 'helmet',
    price: 130,
    power: 10,
    description: 'Capuz leve com proteção extra para viagens longas.',
    rarity: 'rare',
  },
  {
    id: 'stoneguard_boots',
    name: 'Botas Guarda-Pedra',
    type: 'boots',
    price: 150,
    power: 12,
    description: 'Botas resistentes criadas para atravessar pedreiras e ruínas.',
    rarity: 'rare',
  },
  {
    id: 'ancient_gauntlets',
    name: 'Manoplas Antigas',
    type: 'gloves',
    price: 260,
    power: 22,
    description: 'Manoplas restauradas com fragmentos antigos e minério refinado.',
    rarity: 'epic',
  },
];

export const POTIONS: Item[] = [
  {
    id: 'health_potion',
    name: 'Poção de Cura',
    type: 'potion',
    price: 25,
    power: 45,
    healing: 45,
    description: 'Recupera 45 pontos de vida',
  },
  {
    id: 'mana_potion',
    name: 'Poção de Mana',
    type: 'potion',
    price: 25,
    power: 45,
    manaRestore: 45,
    description: 'Recupera 45 pontos de mana',
  },
  {
    id: 'stamina_potion',
    name: 'Poção de Estamina',
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
    description: 'Armadura feita de cristais mágicos inquebráveis',
    rarity: 'legendary',
  },
  {
    id: 'dragon_helm',
    name: 'Elmo do Dragão',
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
    description: 'Grevas cristalinas quase indestrutíveis',
    rarity: 'legendary',
  },
  {
    id: 'ancient_boots',
    name: 'Botas Antigas',
    type: 'boots',
    price: 850,
    power: 24,
    description: 'Botas encontradas em ruínas esquecidas',
    rarity: 'legendary',
  },
];
