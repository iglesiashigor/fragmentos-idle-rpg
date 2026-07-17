import { useState } from 'react';
import { Character, Race, CharacterClass, DeadCharacter, Attributes } from '../types/game';
import { calculateMaxHealth, calculateMaxResource } from '../utils/combatStats';

export function useCharacter() {
  const [deadCharacters, setDeadCharacters] = useState<DeadCharacter[]>([]);

  const createCharacter = (
    name: string, 
    race: Race, 
    characterClass: CharacterClass,
    attributes: Attributes
  ): Character => {
    const startingInventory = characterClass.startingEquipment.map(item => ({
      ...item,
      quantity: 1,
      instanceId: crypto.randomUUID(),
      equipped: item.type === 'weapon' || item.type === 'armor',
    }));
    const startingWeapon =
      startingInventory.find((item) => item.type === 'weapon') || null;
    const startingArmor =
      startingInventory.find((item) => item.type === 'armor') || null;
    
    // Apply class modifiers to attributes
    const finalAttributes = {
      strength: Math.round(attributes.strength * characterClass.attributeModifiers.strength),
      effort: Math.round(attributes.effort * characterClass.attributeModifiers.effort),
      resistance: Math.round(attributes.resistance * characterClass.attributeModifiers.resistance),
      intelligence: Math.round(attributes.intelligence * characterClass.attributeModifiers.intelligence),
      accuracy: Math.round(attributes.accuracy * characterClass.attributeModifiers.accuracy),
    };

    // Set up resource based on class type
    const resourceSetup = characterClass.resourceType === 'mana' 
      ? {
          mana: characterClass.baseResource,
          maxMana: characterClass.baseResource,
          stamina: undefined,
          maxStamina: undefined,
        }
      : {
          stamina: characterClass.baseResource,
          maxStamina: characterClass.baseResource,
          mana: undefined,
        maxMana: undefined,
      };

    const baseCharacter = {
      name,
      health: 1,
      maxHealth: 1,
      ...resourceSetup,
      gold: characterClass.startingGold,
      equipment: {
        weapon: startingWeapon,
        armor: startingArmor,
      },
      spells: characterClass.startingSpells,
      abilities: characterClass.startingAbilities,
      level: 1,
      experience: 0,
      inventory: startingInventory,
      race,
      class: characterClass,
      attributes: finalAttributes,
      quests: [],
      completedQuestIds: [],
    };

    const maxHealth = calculateMaxHealth(baseCharacter);
    const maxResource = calculateMaxResource(baseCharacter);

    return {
      ...baseCharacter,
      health: maxHealth,
      maxHealth,
      mana: characterClass.resourceType === 'mana' ? maxResource : undefined,
      maxMana: characterClass.resourceType === 'mana' ? maxResource : undefined,
      stamina: characterClass.resourceType === 'stamina' ? maxResource : undefined,
      maxStamina: characterClass.resourceType === 'stamina' ? maxResource : undefined,
    };
  };

  const handleCharacterDeath = (character: Character, killedBy: string) => {
    const deadCharacter: DeadCharacter = {
      id: Date.now().toString(),
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      killedBy,
      timestamp: Date.now(),
    };

    setDeadCharacters(prev => [...prev, deadCharacter]);
  };

  return {
    createCharacter,
    handleCharacterDeath,
    deadCharacters,
  };
}
