import { createProfession, getGatheringProfessionUpdate, getProfessionForResourcePool } from '../data/professions';
import { Character, GatheringNodeState, Item, SavedCharacter } from '../types/game';
import { getGuildGatheringBonus } from '../data/guild';
import { addItemToInventory, canAddItemToInventory } from './inventory';

export const GATHERING_NODE_MAX_CHARGES = 5;
export const GATHERING_NODE_RESET_MS = 5 * 60 * 1000;
export const MAX_GATHERING_NODE_LEVEL = 10;

export function getGatheringUpgradeCost(level: number) {
  return 100 * level;
}

export function getGatheringNodeState(
  nodes: Character['gatheringNodes'],
  nodeId: string,
  now = Date.now()
): GatheringNodeState {
  const saved = nodes?.[nodeId];
  if (!saved || (saved.remaining <= 0 && saved.resetAt <= now)) {
    return { remaining: GATHERING_NODE_MAX_CHARGES, resetAt: 0, level: saved?.level || 1 };
  }
  return saved;
}

export function consumeGatheringCharge(node: GatheringNodeState, now = Date.now()): GatheringNodeState {
  const remaining = node.remaining - 1;
  return {
    remaining,
    resetAt: remaining <= 0 ? now + GATHERING_NODE_RESET_MS : node.resetAt,
    level: node.level,
  };
}

export function collectResources(
  character: SavedCharacter,
  rewards: { item: Item; quantity: number }[],
  resourcePool?: string,
  nodeBonus = 0
) {
  const definition = getProfessionForResourcePool(resourcePool);
  const currentProfession = definition
    ? character.professions?.[definition.id] || createProfession(definition.id)
    : undefined;
  const progression = getGatheringProfessionUpdate(currentProfession, resourcePool);
  let inventory = character.inventory;
  const collectedItems: { itemId: string; quantity: number }[] = [];
  const displayedRewards: { name: string; quantity: number }[] = [];

  for (const { item, quantity } of rewards) {
    const finalQuantity = quantity + progression.quantityBonus + getGuildGatheringBonus(character.guild) + nodeBonus;
    if (!canAddItemToInventory(item, inventory)) continue;
    inventory = addItemToInventory(item, inventory, finalQuantity);
    collectedItems.push({ itemId: item.id, quantity: finalQuantity });
    displayedRewards.push({ name: item.name, quantity: finalQuantity });
  }

  return {
    inventory,
    collectedItems,
    displayedRewards,
    professions: progression.profession
      ? { ...(character.professions || {}), [progression.profession.id]: progression.profession }
      : character.professions,
  };
}
