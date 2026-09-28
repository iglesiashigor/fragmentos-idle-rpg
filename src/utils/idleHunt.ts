import { HuntArea, getHuntPower } from '../data/huntAreas';
import { ActiveHunt, HuntClaimSummary, SavedCharacter } from '../types/game';

const MAX_OFFLINE_HUNT_MS = 12 * 60 * 60 * 1000;

const strategyModifiers = {
  balanced: { kills: 1, experience: 1, gold: 1, danger: 1 },
  experience: { kills: 1.08, experience: 1.2, gold: 0.85, danger: 1.12 },
  gold: { kills: 0.94, experience: 0.9, gold: 1.25, danger: 1.06 },
  safe: { kills: 0.78, experience: 0.86, gold: 0.86, danger: 0.55 },
};

export const simulateIdleHunt = (
  character: SavedCharacter,
  hunt: ActiveHunt,
  area: HuntArea,
  now = Date.now()
): HuntClaimSummary => {
  const elapsedMs = Math.max(
    0,
    Math.min(now - hunt.lastClaimedAt, MAX_OFFLINE_HUNT_MS)
  );
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const modifier = strategyModifiers[hunt.strategy];
  const powerRatio = Math.max(
    0.35,
    Math.min(1.8, getHuntPower(character) / Math.max(10, area.recommendedLevel * 12))
  );
  const kills = Math.floor(
    area.baseKillsPerHour * modifier.kills * powerRatio * elapsedHours
  );
  const dangerPressure = Math.max(
    0.2,
    (area.recommendedLevel + area.danger * 2) / Math.max(1, character.level + 2)
  );
  const healthLost = Math.floor(
    kills * area.danger * modifier.danger * dangerPressure
  );
  const defeated = healthLost >= character.health;
  const safeKills = defeated ? Math.max(0, Math.floor(kills * 0.72)) : kills;

  return {
    areaName: area.name,
    elapsedMs,
    kills: safeKills,
    gold: Math.floor(safeKills * area.goldPerKill * modifier.gold),
    experience: Math.floor(safeKills * area.experiencePerKill * modifier.experience),
    healthLost: defeated ? Math.max(0, character.health - 1) : healthLost,
    defeated,
    strategy: hunt.strategy,
  };
};
