import { Spell } from '../types/game';

export const SPELLS: Spell[] = [
  {
    id: 'fireball',
    name: 'Bola de Fogo',
    damage: 30,
    manaCost: 20,
    level: 1,
    description: 'Lança uma poderosa bola de fogo contra o inimigo',
    requirements: {
      class: ['mage', 'shaman'],
    },
  },
  {
    id: 'magic_missile',
    name: 'Mísseis Mágicos',
    damage: 30,
    manaCost: 20,
    level: 1,
    description: 'Dispara dardos de energia mágica contra o alvo',
    requirements: {
      class: ['mage', 'summoner', 'illusionist'],
    },
  },
  {
    id: 'ice_shard',
    name: 'Estilhaço de Gelo',
    damage: 30,
    manaCost: 20,
    level: 1,
    description: 'Lança fragmentos afiados de gelo',
    requirements: {
      class: ['mage', 'shaman'],
    },
  },
  {
    id: 'shadow_bolt',
    name: 'Seta Sombria',
    damage: 30,
    manaCost: 20,
    level: 1,
    description: 'Dispara uma seta de energia sombria',
    requirements: {
      class: ['summoner', 'illusionist'],
    },
  }
];
