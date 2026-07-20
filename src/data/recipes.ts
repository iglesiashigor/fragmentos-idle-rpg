import { ARMORS, POTIONS, WEAPONS } from './items';
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
    goldCost: 25,
    materials: [
      { itemId: 'wood', quantity: 2 },
      { itemId: 'iron_ore', quantity: 3 },
    ],
  },
  {
    id: 'craft_leather_armor',
    name: 'Armadura de Couro',
    description: 'Costura uma armadura leve com couro e fibra.',
    result: ARMORS[0],
    quantity: 1,
    goldCost: 20,
    materials: [
      { itemId: 'couro', quantity: 3 },
      { itemId: 'fiber', quantity: 2 },
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
  const oreCost = Math.ceil(nextLevel / 2);
  const rareMaterialCost = nextLevel >= 6 ? 1 : 0;

  if (item.type === 'weapon') {
    return {
      goldCost: 30 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'wood', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'stone', quantity: rareMaterialCost }] : []),
      ],
    };
  }

  return {
    goldCost: 30 * nextLevel,
      materials: [
        { itemId: 'iron_ore', quantity: oreCost },
        { itemId: 'couro', quantity: nextLevel },
        ...(rareMaterialCost ? [{ itemId: 'fiber', quantity: rareMaterialCost }] : []),
      ],
  };
}
