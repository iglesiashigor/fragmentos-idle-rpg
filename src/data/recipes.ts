import { ARMORS, CRAFTED_ITEMS, POTIONS, WEAPONS } from './items';
import { InventoryItem, Item } from '../types/game';

export interface MaterialCost {
  itemId: string;
  quantity: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  result: Item;
  quantity: number;
  goldCost: number;
  materials: MaterialCost[];
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_health_potion',
    name: 'Poção de Cura',
    description: 'Prepara uma poção simples usando ervas frescas.',
    result: POTIONS[0],
    quantity: 1,
    goldCost: 5,
    materials: [{ itemId: 'herb', quantity: 2 }],
  },
  {
    id: 'craft_stamina_potion',
    name: 'Poção de Estamina',
    description: 'Mistura ervas e fibra para recuperar energia.',
    result: POTIONS[2],
    quantity: 1,
    goldCost: 5,
    materials: [
      { itemId: 'herb', quantity: 1 },
      { itemId: 'fiber', quantity: 2 },
    ],
  },
  {
    id: 'craft_iron_sword',
    name: 'Espada de Ferro',
    description: 'Forja uma espada confiável com madeira e minério.',
    result: WEAPONS[0],
    quantity: 1,
    goldCost: 20,
    materials: [
      { itemId: 'wood', quantity: 2 },
      { itemId: 'iron_ore', quantity: 2 },
    ],
  },
  {
    id: 'craft_leather_armor',
    name: 'Armadura de Couro',
    description: 'Costura uma armadura leve com couro e fibra.',
    result: ARMORS[0],
    quantity: 1,
    goldCost: 15,
    materials: [
      { itemId: 'couro', quantity: 2 },
      { itemId: 'fiber', quantity: 2 },
    ],
  },
  {
    id: 'craft_steel_sword',
    name: 'Espada de Aço',
    description: 'Forja uma lâmina rara com minério, madeira e pedra de apoio.',
    result: CRAFTED_ITEMS[0],
    quantity: 1,
    goldCost: 70,
    materials: [
      { itemId: 'iron_ore', quantity: 6 },
      { itemId: 'wood', quantity: 4 },
      { itemId: 'stone', quantity: 3 },
    ],
  },
  {
    id: 'craft_hunters_bow',
    name: 'Arco do Caçador',
    description: 'Produz um arco raro usando madeira flexível, couro e fibras.',
    result: CRAFTED_ITEMS[1],
    quantity: 1,
    goldCost: 65,
    materials: [
      { itemId: 'wood', quantity: 6 },
      { itemId: 'fiber', quantity: 5 },
      { itemId: 'couro', quantity: 3 },
    ],
  },
  {
    id: 'craft_runed_staff',
    name: 'Cajado Rúnico',
    description: 'Cria um cajado épico canalizando fragmentos antigos.',
    result: CRAFTED_ITEMS[2],
    quantity: 1,
    goldCost: 140,
    materials: [
      { itemId: 'wood', quantity: 6 },
      { itemId: 'ancient_fragment', quantity: 5 },
      { itemId: 'iron_ore', quantity: 4 },
    ],
  },
  {
    id: 'craft_reinforced_leather',
    name: 'Armadura Reforçada',
    description: 'Reforça couro com fibras e minério para criar uma armadura rara.',
    result: CRAFTED_ITEMS[3],
    quantity: 1,
    goldCost: 85,
    materials: [
      { itemId: 'couro', quantity: 7 },
      { itemId: 'fiber', quantity: 5 },
      { itemId: 'iron_ore', quantity: 3 },
    ],
  },
  {
    id: 'craft_explorer_hood',
    name: 'Capuz do Explorador',
    description: 'Costura um capuz raro usando fibras e fragmentos de ruínas.',
    result: CRAFTED_ITEMS[4],
    quantity: 1,
    goldCost: 60,
    materials: [
      { itemId: 'fiber', quantity: 5 },
      { itemId: 'couro', quantity: 3 },
      { itemId: 'ancient_fragment', quantity: 2 },
    ],
  },
  {
    id: 'craft_stoneguard_boots',
    name: 'Botas Guarda-Pedra',
    description: 'Monta botas raras com couro firme e pedra polida.',
    result: CRAFTED_ITEMS[5],
    quantity: 1,
    goldCost: 70,
    materials: [
      { itemId: 'couro', quantity: 4 },
      { itemId: 'stone', quantity: 5 },
      { itemId: 'fiber', quantity: 3 },
    ],
  },
  {
    id: 'craft_ancient_gauntlets',
    name: 'Manoplas Antigas',
    description: 'Restaura manoplas épicas com minério e fragmentos antigos.',
    result: CRAFTED_ITEMS[6],
    quantity: 1,
    goldCost: 150,
    materials: [
      { itemId: 'iron_ore', quantity: 8 },
      { itemId: 'ancient_fragment', quantity: 6 },
      { itemId: 'couro', quantity: 4 },
    ],
  },
  { id: 'craft_silver_spear', name: 'Lança de Prata', description: 'Forja uma lança precisa com madeira resistente.', result: CRAFTED_ITEMS[7], quantity: 1, goldCost: 100, materials: [{ itemId: 'silver_ore', quantity: 4 }, { itemId: 'hardwood', quantity: 4 }, { itemId: 'forest_resin', quantity: 2 }] },
  { id: 'craft_forest_blade', name: 'Lâmina do Bosque', description: 'Une metal e resina em uma arma ágil.', result: CRAFTED_ITEMS[8], quantity: 1, goldCost: 175, materials: [{ itemId: 'silver_ore', quantity: 6 }, { itemId: 'hardwood', quantity: 6 }, { itemId: 'forest_resin', quantity: 5 }] },
  { id: 'craft_crystal_scepter', name: 'Cetro de Cristal', description: 'Canaliza cristais e inscrições antigas.', result: CRAFTED_ITEMS[9], quantity: 1, goldCost: 200, materials: [{ itemId: 'crystal_shard', quantity: 7 }, { itemId: 'rune_dust', quantity: 5 }, { itemId: 'hardwood', quantity: 4 }] },
  { id: 'craft_thorn_armor', name: 'Armadura de Espinhos', description: 'Costura couro com fibras resistentes.', result: CRAFTED_ITEMS[10], quantity: 1, goldCost: 110, materials: [{ itemId: 'couro', quantity: 6 }, { itemId: 'thorn_fiber', quantity: 6 }, { itemId: 'forest_resin', quantity: 3 }] },
  { id: 'craft_runic_robe', name: 'Manto Rúnico', description: 'Inscreve proteção arcana em tecido antigo.', result: CRAFTED_ITEMS[11], quantity: 1, goldCost: 195, materials: [{ itemId: 'thorn_fiber', quantity: 8 }, { itemId: 'rune_dust', quantity: 6 }, { itemId: 'ancient_fragment', quantity: 5 }] },
  { id: 'craft_silver_helm', name: 'Elmo de Prata', description: 'Molda um elmo resistente e leve.', result: CRAFTED_ITEMS[12], quantity: 1, goldCost: 105, materials: [{ itemId: 'silver_ore', quantity: 5 }, { itemId: 'couro', quantity: 3 }, { itemId: 'stone', quantity: 3 }] },
  { id: 'craft_grove_gloves', name: 'Luvas da Clareira', description: 'Trança fibras e couro em luvas ágeis.', result: CRAFTED_ITEMS[13], quantity: 1, goldCost: 90, materials: [{ itemId: 'thorn_fiber', quantity: 6 }, { itemId: 'couro', quantity: 4 }, { itemId: 'forest_resin', quantity: 2 }] },
  { id: 'craft_relic_leggings', name: 'Grevas da Relíquia', description: 'Recupera grevas com um núcleo intacto.', result: CRAFTED_ITEMS[14], quantity: 1, goldCost: 190, materials: [{ itemId: 'relic_core', quantity: 3 }, { itemId: 'silver_ore', quantity: 6 }, { itemId: 'rune_dust', quantity: 4 }] },
  { id: 'craft_pathfinder_boots', name: 'Botas do Desbravador', description: 'Prepara botas para trilhas perigosas.', result: CRAFTED_ITEMS[15], quantity: 1, goldCost: 95, materials: [{ itemId: 'couro', quantity: 5 }, { itemId: 'hardwood', quantity: 3 }, { itemId: 'thorn_fiber', quantity: 4 }] },
  { id: 'craft_greater_health_potion', name: 'Poção de Cura Maior', description: 'Prepara uma dose forte com flores lunares.', result: POTIONS[3], quantity: 1, goldCost: 20, materials: [{ itemId: 'herb', quantity: 3 }, { itemId: 'moonflower', quantity: 2 }] },
  { id: 'craft_greater_mana_potion', name: 'Poção de Mana Maior', description: 'Infunde cristais em uma essência lunar.', result: POTIONS[4], quantity: 1, goldCost: 20, materials: [{ itemId: 'moonflower', quantity: 2 }, { itemId: 'crystal_shard', quantity: 1 }] },
  { id: 'craft_greater_stamina_potion', name: 'Poção de Estamina Maior', description: 'Mistura flores e fibras revigorantes.', result: POTIONS[5], quantity: 1, goldCost: 20, materials: [{ itemId: 'moonflower', quantity: 2 }, { itemId: 'thorn_fiber', quantity: 2 }] },
];

export const MAX_EQUIPMENT_UPGRADE = 10;

export function getEquipmentUpgradePowerGain(item: InventoryItem) {
  const rarityBonus = {
    common: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  }[item.rarity || 'common'];
  const milestoneBonus = ((item.upgradeLevel || 0) + 1) % 5 === 0 ? 1 : 0;
  return rarityBonus + milestoneBonus;
}

export function getEquipmentUpgradeCost(item: InventoryItem): {
  goldCost: number;
  materials: MaterialCost[];
} {
  const nextLevel = (item.upgradeLevel || 0) + 1;
  const oreCost = Math.max(1, Math.floor((nextLevel + 1) / 2));
  const rareMaterialCost = nextLevel >= 6 ? 1 : 0;

  if (item.type === 'weapon') {
    return {
      goldCost: 30 + 28 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'wood', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'crystal_shard', quantity: rareMaterialCost }] : []),
      ],
    };
  }

  return {
      goldCost: 30 + 28 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'couro', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'thorn_fiber', quantity: rareMaterialCost }] : []),
      ],
  };
}
