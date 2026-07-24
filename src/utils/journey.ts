import { SavedCharacter } from '../types/game';
import { calculateRequiredExperience } from './experience';
import { getInventorySlotCount } from './inventory';

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

const EMPTY_STATS = {
  kills: 0,
  bossesKilled: 0,
  resourcesGathered: 0,
  itemsCrafted: 0,
  equipmentUpgrades: 0,
};

export function getJourneySteps(character: SavedCharacter): JourneyStep[] {
  const activeQuest = (character.quests || [])[0];
  const completedQuests = character.completedQuestIds || [];
  const stats = character.stats || EMPTY_STATS;
  const allEquipment = [
    ...character.inventory,
    ...Object.values(character.equipment).filter(Boolean),
  ];
  const hasCraftedEquipment = allEquipment.some(
    (item) => item?.rarity && item.rarity !== 'common'
  );
  const hasUpgradedEquipment = allEquipment.some(
    (item) => (item?.upgradeLevel || 0) > 0
  );

  return [
    {
      id: 'accept_quest',
      title: 'Pegue uma missão',
      description: activeQuest
        ? `Missão ativa: ${activeQuest.name}`
        : 'Vá até a cidade e aceite uma missão inicial.',
      progress: activeQuest || completedQuests.length > 0 ? 1 : 0,
      target: 1,
      completed: Boolean(activeQuest || completedQuests.length > 0),
    },
    {
      id: 'first_kills',
      title: 'Limpe a trilha',
      description: 'Derrote inimigos no mapa para ganhar ouro, EXP e loot.',
      progress: Math.min(stats.kills, 3),
      target: 3,
      completed: stats.kills >= 3,
    },
    {
      id: 'first_collect',
      title: 'Colete recursos',
      description: 'Use os pontos verdes do mapa para juntar materiais.',
      progress: Math.min(stats.resourcesGathered, 10),
      target: 10,
      completed: stats.resourcesGathered >= 10,
    },
    {
      id: 'first_craft',
      title: 'Produza um item',
      description: 'Na oficina da cidade, transforme recursos em equipamento ou poções.',
      progress: Math.min(stats.itemsCrafted, 1),
      target: 1,
      completed: stats.itemsCrafted >= 1 || hasCraftedEquipment,
    },
    {
      id: 'first_upgrade',
      title: 'Melhore equipamento',
      description: 'Use ouro e materiais para evoluir uma arma ou armadura.',
      progress: Math.min(stats.equipmentUpgrades, 1),
      target: 1,
      completed: stats.equipmentUpgrades >= 1 || hasUpgradedEquipment,
    },
    {
      id: 'boss_lair',
      title: 'Enfrente um chefão',
      description: 'Quando estiver preparado, entre no covil roxo do mapa.',
      progress: Math.min(stats.bossesKilled, 1),
      target: 1,
      completed: stats.bossesKilled >= 1,
    },
  ];
}

export function getJourneySummary(character: SavedCharacter) {
  const steps = getJourneySteps(character);
  const completed = steps.filter((step) => step.completed).length;
  const requiredExperience = calculateRequiredExperience(character.level);

  return {
    steps,
    completed,
    total: steps.length,
    nextStep: steps.find((step) => !step.completed),
    levelProgress:
      requiredExperience > 0
        ? Math.min(100, Math.round((character.experience / requiredExperience) * 100))
        : 100,
    bagSlots: getInventorySlotCount(character.inventory),
  };
}
