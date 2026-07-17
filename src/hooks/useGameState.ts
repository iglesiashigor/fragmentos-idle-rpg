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
  Quest,
  ProfessionId,
  ProfessionProgress,
} from '../types/game';
import { generateBoss, generateEnemy } from '../data/enemies';
import {
  INITIAL_LOCATIONS,
  generateRandomEnemyLocation,
  generateRandomLocation,
  MAX_ENEMIES,
  MAX_EVENTS,
} from '../utils/locationManager';
import {
  generateGatheringEvent,
  generateRandomEvent,
  RandomEventReward,
} from '../utils/randomEvents';
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
  hasMaterials,
  removeMaterialsFromInventory,
} from '../utils/inventory';
import {
  createActiveQuest,
  isQuestReadyToClaim,
  updateQuestsForCollect,
  updateQuestsForKill,
} from '../utils/questManager';
import {
  CraftingRecipe,
  getEquipmentUpgradeCost,
  getEquipmentUpgradePowerGain,
  MAX_EQUIPMENT_UPGRADE,
} from '../data/recipes';
import {
  createProfession,
  getProfessionExtraChance,
  getProfessionRequiredExperience,
  getProfessionYieldBonus,
  MAX_PROFESSION_LEVEL,
  PROFESSION_BY_ID,
} from '../data/professions';
import { getUnlockedTitleIds } from '../data/achievements';

const GATHERING_NODE_MAX_CHARGES = 5;
const GATHERING_NODE_RESET_MS = 5 * 60 * 1000;

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
      quests: savedCharacter.quests || [],
      completedQuestIds: savedCharacter.completedQuestIds || [],
      professions: savedCharacter.profession
        ? {
            ...(savedCharacter.professions || {}),
            [savedCharacter.profession.id]: savedCharacter.profession,
          }
        : savedCharacter.professions || {},
      activeProfessionId:
        savedCharacter.activeProfessionId || savedCharacter.profession?.id,
      gatheringNodes: savedCharacter.gatheringNodes || {},
      stats: savedCharacter.stats || {
        kills: 0,
        bossesKilled: 0,
        resourcesGathered: 0,
        itemsCrafted: 0,
        equipmentUpgrades: 0,
      },
      unlockedTitleIds: savedCharacter.unlockedTitleIds || [],
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
  } | RandomEventReward | null>(null);
  const [lastGatheringRewards, setLastGatheringRewards] = useState<
    { name: string; quantity: number }[] | null
  >(null);
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
    const mergedCharacter = { ...character, ...updates } as SavedCharacter;
    const updatedCharacter = {
      ...mergedCharacter,
      unlockedTitleIds: getUnlockedTitleIds(mergedCharacter),
    };
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
    setLastGatheringRewards(null);
    const encounterLevel = getEncounterLevel(character.level);

    if (location.type === 'enemy') {
      setEnemy(generateEnemy(encounterLevel));
    } else if (location.type === 'boss_lair') {
      setEnemy(generateBoss(Math.max(character.level + 1, encounterLevel)));
      setShowRandomEvent(false);
      setRandomEventReward(null);
    } else if (location.type === 'event') {
      const bossChance = 0.3;

      if (Math.random() < bossChance) {
        setCurrentLocation({
          ...location,
          name: 'Chefão Encontrado',
        });
        setEnemy(generateBoss(encounterLevel));
        setShowRandomEvent(false);
        setRandomEventReward(null);
      } else {
        setEnemy(null);
        setRandomEventReward(
          generateRandomEvent(
            encounterLevel,
            character.class.resourceType === 'mana'
          )
        );
        setShowRandomEvent(true);
      }
    } else if (location.type === 'gathering') {
      setEnemy(null);
      setRandomEventReward(null);
      setShowRandomEvent(false);
    } else {
      setEnemy(null);
    }
    if (location.type !== 'event' && location.type !== 'gathering') {
      setShowRandomEvent(false);
      setRandomEventReward(null);
    }
  };

  const getEncounterLevel = (playerLevel: number) => {
    const minLevel = Math.max(1, playerLevel - 2);
    const maxLevel = Math.max(minLevel, playerLevel + 2);
    return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
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
      const isFixedLocation =
        currentLocation.type === 'boss_lair' ||
        currentLocation.id.startsWith('gathering_');
      const remainingLocations = isFixedLocation
        ? prev
        : prev.filter((loc) => loc.id !== currentLocation.id);
      
      const newEnemyCount = remainingLocations.filter(
        (loc) => loc.type === 'enemy'
      ).length;
      
      const newEventCount = remainingLocations.filter(
        (loc) => loc.type === 'event' || loc.type === 'gathering'
      ).length;

      const newLocations = [...remainingLocations];

      // Enemy replacement must always add an enemy. Events are optional extras.
      if (newEnemyCount < MAX_ENEMIES) {
        newLocations.push(generateRandomEnemyLocation());
      }

      if (newEventCount < MAX_EVENTS && Math.random() < 0.25) {
        const newLocation = generateRandomLocation();
        if (
          newLocation.type === 'event' ||
          newLocation.type === 'gathering'
        ) {
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
      stats: {
        ...(rewardBaseCharacter.stats || {
          kills: 0,
          bossesKilled: 0,
          resourcesGathered: 0,
          itemsCrafted: 0,
          equipmentUpgrades: 0,
        }),
        kills: (rewardBaseCharacter.stats?.kills || 0) + 1,
        bossesKilled:
          (rewardBaseCharacter.stats?.bossesKilled || 0) +
          (enemy.isBoss ? 1 : 0),
      },
    };

    // Add loot items to inventory
    let collectedItems: { itemId: string; quantity: number }[] = [];

    if (enemy.loot && enemy.loot.length > 0) {
      const updatedInventory = [...rewardBaseCharacter.inventory];
      
      enemy.loot.forEach(lootItem => {
        if (canAddItemToInventory(lootItem, updatedInventory)) {
          const nextInventory = addItemToInventory(lootItem, updatedInventory);
          updatedInventory.splice(0, updatedInventory.length, ...nextInventory);
          collectedItems = [
            ...collectedItems,
            { itemId: lootItem.id, quantity: 1 },
          ];
        }
      });
      
      updates.inventory = updatedInventory;
    }

    const activeQuests = rewardBaseCharacter.quests || [];
    updates.quests = updateQuestsForCollect(
      updateQuestsForKill(activeQuests, enemy.name),
      collectedItems
    );

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

  const handleSellItem = (item: InventoryItem, quantity = 1) => {
    const sellQuantity = Math.max(1, Math.min(quantity, item.quantity));
    const sellPrice = Math.floor(item.price * 0.7) * sellQuantity;
    const isSameInventoryItem = (
      first: InventoryItem,
      second: InventoryItem
    ) =>
      first.instanceId && second.instanceId
        ? first.instanceId === second.instanceId
        : first.id === second.id;
    
    if (
      (character.equipment.weapon &&
        isSameInventoryItem(character.equipment.weapon, item)) ||
      (character.equipment.armor &&
        isSameInventoryItem(character.equipment.armor, item))
    ) {
      return;
    }

    // Update inventory
    let removedItem = false;
    const updatedInventory = character.inventory
      .map((i) => {
        if (!removedItem && isSameInventoryItem(i, item)) {
          removedItem = true;
          return { ...i, quantity: i.quantity - sellQuantity, equipped: false };
        }
        return i;
      })
      .filter((i) => i.quantity > 0);

    updateCharacter({
      gold: character.gold + sellPrice,
      inventory: updatedInventory,
    });
  };

  const handleClaimRandomEvent = () => {
    if (!randomEventReward || !currentLocation) return;

    if (randomEventReward.type === 'resource') {
      let updatedInventory = [...character.inventory];
      const collectedItems: { itemId: string; quantity: number }[] = [];
      const professionUpdate = getGatheringProfessionUpdate(
        character.profession,
        currentLocation.resourcePool
      );

      randomEventReward.rewards.forEach(({ item, quantity }) => {
        const finalQuantity = quantity + professionUpdate.quantityBonus;
        if (canAddItemToInventory(item, updatedInventory)) {
          updatedInventory = addItemToInventory(item, updatedInventory, finalQuantity);
          collectedItems.push({ itemId: item.id, quantity: finalQuantity });
        }
      });

      updateCharacter({
        inventory: updatedInventory,
        quests: updateQuestsForCollect(character.quests || [], collectedItems),
        profession: professionUpdate.profession,
      });
    } else if (randomEventReward.type === 'item') {
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

    const shouldKeepFixedGatheringPoint =
      randomEventReward.type === 'resource' &&
      currentLocation.id.startsWith('gathering_');

    if (!shouldKeepFixedGatheringPoint) {
      setMapLocations((prev) =>
        prev.filter((location) => location.id !== currentLocation.id)
      );
    }
    setRandomEventReward(null);
    setShowRandomEvent(false);
    if (!shouldKeepFixedGatheringPoint) {
      setCurrentLocation(null);
    }
  };

  const canGatherAtCurrentLocation = () => {
    if (!currentLocation || currentLocation.type !== 'gathering') return false;
    if (!character.profession) return false;

    const professionDefinition = PROFESSION_BY_ID[character.profession.id];
    return professionDefinition.resourcePools.includes(
      currentLocation.resourcePool || ''
    );
  };

  const getGatheringNodeState = (nodeId: string) => {
    const savedNode = character.gatheringNodes?.[nodeId];
    const now = Date.now();

    if (!savedNode) {
      return {
        remaining: GATHERING_NODE_MAX_CHARGES,
        resetAt: 0,
      };
    }

    if (savedNode.remaining <= 0 && savedNode.resetAt <= now) {
      return {
        remaining: GATHERING_NODE_MAX_CHARGES,
        resetAt: 0,
      };
    }

    return savedNode;
  };

  const handleGather = () => {
    if (!currentLocation || currentLocation.type !== 'gathering') return;
    if (!canGatherAtCurrentLocation()) return;
    const nodeState = getGatheringNodeState(currentLocation.id);
    if (nodeState.remaining <= 0) {
      updateCharacter({
        gatheringNodes: {
          ...(character.gatheringNodes || {}),
          [currentLocation.id]: nodeState,
        },
      });
      return;
    }

    const gatheringReward = generateGatheringEvent(
      currentLocation.level || 1,
      currentLocation.resourcePool
    );
    let updatedInventory = [...character.inventory];
    const collectedItems: { itemId: string; quantity: number }[] = [];
    const displayedRewards: { name: string; quantity: number }[] = [];
    const professionUpdate = getGatheringProfessionUpdate(
      character.profession,
      currentLocation.resourcePool
    );

    gatheringReward.rewards.forEach(({ item, quantity }) => {
      const finalQuantity = quantity + professionUpdate.quantityBonus;

      if (canAddItemToInventory(item, updatedInventory)) {
        updatedInventory = addItemToInventory(item, updatedInventory, finalQuantity);
        collectedItems.push({ itemId: item.id, quantity: finalQuantity });
        displayedRewards.push({ name: item.name, quantity: finalQuantity });
      }
    });

    updateCharacter({
      inventory: updatedInventory,
      quests: updateQuestsForCollect(character.quests || [], collectedItems),
      profession: professionUpdate.profession,
      professions: professionUpdate.profession
        ? {
            ...(character.professions || {}),
            [professionUpdate.profession.id]: professionUpdate.profession,
          }
        : character.professions,
      activeProfessionId: professionUpdate.profession?.id || character.activeProfessionId,
      gatheringNodes: {
        ...(character.gatheringNodes || {}),
        [currentLocation.id]: {
          remaining: nodeState.remaining - 1,
          resetAt:
            nodeState.remaining - 1 <= 0
              ? Date.now() + GATHERING_NODE_RESET_MS
              : nodeState.resetAt,
          },
      },
      stats: {
        ...(character.stats || {
          kills: 0,
          bossesKilled: 0,
          resourcesGathered: 0,
          itemsCrafted: 0,
          equipmentUpgrades: 0,
        }),
        resourcesGathered:
          (character.stats?.resourcesGathered || 0) +
          collectedItems.reduce((total, item) => total + item.quantity, 0),
      },
    });
    setLastGatheringRewards(displayedRewards);
  };

  const handleAcceptQuest = (quest: Quest) => {
    if ((character.quests || []).some((activeQuest) => activeQuest.id === quest.id)) {
      return;
    }

    updateCharacter({
      quests: [
        ...(character.quests || []),
        createActiveQuest(quest, character.inventory),
      ],
    });
  };

  const handleChooseProfession = (professionId: ProfessionId) => {
    if (
      character.profession &&
      character.profession.level < MAX_PROFESSION_LEVEL
    ) {
      return;
    }
    const nextProfession =
      character.professions?.[professionId] || createProfession(professionId);
    updateCharacter({
      profession: nextProfession,
      activeProfessionId: professionId,
      professions: {
        ...(character.professions || {}),
        ...(character.profession
          ? { [character.profession.id]: character.profession }
          : {}),
        [professionId]: nextProfession,
      },
    });
  };

  const handleSetActiveTitle = (titleId?: string) => {
    if (titleId && !(character.unlockedTitleIds || []).includes(titleId)) return;
    updateCharacter({
      activeTitleId: titleId,
    });
  };

  const handleClaimQuestReward = (quest: Quest) => {
    if (!isQuestReadyToClaim(quest)) return;

    const remainingQuests = (character.quests || []).filter(
      (activeQuest) => activeQuest.id !== quest.id
    );
    const rewardInventory = [...character.inventory];

    (quest.rewards.items || []).forEach((item) => {
      if (canAddItemToInventory(item, rewardInventory)) {
        const updatedInventory = addItemToInventory(item, rewardInventory);
        rewardInventory.splice(0, rewardInventory.length, ...updatedInventory);
      }
    });

    const rewardedCharacter = {
      ...character,
      gold: character.gold + quest.rewards.gold,
      experience: character.experience + quest.rewards.experience,
      inventory: rewardInventory,
      quests: remainingQuests,
      completedQuestIds: [...(character.completedQuestIds || []), quest.id],
    };
    const levelUpUpdates = getLevelUpUpdates(
      rewardedCharacter,
      rewardedCharacter.experience
    );

    updateCharacter({
      gold: rewardedCharacter.gold,
      experience: rewardedCharacter.experience,
      inventory: rewardInventory,
      quests: remainingQuests,
      completedQuestIds: rewardedCharacter.completedQuestIds,
      ...levelUpUpdates,
    });
  };

  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    if (
      character.gold < recipe.goldCost ||
      !hasMaterials(character.inventory, recipe.materials) ||
      !canAddItemToInventory(recipe.result, character.inventory)
    ) {
      return;
    }

    const inventoryWithoutMaterials = removeMaterialsFromInventory(
      character.inventory,
      recipe.materials
    );
    const updatedInventory = addItemToInventory(
      recipe.result,
      inventoryWithoutMaterials,
      recipe.quantity
    );

    updateCharacter({
      gold: character.gold - recipe.goldCost,
      inventory: updatedInventory,
      stats: {
        ...(character.stats || {
          kills: 0,
          bossesKilled: 0,
          resourcesGathered: 0,
          itemsCrafted: 0,
          equipmentUpgrades: 0,
        }),
        itemsCrafted: (character.stats?.itemsCrafted || 0) + recipe.quantity,
      },
    });
  };

  const handleUpgradeItem = (item: InventoryItem) => {
    if (item.type !== 'weapon' && item.type !== 'armor') return;
    if ((item.upgradeLevel || 0) >= MAX_EQUIPMENT_UPGRADE) return;

    const cost = getEquipmentUpgradeCost(item);
    if (character.gold < cost.goldCost || !hasMaterials(character.inventory, cost.materials)) {
      return;
    }

    const nextUpgradeLevel = (item.upgradeLevel || 0) + 1;
    const baseName = item.name.replace(/\s\+\d+$/, '');
    const upgradedItem: InventoryItem = {
      ...item,
      name: `${baseName} +${nextUpgradeLevel}`,
      power: (item.power || 0) + getEquipmentUpgradePowerGain(item),
      upgradeLevel: nextUpgradeLevel,
    };
    const isSameInventoryItem = (
      first: InventoryItem,
      second: InventoryItem
    ) =>
      first.instanceId && second.instanceId
        ? first.instanceId === second.instanceId
        : first.id === second.id;
    const inventoryWithoutMaterials = removeMaterialsFromInventory(
      character.inventory,
      cost.materials
    );
    const updatedInventory = inventoryWithoutMaterials.map((inventoryItem) =>
      isSameInventoryItem(inventoryItem, item) ? upgradedItem : inventoryItem
    );
    const updatedEquipment = { ...character.equipment };

    if (
      character.equipment.weapon &&
      isSameInventoryItem(character.equipment.weapon, item)
    ) {
      updatedEquipment.weapon = upgradedItem;
    }
    if (
      character.equipment.armor &&
      isSameInventoryItem(character.equipment.armor, item)
    ) {
      updatedEquipment.armor = upgradedItem;
    }

    updateCharacter({
      gold: character.gold - cost.goldCost,
      inventory: updatedInventory,
      equipment: updatedEquipment,
      stats: {
        ...(character.stats || {
          kills: 0,
          bossesKilled: 0,
          resourcesGathered: 0,
          itemsCrafted: 0,
          equipmentUpgrades: 0,
        }),
        equipmentUpgrades: (character.stats?.equipmentUpgrades || 0) + 1,
      },
    });
  };

  const getGatheringProfessionUpdate = (
    profession: ProfessionProgress | undefined,
    resourcePool?: string
  ): { profession: ProfessionProgress | undefined; quantityBonus: number } => {
    if (!profession || !resourcePool) {
      return { profession, quantityBonus: 0 };
    }

    const professionDefinition = PROFESSION_BY_ID[profession.id];
    if (!professionDefinition.resourcePools.includes(resourcePool)) {
      return { profession, quantityBonus: 0 };
    }

    const baseBonus = getProfessionYieldBonus(profession.level);
    const extraBonus = Math.random() < getProfessionExtraChance(profession.level) ? 1 : 0;
    if (profession.level >= MAX_PROFESSION_LEVEL) {
      return {
        profession: {
          ...profession,
          level: MAX_PROFESSION_LEVEL,
          experience: 0,
        },
        quantityBonus: baseBonus + extraBonus,
      };
    }

    let nextProfession: ProfessionProgress = {
      ...profession,
      experience: profession.experience + 25,
    };

    while (
      nextProfession.level < MAX_PROFESSION_LEVEL &&
      nextProfession.experience >=
      getProfessionRequiredExperience(nextProfession.level)
    ) {
      nextProfession = {
        ...nextProfession,
        experience:
          nextProfession.experience -
          getProfessionRequiredExperience(nextProfession.level),
        level: nextProfession.level + 1,
      };
    }

    if (nextProfession.level >= MAX_PROFESSION_LEVEL) {
      nextProfession = {
        ...nextProfession,
        level: MAX_PROFESSION_LEVEL,
        experience: 0,
      };
    }

    return {
      profession: nextProfession,
      quantityBonus: baseBonus + extraBonus,
    };
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
    lastGatheringRewards,
    gatheringNodeState:
      currentLocation?.type === 'gathering'
        ? getGatheringNodeState(currentLocation.id)
        : null,
    gatheringResetMs: GATHERING_NODE_RESET_MS,
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
    handleGather,
    handleAcceptQuest,
    handleClaimQuestReward,
    handleCraftRecipe,
    handleUpgradeItem,
    handleChooseProfession,
    handleSetActiveTitle,
    handleAttributeIncrease,
    handleSpellSelect,
    handleAbilitySelect,
    closeLevelUpModal: () => setShowLevelUpModal(false),
  };
}
