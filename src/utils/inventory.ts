import { InventoryItem, Item } from '../types/game';

export const MAX_INVENTORY_SLOTS = 12;

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
  inventory: InventoryItem[]
): InventoryItem[] {
  if (isStackableItem(item)) {
    const existingItem = inventory.find(
      (inventoryItem) => inventoryItem.id === item.id
    );

    if (existingItem) {
      return inventory.map((inventoryItem) =>
        inventoryItem.id === item.id
          ? { ...inventoryItem, quantity: inventoryItem.quantity + 1 }
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
      quantity: 1,
      instanceId: isStackableItem(item) ? undefined : crypto.randomUUID(),
    },
  ];
}
