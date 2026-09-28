import { getEnemyBalance } from '../data/balance';
import { ActiveIdleCombat, IdleCombatReport, SavedCharacter } from '../types/game';
import { getHuntPower } from '../data/huntAreas';

const MAX_OFFLINE_COMBAT_MS = 2 * 60 * 60 * 1000;
const ESTIMATED_KILL_MS = 12_000;

export function simulateIdleCombat(
  character: SavedCharacter,
  activity: ActiveIdleCombat,
  now = Date.now()
): IdleCombatReport {
  const elapsedMs = Math.max(0, Math.min(now - activity.lastProcessedAt, MAX_OFFLINE_COMBAT_MS));
  const powerRatio = Math.max(0.35, Math.min(1.5, getHuntPower(character) / Math.max(12, activity.level * 12)));
  const estimatedKills = Math.floor((elapsedMs / ESTIMATED_KILL_MS) * powerRatio);
  const kills = Math.min(activity.remainingEncounters, estimatedKills);
  const balance = getEnemyBalance(activity.level);
  const damagePerKill = Math.max(1, 7 + balance.damageBonus - character.attributes.resistance * 0.25);
  const healthLost = Math.min(character.health, Math.floor(kills * damagePerKill));
  const defeated = healthLost >= character.health && kills > 0;
  const completedKills = defeated ? Math.max(0, Math.ceil(character.health / damagePerKill)) : kills;

  return {
    locationName: activity.locationName,
    elapsedMs,
    kills: completedKills,
    gold: completedKills * balance.goldReward,
    experience: completedKills * (24 + activity.level * 6),
    healthLost,
    defeated,
    remainingEncounters: Math.max(0, activity.remainingEncounters - completedKills),
  };
}
