import { MapLocation } from '../types/game';

let lastEnemyId = 0;
let lastEventId = 0;

export function generateEnemyId(): string {
  lastEnemyId += 1;
  return `enemy_${lastEnemyId}_${Date.now()}`;
}

export function generateEventId(): string {
  lastEventId += 1;
  return `event_${lastEventId}_${Date.now()}`;
}

function randomMapPosition() {
  return {
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
  };
}

export function generateRandomEnemyLocation(): MapLocation {
  return {
    id: generateEnemyId(),
    type: 'enemy',
    ...randomMapPosition(),
    name: 'Inimigo Desconhecido',
    level: Math.floor(Math.random() * 3) + 1,
  };
}

export function generateRandomLocation(): MapLocation {
  const { x, y } = randomMapPosition();
  const eventRoll = Math.random();
  
  if (eventRoll < 0.12) {
    const pools = ['forest', 'quarry', 'grove', 'ruins'];
    const resourcePool = pools[Math.floor(Math.random() * pools.length)];
    const names: Record<string, string> = {
      forest: 'Bosque Antigo',
      quarry: 'Pedreira',
      grove: 'Clareira de Ervas',
      ruins: 'Ruínas Abandonadas',
    };
    return {
      id: generateEventId(),
      type: 'gathering',
      eventKind: 'gathering',
      resourcePool,
      x,
      y,
      name: names[resourcePool],
      level: Math.floor(Math.random() * 3) + 1,
    };
  }

  // Only generate rare events if we're below MAX_EVENTS
  if (eventRoll < 0.2) {
    return {
      id: generateEventId(),
      type: 'event',
      eventKind: 'discovery',
      x,
      y,
      name: 'Evento Misterioso',
      level: Math.floor(Math.random() * 3) + 1,
    };
  }

  return generateRandomEnemyLocation();
}

export const MAX_ENEMIES = 5;
export const MAX_EVENTS = 1; // Only allow 1 event at a time

export const INITIAL_LOCATIONS: MapLocation[] = [
  { id: 'town_1', type: 'town', x: 49.3, y: 49.3, name: 'Cidade' },
  { id: 'enemy_1', type: 'enemy', x: 38, y: 40, name: 'Encontro 1', level: 1 },
  { id: 'enemy_2', type: 'enemy', x: 62, y: 42, name: 'Encontro 2', level: 2 },
  { id: 'enemy_3', type: 'enemy', x: 39, y: 68, name: 'Encontro 3', level: 3 },
  {
    id: 'gathering_forest',
    type: 'gathering',
    eventKind: 'gathering',
    resourcePool: 'forest',
    x: 20.2,
    y: 31.1,
    name: 'Bosque Antigo',
    level: 1,
  },
  {
    id: 'gathering_grove',
    type: 'gathering',
    eventKind: 'gathering',
    resourcePool: 'grove',
    x: 76.7,
    y: 60.1,
    name: 'Clareira de Ervas',
    level: 1,
  },
  {
    id: 'gathering_quarry',
    type: 'gathering',
    eventKind: 'gathering',
    resourcePool: 'quarry',
    x: 74,
    y: 22,
    name: 'Pedreira',
    level: 1,
  },
  {
    id: 'gathering_ruins',
    type: 'gathering',
    eventKind: 'gathering',
    resourcePool: 'ruins',
    x: 18.5,
    y: 71.8,
    name: 'Ruínas Abandonadas',
    level: 1,
  },
  {
    id: 'boss_lair_1',
    type: 'boss_lair',
    x: 49.2,
    y: 78.3,
    name: 'Covil do Chefao',
    level: 1,
  },
];
