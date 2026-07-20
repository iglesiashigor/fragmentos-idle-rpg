import { QUESTS } from '../data/quests';
import { PROFESSIONS } from '../data/professions';
import { RESOURCE_POOLS } from '../data/resources';
import { InventoryItem, Quest, SavedCharacter } from '../types/game';
import { getItemQuantity } from './inventory';

function canProfessionCollectTarget(character: SavedCharacter, target: string) {
  if (!character.profession) return true;

  const profession = PROFESSIONS.find(
    (option) => option.id === character.profession?.id
  );
  if (!profession) return true;

  return profession.resourcePools.some((poolId) =>
    RESOURCE_POOLS[poolId]?.items.includes(target)
  );
}

export function getAvailableQuests(character: SavedCharacter) {
  const activeIds = new Set((character.quests || []).map((quest) => quest.id));
  const completedIds = new Set(character.completedQuestIds || []);

  return QUESTS.filter((quest) => {
    if (activeIds.has(quest.id) || completedIds.has(quest.id)) return false;
    if (quest.requirements.level && character.level < quest.requirements.level) {
      return false;
    }
    if (
      quest.type === 'collect' &&
      !quest.objectives.every((objective) =>
        canProfessionCollectTarget(character, objective.target)
      )
    ) {
      return false;
    }
    return (quest.requirements.previousQuests || []).every((questId) =>
      completedIds.has(questId)
    );
  });
}

export function createActiveQuest(
  quest: Quest,
  inventory: InventoryItem[]
): Quest {
  return {
    ...quest,
    status: 'active',
    objectives: quest.objectives.map((objective) => ({
      ...objective,
      current:
        quest.type === 'collect'
          ? Math.min(objective.amount, getItemQuantity(inventory, objective.target))
          : 0,
    })),
  };
}

export function isQuestReadyToClaim(quest: Quest) {
  return quest.objectives.every(
    (objective) => objective.current >= objective.amount
  );
}

export function updateQuestsForKill(quests: Quest[], enemyName: string) {
  return quests.map((quest) => {
    if (quest.status !== 'active' || quest.type !== 'kill') return quest;

    return {
      ...quest,
      objectives: quest.objectives.map((objective) => {
        if (objective.target !== 'any_enemy' && objective.target !== enemyName) {
          return objective;
        }
        return {
          ...objective,
          current: Math.min(objective.amount, objective.current + 1),
        };
      }),
    };
  });
}

export function updateQuestsForCollect(
  quests: Quest[],
  collectedItems: { itemId: string; quantity: number }[]
) {
  if (collectedItems.length === 0) return quests;

  return quests.map((quest) => {
    if (quest.status !== 'active' || quest.type !== 'collect') return quest;

    return {
      ...quest,
      objectives: quest.objectives.map((objective) => {
        const collected = collectedItems
          .filter((item) => item.itemId === objective.target)
          .reduce((total, item) => total + item.quantity, 0);

        if (collected <= 0) return objective;

        return {
          ...objective,
          current: Math.min(objective.amount, objective.current + collected),
        };
      }),
    };
  });
}
