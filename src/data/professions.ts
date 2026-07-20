import { ProfessionId } from '../types/game';

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
