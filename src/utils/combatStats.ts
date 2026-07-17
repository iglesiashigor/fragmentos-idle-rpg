import { Character, Enemy } from '../types/game';

export interface CharacterCombatStats {
  attack: number;
  magicPower: number;
  defense: number;
  maxHealth: number;
  maxResource: number;
  criticalChance: number;
}

function getClassPassive(character: Character) {
  switch (character.class.id) {
    case 'warrior':
      return { attack: 1.12, defense: 1.08, magic: 1, critical: 0 };
    case 'fighter':
      return { attack: 1.08, defense: 1, magic: 1, critical: 0.04 };
    case 'mage':
      return { attack: 1, defense: 1, magic: 1.18, critical: 0 };
    case 'summoner':
      return { attack: 1, defense: 1.05, magic: 1.12, critical: 0 };
    case 'barbarian':
      return { attack: 1.18, defense: 0.95, magic: 1, critical: 0.02 };
    case 'shaman':
      return { attack: 1, defense: 1.1, magic: 1.1, critical: 0 };
    case 'thief':
      return { attack: 1.05, defense: 1, magic: 1, critical: 0.08 };
    case 'illusionist':
      return { attack: 1, defense: 1, magic: 1.08, critical: 0.08 };
    default:
      return { attack: 1, defense: 1, magic: 1, critical: 0 };
  }
}

export function calculateMaxHealth(character: Character): number {
  return (
    character.class.baseHealth +
    character.race.bonuses.health +
    character.level * 8 +
    character.attributes.resistance * 6
  );
}

export function calculateMaxResource(character: Character): number {
  return (
    character.class.baseResource +
    character.level * 4 +
    character.attributes.effort * 4 +
    character.attributes.intelligence * 2
  );
}

export function calculateCharacterStats(
  character: Character
): CharacterCombatStats {
  const weaponPower = character.equipment.weapon?.power || 0;
  const armorPower = character.equipment.armor?.power || 0;
  const passive = getClassPassive(character);
  const attack =
    8 +
    weaponPower +
    character.race.bonuses.damage +
    character.attributes.strength * 2 +
    character.attributes.effort;
  const magicPower =
    8 +
    weaponPower * 0.5 +
    character.race.bonuses.damage +
    character.attributes.intelligence * 2.5 +
    character.attributes.accuracy * 0.5;
  const defense =
    armorPower +
    character.race.bonuses.defense +
    character.attributes.resistance * 1.5;

  return {
    attack: attack * passive.attack,
    magicPower: magicPower * passive.magic,
    defense: defense * passive.defense,
    maxHealth: calculateMaxHealth(character),
    maxResource: calculateMaxResource(character),
    criticalChance: Math.min(
      0.45,
      0.05 + character.attributes.accuracy * 0.015 + passive.critical
    ),
  };
}

export function rollCriticalDamage(baseDamage: number, criticalChance: number) {
  return Math.round(Math.random() < criticalChance ? baseDamage * 1.6 : baseDamage);
}

export function calculateBasicAttackDamage(character: Character) {
  return Math.max(1, rollCriticalDamage(calculateBasicAttackBase(character), calculateCharacterStats(character).criticalChance));
}

export function calculateBasicAttackBase(character: Character) {
  const stats = calculateCharacterStats(character);
  return Math.max(1, Math.round(stats.attack));
}

export function calculateSpellDamage(character: Character, spellDamage: number) {
  return Math.max(
    1,
    rollCriticalDamage(
      calculateSpellBase(character, spellDamage),
      calculateCharacterStats(character).criticalChance * 0.75
    )
  );
}

export function calculateSpellBase(character: Character, spellDamage: number) {
  const stats = calculateCharacterStats(character);
  const baseDamage = spellDamage + stats.magicPower;
  return Math.max(1, Math.round(baseDamage));
}

export function calculateAbilityDamage(
  character: Character,
  abilityDamage: number
) {
  return Math.max(
    1,
    rollCriticalDamage(
      calculateAbilityBase(character, abilityDamage),
      calculateCharacterStats(character).criticalChance
    )
  );
}

export function calculateAbilityBase(
  character: Character,
  abilityDamage: number
) {
  const stats = calculateCharacterStats(character);
  const baseDamage = abilityDamage + stats.attack * 0.8;
  return Math.max(1, Math.round(baseDamage));
}

export function calculateEnemyDamage(enemy: Enemy, character: Character) {
  const stats = calculateCharacterStats(character);
  const baseDamage = enemy.damage ?? 6 + enemy.level * 3;
  return Math.max(1, Math.round(baseDamage - stats.defense * 0.65));
}
