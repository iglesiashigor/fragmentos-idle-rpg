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
      goldCost: 20 + 22 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'wood', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'stone', quantity: rareMaterialCost }] : []),
      ],
    };
  }

  return {
      goldCost: 20 + 22 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'couro', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'fiber', quantity: rareMaterialCost }] : []),
      ],
  };
}
