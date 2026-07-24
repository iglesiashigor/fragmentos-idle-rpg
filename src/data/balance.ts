export function getEncounterLevelRange(characterLevel: number) {
  const level = Math.max(1, characterLevel);
  return {
    min: Math.max(1, level - 2),
    max: level + 2,
  };
}

export function getEnemyBalance(level: number) {
  const safeLevel = Math.max(1, level);
  return {
    healthBonus: safeLevel * 18,
    damageBonus: safeLevel * 3,
    goldReward: 10 + safeLevel * 5,
    experienceMultiplier: safeLevel,
  };
}

export function getBossBalance(level: number) {
  const safeLevel = Math.max(1, level);
  return {
    healthMultiplier: 1 + safeLevel * 0.16,
    damageMultiplier: 1 + safeLevel * 0.09,
    goldReward: 70 + safeLevel * 18,
    experienceMultiplier: safeLevel,
  };
}

export function getDifficultyTone(locationLevel: number | undefined, characterLevel: number) {
  if (!locationLevel) return 'normal';
  const difference = locationLevel - characterLevel;
  if (difference >= 2) return 'hard';
  if (difference <= -2) return 'easy';
  return 'normal';
}
