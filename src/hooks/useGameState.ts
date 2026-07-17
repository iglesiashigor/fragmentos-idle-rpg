import { useState } from 'react';
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

export function useGameState(
  initialCharacter: SavedCharacter,
  onCharacterUpdate: (character: SavedCharacter) => void
) {
  const [character, setCharacter] = useState<SavedCharacter>(initialCharacter);
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
      updateCharacter({ attributes: updatedAttributes });
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

  const addItemToInventory = (item: Item, inventory = character.inventory) => {
    const existingItem = inventory.find((i) => i.id === item.id);
    return existingItem
      ? inventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...inventory, { ...item, quantity: 1 }];
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

      // Restore health, mana, and stamina on level up
      const updates: Partial<SavedCharacter> = {
        level: newLevel,
        experience: remainingExp,
        maxHealth: baseCharacter.maxHealth + 10,
        health: baseCharacter.maxHealth + 10,
      };

      if (baseCharacter.maxMana !== undefined) {
        updates.maxMana = baseCharacter.maxMana + 5;
        updates.mana = baseCharacter.maxMana + 5;
      }

      if (baseCharacter.maxStamina !== undefined) {
        updates.maxStamina = baseCharacter.maxStamina + 5;
        updates.stamina = baseCharacter.maxStamina + 5;
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
    const playerDamage = 10 + (character.equipment.weapon?.power || 0);
    const newEnemyHealth = enemy.health - playerDamage;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat();
      return;
    }

    // Enemy attacks player
    const enemyDamage = Math.max(
      0,
      5 + (enemy.level * 2) - (character.equipment.armor?.power || 0)
    );
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

    const newEnemyHealth = enemy.health - spell.damage;
    const newMana = character.mana - spell.manaCost;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat({ mana: newMana });
      return;
    }

    // Enemy attacks player
    const enemyDamage = Math.max(
      0,
      5 + (enemy.level * 2) - (character.equipment.armor?.power || 0)
    );
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

    const newEnemyHealth = enemy.health - ability.damage;
    const newStamina = character.stamina - ability.staminaCost;

    if (newEnemyHealth <= 0) {
      handleEnemyDefeat({ stamina: newStamina });
      return;
    }

    // Enemy attacks player
    const enemyDamage = Math.max(
      0,
      5 + (enemy.level * 2) - (character.equipment.armor?.power || 0)
    );
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
        const existingItem = updatedInventory.find(item => item.id === lootItem.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedInventory.push({
            ...lootItem,
            quantity: 1
          });
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
    if (character.gold >= item.price) {
      const existingItem = character.inventory.find((i) => i.id === item.id);

      const updatedInventory = existingItem
        ? character.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...character.inventory, { ...item, quantity: 1 }];

      updateCharacter({
        gold: character.gold - item.price,
        inventory: updatedInventory,
      });
    }
  };

  const handleSellItem = (item: InventoryItem) => {
    const sellPrice = Math.floor(item.price * 0.7);
    
    // Check if the item is currently equipped
    const updatedEquipment = { ...character.equipment };
    if (item.type === 'weapon' && character.equipment.weapon?.id === item.id) {
      updatedEquipment.weapon = null;
    } else if (item.type === 'armor' && character.equipment.armor?.id === item.id) {
      updatedEquipment.armor = null;
    }

    // Update inventory
    const updatedInventory = character.inventory
      .map((i) => {
        if (i.id === item.id) {
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
      updateCharacter({
        inventory: addItemToInventory(randomEventReward.reward as Item),
      });
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
