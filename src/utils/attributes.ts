import { Attributes, CharacterClass, SavedCharacter } from '../types/game';
import { calculateMaxHealth, calculateMaxResource } from './combatStats';

export const CREATION_ATTRIBUTE_POINTS = 10;
export const LEVEL_UP_ATTRIBUTE_POINTS = 3;

export function applyClassModifiers(attributes: Attributes, characterClass: CharacterClass): Attributes {
  return {
    strength: Math.round(attributes.strength * characterClass.attributeModifiers.strength),
    effort: Math.round(attributes.effort * characterClass.attributeModifiers.effort),
    resistance: Math.round(attributes.resistance * characterClass.attributeModifiers.resistance),
    intelligence: Math.round(attributes.intelligence * characterClass.attributeModifiers.intelligence),
    accuracy: Math.round(attributes.accuracy * characterClass.attributeModifiers.accuracy),
  };
}

export function getAttributeIncreaseUpdates(
  character: SavedCharacter,
  attribute: keyof Attributes
): Partial<SavedCharacter> {
  const attributes = {
    ...character.attributes,
    [attribute]: character.attributes[attribute] + 1,
  };
  const nextCharacter = { ...character, attributes };
  const maxHealth = calculateMaxHealth(nextCharacter);
  const maxResource = calculateMaxResource(nextCharacter);
  const updates: Partial<SavedCharacter> = {
    attributes,
    maxHealth,
    health: Math.min(character.health + maxHealth - character.maxHealth, maxHealth),
  };

  if (character.maxMana !== undefined) {
    updates.maxMana = maxResource;
    updates.mana = Math.min((character.mana || 0) + maxResource - character.maxMana, maxResource);
  }
  if (character.maxStamina !== undefined) {
    updates.maxStamina = maxResource;
    updates.stamina = Math.min((character.stamina || 0) + maxResource - character.maxStamina, maxResource);
  }

  return updates;
}
