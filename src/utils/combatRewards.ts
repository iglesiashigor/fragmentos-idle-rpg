import { advanceDailyTasks } from '../data/dailyTasks';
import { getGuildExperienceBonus } from '../data/guild';
import { Enemy, SavedCharacter } from '../types/game';
import { getCombatGoldReward } from './economy';
import { addItemToInventory, canAddItemToInventory } from './inventory';
import { updateQuestsForCollect, updateQuestsForKill } from './questManager';

export function calculateCombatRewards(
  character: SavedCharacter,
  enemy: Enemy,
  preRewardUpdates: Partial<SavedCharacter>
) {
  const baseCharacter = { ...character, ...preRewardUpdates };
  const gold = getCombatGoldReward(enemy, character.guild);
  const experience = Math.floor(enemy.experience * getGuildExperienceBonus(character.guild));
  const collectedItems: { itemId: string; quantity: number }[] = [];
  let inventory = baseCharacter.inventory;

  for (const item of enemy.loot || []) {
    if (!canAddItemToInventory(item, inventory)) continue;
    inventory = addItemToInventory(item, inventory);
    collectedItems.push({ itemId: item.id, quantity: 1 });
  }

  const dailyProgress = advanceDailyTasks(
    baseCharacter.dailyTasks,
    baseCharacter.dailyTasksResetAt,
    baseCharacter.level,
    'kill'
  );
  const updates: Partial<SavedCharacter> = {
    ...preRewardUpdates,
    gold: baseCharacter.gold + gold,
    experience: baseCharacter.experience + experience,
    stats: {
      ...(baseCharacter.stats || {
        kills: 0,
        bossesKilled: 0,
        resourcesGathered: 0,
        itemsCrafted: 0,
        equipmentUpgrades: 0,
      }),
      kills: (baseCharacter.stats?.kills || 0) + 1,
      bossesKilled: (baseCharacter.stats?.bossesKilled || 0) + (enemy.isBoss ? 1 : 0),
    },
    dailyTasks: dailyProgress.tasks,
    dailyTasksResetAt: dailyProgress.resetAt,
    quests: updateQuestsForCollect(
      updateQuestsForKill(baseCharacter.quests || [], enemy.name),
      collectedItems
    ),
  };
  if (enemy.loot?.length) updates.inventory = inventory;

  return { updates, gold, experience, collectedItems };
}
