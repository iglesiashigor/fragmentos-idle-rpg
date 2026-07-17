import { useEffect, useRef, useState } from 'react';
import {
  SavedCharacter,
  Item,
  Spell,
  MapLocation,
  Enemy,
  InventoryItem,
  Attributes,
  Ability,
} from '../types/game';
import { generateEnemy } from '../data/enemies';
import {
  INITIAL_LOCATIONS,
  generateRandomLocation,
  MAX_ENEMIES,
  MAX_EVENTS,
} from '../utils/locationManager';
import { generateRandomEvent } from '../utils/randomEvents';
import { calculateRequiredExperience, checkLevelUp } from '../utils/experience';
import {
  calculateAbilityDamage,
  calculateBasicAttackDamage,
  calculateEnemyDamage,
  calculateMaxHealth,
  calculateMaxResource,
  calculateSpellDamage,
} from '../utils/combatStats';
import {
  addItemToInventory,
  canAddItemToInventory,
} from '../utils/inventory';

export function useGameState(
  initialCharacter: SavedCharacter,
  onCharacterUpdate: (character: SavedCharacter) => void
) {
  const normalizeCharacter = (savedCharacter: SavedCharacter) => {
    const maxHealth = calculateMaxHealth(savedCharacter);
    const maxResource = calculateMaxResource(savedCharacter);
    const healthRatio =
      savedCharacter.maxHealth > 0
        ? savedCharacter.health / savedCharacter.maxHealth
        : 1;
    const normalizedCharacter: SavedCharacter = {
      ...savedCharacter,
      maxHealth,
      health:
        savedCharacter.health <= 0
          ? 0
          : Math.max(1, Math.min(maxHealth, Math.round(maxHealth * healthRatio))),
    };

    if (savedCharacter.maxMana !== undefined) {
      const manaRatio =
        savedCharacter.maxMana > 0
          ? (savedCharacter.mana || 0) / savedCharacter.maxMana
          : 1;
      normalizedCharacter.maxMana = maxResource;
      normalizedCharacter.mana = Math.min(
        maxResource,
        Math.round(maxResource * manaRatio)
      );
    }

    if (savedCharacter.maxStamina !== undefined) {
      const staminaRatio =
        savedCharacter.maxStamina > 0
          ? (savedCharacter.stamina || 0) / savedCharacter.maxStamina
          : 1;
      normalizedCharacter.maxStamina = maxResource;
      normalizedCharacter.stamina = Math.min(
        maxResource,
        Math.round(maxResource * staminaRatio)
      );
    }

    return normalizedCharacter;
  };

  const [character, setCharacter] = useState<SavedCharacter>(() =>
    normalizeCharacter(initialCharacter)
  );
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [mapLocations, setMapLocations] = useState(INITIAL_LOCATIONS);
  const [showRandomEvent, setShowRandomEvent] = useState(false);
  const [randomEventReward, setRandomEventReward] = useState<{
    type: 'spell' | 'item';
    reward: Spell | Item;
  } | null>(null);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [attributePoints, setAttributePoints] = useState(0);
  const hasSavedNormalizedCharacter = useRef(false);

  useEffect(() => {
    if (hasSavedNormalizedCharacter.current) return;

    if (
      character.maxHealth !== initialCharacter.maxHealth ||
      character.maxMana !== initialCharacter.maxMana ||
      character.maxStamina !== initialCharacter.maxStamina
    ) {
      hasSavedNormalizedCharacter.current = true;
      onCharacterUpdate(character);
    }
  }, [character, initialCharacter, onCharacterUpdate]);

  const updateCharacter = (updates: Partial<SavedCharacter>) => {
    const updatedCharacter = { ...character, ...updates } as SavedCharacter;
    setCharacter(updatedCharacter);
    onCharacterUpdate(updatedCharacter);
  };

  const handleAttributeIncrease = (attribute: keyof Attributes) => {
    if (attributePoints > 0) {
      const updatedAttributes = {
        ...character.attributes,
        [attribute]: character.attributes[attribute] + 1,
      };
      const updatedCharacter = {
        ...character,
        attributes: updatedAttributes,
      };
      const newMaxHealth = calculateMaxHealth(updatedCharacter);
      const newMaxResource = calculateMaxResource(updatedCharacter);
      const updates: Partial<SavedCharacter> = {
        attributes: updatedAttributes,
        maxHealth: newMaxHealth,
        health: Math.min(character.health + (newMaxHealth - character.maxHealth), newMaxHealth),
      };

      if (character.maxMana !== undefined) {
        updates.maxMana = newMaxResource;
        updates.mana = Math.min(
          (character.mana || 0) + (newMaxResource - character.maxMana),
          newMaxResource
        );
      }

      if (character.maxStamina !== undefined) {
        updates.maxStamina = newMaxResource;
        updates.stamina = Math.min(
          (character.stamina || 0) + (newMaxResource - character.maxStamina),
          newMaxResource
        );
      }

      updateCharacter(updates);
      setAttributePoints(points => points - 1);
    }
  };

  const handleSpellSelect = (spell: Spell) => {
    if (character.class.resourceType !== 'mana') return;

    const existingSpell = character.spells.find(s => s.id === spell.id);
    
    if (existingSpell) {
      // Level up existing spell
      const updatedSpells = character.spells.map(s => {
        if (s.id === spell.id) {
          const newLevel = s.level + 1;
          const damageIncrease = Math.floor(s.damage * 0.2); // 20% damage increase per level
          
          return {
            ...s,
            level: newLevel,
            damage: s.damage + damageIncrease,
            description: `${s.description} (Nível ${newLevel})`,
          };
        }
        return s;
      });
      
      updateCharacter({ spells: updatedSpells });
    } else {
      // Add new spell
      const updatedSpells = [...character.spells, { ...spell, level: 1 }];
      updateCharacter({ spells: updatedSpells });
    }
    
    setShowLevelUpModal(false);
  };

  const handleAbilitySelect = (ability: Ability) => {
    if (character.class.resourceType !== 'stamina') return;

    const existingAbility = character.abilities.find(a => a.id === ability.id);
    
    if (existingAbility) {
      // Level up existing ability
      const updatedAbilities = character.abilities.map(a => {
        if (a.id === ability.id) {
          const newLevel = a.level + 1;
          const damageIncrease = Math.floor(a.damage * 0.2); // 20% damage increase per level
          
          return {
            ...a,
            level: newLevel,
            damage: a.damage + damageIncrease,
            description: `${a.description} (Nível ${newLevel})`,
          };
        }
        return a;
      });
      
      updateCharacter({ abilities: updatedAbilities });
    } else {
      // Add new ability
      const updatedAbilities = [...character.abilities, { ...ability, level: 1 }];
      updateCharacter({ abilities: updatedAbilities });
    }
    
    setShowLevelUpModal(false);
  };

  const getLevelUpUpdates = (
    baseCharacter: SavedCharacter,
    currentExp: number
  ): Partial<SavedCharacter> => {
    if (checkLevelUp(currentExp, baseCharacter.level)) {
      const newLevel = baseCharacter.level + 1;
      const remainingExp =
        currentExp - calculateRequiredExperience(baseCharacter.level);

      // Add attribute points on odd levels
      if (newLevel % 2 === 1) {
        setAttributePoints(3); // Give 3 points to distribute
      }

      const leveledCharacter = {
        ...baseCharacter,
        level: newLevel,
      };
      const newMaxHealth = calculateMaxHealth(leveledCharacter);
      const newMaxResource = calculateMaxResource(leveledCharacter);

      // Restore health, mana, and stamina on level up
      const updates: Partial<SavedCharacter> = {
        level: newLevel,
        experience: remainingExp,
        maxHealth: newMaxHealth,
        health: newMaxHealth,
      };

      if (baseCharacter.maxMana !== undefined) {
        updates.maxMana = newMaxResource;
        updates.mana = newMaxResource;
      }

      if (baseCharacter.maxStamina !== undefined) {
        updates.maxStamina = newMaxResource;
        updates.stamina = newMaxResource;
      }

      setShowLevelUpModal(true);
      return updates;
    }

    return {};
  };

  const handleLocationSelect = (location: MapLocation) => {
    setCurrentLocation(location);
    if (location.type === 'enemy') {
      setEnemy(generateEnemy(location.level || 1));
    } else if (location.type === 'event') {
      setEnemy(null);
      setRandomEventReward(
        generateRandomEvent(
          location.level || 1,
          character.class.resourceType === 'mana'
        )
      );
      setShowRandomEvent(true);
    } else {
      setEnemy(null);
    }
    if (location.type !== 'event') {
      setShowRandomEvent(false);
      setRandomEventReward(null);
    }
  };

  const handleAttack = () => {
    if (!enemy) return;

    // Player attacks enemy
    const playerDamage = calculateBasicAttackDamage(character);
    const newEnemyHealth = enemy.health - playerDamage;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat();
      return;
    }

    // Enemy attacks player
    const enemyDamage = calculateEnemyDamage(enemy, character);
    const newPlayerHealth = character.health - enemyDamage;

    if (newPlayerHealth <= 0) {
      setShowDeathModal(true);
      updateCharacter({ health: 0 });
      return;
    }

    setEnemy({ ...enemy, health: newEnemyHealth });
    updateCharacter({ health: newPlayerHealth });
  };

  const handleCastSpell = (spell: Spell) => {
    if (!enemy || character.mana === undefined) return;

    // Check if player has enough mana
    if (character.mana < spell.manaCost) return;

    const newEnemyHealth = enemy.health - calculateSpellDamage(character, spell.damage);
    const newMana = character.mana - spell.manaCost;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat({ mana: newMana });
      return;
    }

    // Enemy attacks player
    const enemyDamage = calculateEnemyDamage(enemy, character);
    const newPlayerHealth = character.health - enemyDamage;

    if (newPlayerHealth <= 0) {
      setShowDeathModal(true);
      updateCharacter({ health: 0 });
      return;
    }

    setEnemy({ ...enemy, health: newEnemyHealth });
    updateCharacter({ 
      health: newPlayerHealth,
      mana: newMana
    });
  };

  const handleUseAbility = (ability: Ability) => {
    if (!enemy || character.stamina === undefined) return;

    // Check if player has enough stamina
    if (character.stamina < ability.staminaCost) return;

    const newEnemyHealth = enemy.health - calculateAbilityDamage(character, ability.damage);
    const newStamina = character.stamina - ability.staminaCost;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat({ stamina: newStamina });
      return;
    }

    // Enemy attacks player
    const enemyDamage = calculateEnemyDamage(enemy, character);
    const newPlayerHealth = character.health - enemyDamage;

    if (newPlayerHealth <= 0) {
      setShowDeathModal(true);
      updateCharacter({ health: 0 });
      return;
    }

    setEnemy({ ...enemy, health: newEnemyHealth });
    updateCharacter({ 
      health: newPlayerHealth,
      stamina: newStamina
    });
  };

  const handleEnemyDefeat = (preRewardUpdates: Partial<SavedCharacter> = {}) => {
    if (!enemy || !currentLocation) return;

    // Update map locations
    setMapLocations((prev) => {
      const remainingLocations = prev.filter(
        (loc) => loc.id !== currentLocation.id
      );
      
      const newEnemyCount = remainingLocations.filter(
        (loc) => loc.type === 'enemy'
      ).length;
      
      const newEventCount = remainingLocations.filter(
        (loc) => loc.type === 'event'
      ).length;

      const newLocations = [...remainingLocations];

      // Add new enemy if needed
      if (newEnemyCount < MAX_ENEMIES) {
        const newLocation = generateRandomLocation();
        // Only add if it's an enemy or if we have room for more events
        if (newLocation.type === 'enemy' || (newLocation.type === 'event' && newEventCount < MAX_EVENTS)) {
          newLocations.push(newLocation);
        }
      }

      return newLocations;
    });

    // Calculate rewards
    const goldReward = enemy.isBoss ? (50 + enemy.level * 20) : (10 + enemy.level * 5);
    const expReward = enemy.experience;
    const rewardBaseCharacter = {
      ...character,
      ...preRewardUpdates,
    };
    const newExp = rewardBaseCharacter.experience + expReward;

    // Add gold and experience
    const updates: Partial<SavedCharacter> = {
      ...preRewardUpdates,
      gold: rewardBaseCharacter.gold + goldReward,
      experience: newExp,
    };

    // Add loot items to inventory
    if (enemy.loot && enemy.loot.length > 0) {
      const updatedInventory = [...rewardBaseCharacter.inventory];
      
      enemy.loot.forEach(lootItem => {
        if (canAddItemToInventory(lootItem, updatedInventory)) {
          const nextInventory = addItemToInventory(lootItem, updatedInventory);
          updatedInventory.splice(0, updatedInventory.length, ...nextInventory);
        }
      });
      
      updates.inventory = updatedInventory;
    }

    const updatedCharacter = {
      ...rewardBaseCharacter,
      ...updates,
    };
    const levelUpUpdates = getLevelUpUpdates(updatedCharacter, newExp);

    updateCharacter({
      ...updates,
      ...levelUpUpdates,
    });

    setEnemy(null);
    setCurrentLocation(null);
  };

  const handleRespawn = () => {
    if (character.gold >= 100) {
      const updates: Partial<SavedCharacter> = {
        health: character.maxHealth,
        gold: character.gold - 100,
      };

      // Restore mana or stamina based on class type
      if (character.maxMana !== undefined) {
        updates.mana = character.maxMana;
      }
      if (character.maxStamina !== undefined) {
        updates.stamina = character.maxStamina;
      }

      updateCharacter(updates);
      setShowDeathModal(false);
      setCurrentLocation(null);
      setEnemy(null);
    }
  };

  const handleRest = () => {
    const REST_COST = 20;
    if (character.gold >= REST_COST) {
      const updates: Partial<SavedCharacter> = {
        health: character.maxHealth,
        gold: character.gold - REST_COST,
      };

      // Restore mana or stamina based on class type
      if (character.maxMana !== undefined) {
        updates.mana = character.maxMana;
      }
      if (character.maxStamina !== undefined) {
        updates.stamina = character.maxStamina;
      }

      updateCharacter(updates);
    }
  };

  const handleBuyItem = (item: Item) => {
    if (
      character.gold >= item.price &&
      canAddItemToInventory(item, character.inventory)
    ) {
      const updatedInventory = addItemToInventory(item, character.inventory);

      updateCharacter({
        gold: character.gold - item.price,
        inventory: updatedInventory,
      });
    }
  };

  const handleSellItem = (item: InventoryItem) => {
    const sellPrice = Math.floor(item.price * 0.7);
    const isSameInventoryItem = (
      first: InventoryItem,
      second: InventoryItem
    ) =>
      first.instanceId && second.instanceId
        ? first.instanceId === second.instanceId
        : first.id === second.id;
    
    // Check if the item is currently equipped
    const updatedEquipment = { ...character.equipment };
    if (
      item.type === 'weapon' &&
      character.equipment.weapon &&
      isSameInventoryItem(character.equipment.weapon, item)
    ) {
      updatedEquipment.weapon = null;
    } else if (
      item.type === 'armor' &&
      character.equipment.armor &&
      isSameInventoryItem(character.equipment.armor, item)
    ) {
      updatedEquipment.armor = null;
    }

    // Update inventory
    let removedItem = false;
    const updatedInventory = character.inventory
      .map((i) => {
        if (!removedItem && isSameInventoryItem(i, item)) {
          removedItem = true;
          return { ...i, quantity: i.quantity - 1, equipped: false };
        }
        return i;
      })
      .filter((i) => i.quantity > 0);

    updateCharacter({
      gold: character.gold + sellPrice,
      inventory: updatedInventory,
      equipment: updatedEquipment,
    });
  };

  const handleClaimRandomEvent = () => {
    if (!randomEventReward || !currentLocation) return;

    if (randomEventReward.type === 'item') {
      const rewardItem = randomEventReward.reward as Item;
      if (canAddItemToInventory(rewardItem, character.inventory)) {
        updateCharacter({
          inventory: addItemToInventory(rewardItem, character.inventory),
        });
      }
    } else if (character.class.resourceType === 'mana') {
      const spell = randomEventReward.reward as Spell;
      const existingSpell = character.spells.find((s) => s.id === spell.id);
      const updatedSpells = existingSpell
        ? character.spells.map((s) =>
            s.id === spell.id
              ? {
                  ...s,
                  level: s.level + 1,
                  damage: Math.max(s.damage, spell.damage),
                }
              : s
          )
        : [...character.spells, { ...spell, level: 1 }];

      updateCharacter({ spells: updatedSpells });
    }

    setMapLocations((prev) =>
      prev.filter((location) => location.id !== currentLocation.id)
    );
    setRandomEventReward(null);
    setShowRandomEvent(false);
    setCurrentLocation(null);
  };

  return {
    character,
    currentLocation,
    enemy,
    mapLocations,
    showRandomEvent,
    randomEventReward,
    showDeathModal,
    showLevelUpModal,
    attributePoints,
    updateCharacter,
    handleLocationSelect,
    handleRest,
    handleAttack,
    handleCastSpell,
    handleUseAbility,
    handleRespawn,
    handleBuyItem,
    handleSellItem,
    handleClaimRandomEvent,
    handleAttributeIncrease,
    handleSpellSelect,
    handleAbilitySelect,
    closeLevelUpModal: () => setShowLevelUpModal(false),
  };
}
