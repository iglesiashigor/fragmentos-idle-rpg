export function calculateRequiredExperience(level: number): number {
  return Math.floor(80 + level * 45 + Math.pow(level, 1.6) * 18);
}

export function checkLevelUp(currentExp: number, currentLevel: number): boolean {
  const requiredExp = calculateRequiredExperience(currentLevel);
  return currentExp >= requiredExp;
}
