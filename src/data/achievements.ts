import { SavedCharacter } from '../types/game';

export interface TitleAchievement {
  id: string;
  title: string;
  name: string;
  description: string;
  isUnlocked: (character: SavedCharacter) => boolean;
}

export const TITLE_ACHIEVEMENTS: TitleAchievement[] = [
  {
    id: 'slayer',
    title: 'Caçador',
    name: 'Caçador de Criaturas',
    description: 'Derrote 25 inimigos.',
    isUnlocked: (character) => (character.stats?.kills || 0) >= 25,
  },
  {
    id: 'boss_breaker',
    title: 'Desafiador',
    name: 'Desafiador de Chefões',
    description: 'Derrote 3 chefões.',
    isUnlocked: (character) => (character.stats?.bossesKilled || 0) >= 3,
  },
  {
    id: 'master_gatherer',
    title: 'Mestre Coletor',
    name: 'Mestre dos Recursos',
    description: 'Colete 100 recursos.',
    isUnlocked: (character) => (character.stats?.resourcesGathered || 0) >= 100,
  },
  {
    id: 'artisan',
    title: 'Artesão',
    name: 'Mãos de Artesão',
    description: 'Produza 10 itens.',
    isUnlocked: (character) => (character.stats?.itemsCrafted || 0) >= 10,
  },
  {
    id: 'forgemaster',
    title: 'Ferreiro',
    name: 'Ferreiro Persistente',
    description: 'Melhore equipamentos 15 vezes.',
    isUnlocked: (character) => (character.stats?.equipmentUpgrades || 0) >= 15,
  },
  {
    id: 'veteran',
    title: 'Veterano',
    name: 'Veterano de Jornada',
    description: 'Alcance o nível 10.',
    isUnlocked: (character) => character.level >= 10,
  },
];

export const TITLE_BY_ID = Object.fromEntries(
  TITLE_ACHIEVEMENTS.map((achievement) => [achievement.id, achievement])
) as Record<string, TitleAchievement>;

export function getUnlockedTitleIds(character: SavedCharacter) {
  const current = new Set(character.unlockedTitleIds || []);
  TITLE_ACHIEVEMENTS.forEach((achievement) => {
    if (achievement.isUnlocked(character)) {
      current.add(achievement.id);
    }
  });
  return Array.from(current);
}
