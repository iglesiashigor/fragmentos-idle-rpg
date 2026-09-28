import { ProfessionId, ProfessionProgress } from '../types/game';

export const MAX_PROFESSION_LEVEL = 10;

export interface ProfessionDefinition {
  id: ProfessionId;
  name: string;
  description: string;
  resourcePools: string[];
}

export const PROFESSIONS: ProfessionDefinition[] = [
  {
    id: 'woodcutter',
    name: 'Lenhador',
    description: 'Especialista em madeira e fibras naturais do bosque.',
    resourcePools: ['forest'],
  },
  {
    id: 'gatherer',
    name: 'Coletor',
    description: 'Especialista em ervas, plantas e materiais leves.',
    resourcePools: ['grove'],
  },
  {
    id: 'miner',
    name: 'Minerador',
    description: 'Especialista em pedra e minérios da pedreira.',
    resourcePools: ['quarry'],
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Especialista em ruínas e achados antigos.',
    resourcePools: ['ruins'],
  },
];

export const PROFESSION_BY_ID = Object.fromEntries(
  PROFESSIONS.map((profession) => [profession.id, profession])
) as Record<ProfessionId, ProfessionDefinition>;

export function getProfessionForResourcePool(resourcePool?: string) {
  if (!resourcePool) return undefined;
  return PROFESSIONS.find((profession) => profession.resourcePools.includes(resourcePool));
}

export function createProfession(id: ProfessionId) {
  return {
    id,
    level: 1,
    experience: 0,
  };
}

export function getProfessionRequiredExperience(level: number) {
  if (level >= MAX_PROFESSION_LEVEL) return 0;
  return 60 + (level - 1) * 35;
}

export function getProfessionYieldBonus(level: number) {
  return Math.floor(level / 4);
}

export function getProfessionExtraChance(level: number) {
  return Math.min(0.45, 0.08 + level * 0.025);
}

export function getGatheringProfessionUpdate(
  profession: ProfessionProgress | undefined,
  resourcePool?: string,
  roll = Math.random()
): { profession: ProfessionProgress | undefined; quantityBonus: number } {
  if (!profession || !resourcePool) return { profession, quantityBonus: 0 };
  if (!PROFESSION_BY_ID[profession.id].resourcePools.includes(resourcePool)) {
    return { profession, quantityBonus: 0 };
  }

  const quantityBonus = getProfessionYieldBonus(profession.level) +
    (roll < getProfessionExtraChance(profession.level) ? 1 : 0);
  if (profession.level >= MAX_PROFESSION_LEVEL) {
    return {
      profession: { ...profession, level: MAX_PROFESSION_LEVEL, experience: 0 },
      quantityBonus,
    };
  }

  let next = { ...profession, experience: profession.experience + 25 };
  while (next.level < MAX_PROFESSION_LEVEL && next.experience >= getProfessionRequiredExperience(next.level)) {
    next = {
      ...next,
      experience: next.experience - getProfessionRequiredExperience(next.level),
      level: next.level + 1,
    };
  }
  if (next.level >= MAX_PROFESSION_LEVEL) next = { ...next, experience: 0 };
  return { profession: next, quantityBonus };
}
