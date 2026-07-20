import { InventoryItem, Item } from '../types/game';

export const MAX_INVENTORY_SLOTS = 12;
export type EquipmentSlotId = 'weapon' | 'armor' | 'helmet' | 'gloves' | 'pants' | 'boots';
export const EQUIPMENT_SLOTS: EquipmentSlotId[] = [
  'weapon',
  'helmet',
  'armor',
  'gloves',
  'pants',
  'boots',
];

export function isEquipmentItem(item: Pick<Item, 'type'>): item is Pick<Item, 'type'> & { type: EquipmentSlotId } {
  return EQUIPMENT_SLOTS.includes(item.type as EquipmentSlotId);
}

export function getEquipmentSlot(item: Pick<Item, 'type'>): EquipmentSlotId | null {
  return isEquipmentItem(item) ? item.type : null;
}

export function isStackableItem(item: Pick<Item, 'type'>) {
  return item.type === 'potion' || item.type === 'loot';
}

export function getInventorySlotCount(inventory: InventoryItem[]) {
  return inventory.length;
}

export function canAddItemToInventory(item: Item, inventory: InventoryItem[]) {
  if (isStackableItem(item)) {
    return (
      inventory.some((inventoryItem) => inventoryItem.id === item.id) ||
      getInventorySlotCount(inventory) < MAX_INVENTORY_SLOTS
    );
  }

  return getInventorySlotCount(inventory) < MAX_INVENTORY_SLOTS;
}

export function addItemToInventory(
  item: Item,
  inventory: InventoryItem[],
  quantity = 1
): InventoryItem[] {
  if (isStackableItem(item)) {
    const existingItem = inventory.find(
      (inventoryItem) => inventoryItem.id === item.id
    );

    if (existingItem) {
      return inventory.map((inventoryItem) =>
        inventoryItem.id === item.id
          ? { ...inventoryItem, quantity: inventoryItem.quantity + quantity }
          : inventoryItem
      );
    }
  }

  if (!canAddItemToInventory(item, inventory)) {
    return inventory;
  }

  return [
    ...inventory,
    {
      ...item,
      quantity: isStackableItem(item) ? quantity : 1,
      instanceId: isStackableItem(item) ? undefined : crypto.randomUUID(),
    },
  ];
}

export function getItemQuantity(inventory: InventoryItem[], itemId: string) {
  return inventory.find((item) => item.id === itemId)?.quantity || 0;
}

export function hasMaterials(
  inventory: InventoryItem[],
  materials: { itemId: string; quantity: number }[]
) {
  return materials.every(
    (material) => getItemQuantity(inventory, material.itemId) >= material.quantity
  );
}

export function removeMaterialsFromInventory(
  inventory: InventoryItem[],
  materials: { itemId: string; quantity: number }[]
) {
  return inventory
    .map((item) => {
      const material = materials.find((cost) => cost.itemId === item.id);
      if (!material) return item;
      return { ...item, quantity: item.quantity - material.quantity };
    })
    .filter((item) => item.quantity > 0);
}
