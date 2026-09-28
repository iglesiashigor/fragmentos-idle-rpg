import { Race } from '../types/game';

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Humano',
    description:
      'Versáteis e adaptáveis. Esforço também amplia seu recurso máximo.',
    bonuses: {
      health: 14,
      damage: 2,
      defense: 2,
    },
  },
  {
    id: 'elf',
    name: 'Elfo',
    description:
      'Graciosos e mágicos. Inteligência amplia ainda mais o poder mágico.',
    bonuses: {
      health: 6,
      damage: 4,
      defense: 1,
    },
  },
  {
    id: 'dwarf',
    name: 'Anão',
    description: 'Robustos e resilientes. Resistência concede defesa extra.',
    bonuses: {
      health: 24,
      damage: 1,
      defense: 4,
    },
  },
  {
    id: 'halfling',
    name: 'Metadilho',
    description:
      'Pequenos e sortudos. Acurácia aumenta ainda mais sua chance crítica.',
    bonuses: {
      health: 8,
      damage: 3,
      defense: 3,
    },
  },
];
