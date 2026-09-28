import { SavedCharacter, HuntStrategy } from '../types/game';

export interface HuntArea {
  id: string;
  name: string;
  description: string;
  recommendedLevel: number;
  enemyFamily: string;
  baseKillsPerHour: number;
  experiencePerKill: number;
  goldPerKill: number;
  danger: number;
  rareFind: string;
}

export const HUNT_AREAS: HuntArea[] = [
  {
    id: 'whispering_woods',
    name: 'Bosque Sussurrante',
    description: 'Uma rota inicial segura, cheia de goblins, lobos jovens e madeira fácil.',
    recommendedLevel: 1,
    enemyFamily: 'Goblins e lobos',
    baseKillsPerHour: 34,
    experiencePerKill: 9,
    goldPerKill: 3,
    danger: 0.7,
    rareFind: 'Fragmento Verdejante',
  },
  {
    id: 'bandit_road',
    name: 'Estrada dos Salteadores',
    description: 'Boa para ouro e materiais leves, mas os bandidos punem personagens frágeis.',
    recommendedLevel: 4,
    enemyFamily: 'Bandidos',
    baseKillsPerHour: 28,
    experiencePerKill: 14,
    goldPerKill: 7,
    danger: 1.15,
    rareFind: 'Insígnia Roubada',
  },
  {
    id: 'old_mines',
    name: 'Minas Antigas',
    description: 'Caçada lenta, estável e ótima para personagens resistentes.',
    recommendedLevel: 7,
    enemyFamily: 'Ogros e rastejantes',
    baseKillsPerHour: 22,
    experiencePerKill: 24,
    goldPerKill: 9,
    danger: 1.55,
    rareFind: 'Núcleo de Minério Vivo',
  },
  {
    id: 'broken_ruins',
    name: 'Ruínas Partidas',
    description: 'Zona de alto risco para quem quer acelerar nível e encontrar relíquias.',
    recommendedLevel: 12,
    enemyFamily: 'Ecos corrompidos',
    baseKillsPerHour: 18,
    experiencePerKill: 42,
    goldPerKill: 15,
    danger: 2.25,
    rareFind: 'Estilhaço Ancestral',
  },
];

export const getHuntArea = (areaId: string) =>
  HUNT_AREAS.find((area) => area.id === areaId) || HUNT_AREAS[0];

export const getStrategyLabel = (strategy: HuntStrategy) => {
  const labels: Record<HuntStrategy, string> = {
    balanced: 'Equilibrada',
    experience: 'Foco em XP',
    gold: 'Foco em Ouro',
    safe: 'Segura',
  };
  return labels[strategy];
};

export const getHuntPower = (character: SavedCharacter) => {
  const equipmentPower = Object.values(character.equipment || {}).reduce(
    (total, item) => total + (item?.power || 0) + (item?.upgradeLevel || 0) * 2,
    0
  );
  const attributePower =
    character.attributes.strength +
    character.attributes.intelligence +
    character.attributes.accuracy +
    character.attributes.effort * 0.7 +
    character.attributes.resistance * 0.8;

  return character.level * 10 + equipmentPower * 2 + attributePower;
};
