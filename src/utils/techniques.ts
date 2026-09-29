import { Ability, Spell } from '../types/game';

export const cleanTechniqueDescription = (description: string) =>
  description.replace(/(?: \(Nível \d+\))+$/u, '');

export function upgradeTechnique<T extends Spell | Ability>(technique: T): T {
  return {
    ...technique,
    level: technique.level + 1,
    damage: technique.damage + Math.floor(technique.damage * 0.2),
    description: cleanTechniqueDescription(technique.description),
  };
}
