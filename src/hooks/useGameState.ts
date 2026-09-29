import { useEffect, useRef, useState } from 'react';
import {
  SavedCharacter,
  Item,
  Spell,
  MapLocation,
  Enemy,
  CombatTurnFeedback,
  InventoryItem,
  Attributes,
  Ability,
  Quest,
  ProfessionId,
  DailyTaskProgress,
  DailyTaskType,
} from '../types/game';
import { generateBoss, generateEnemy } from '../data/enemies';
import {
  getEffectiveEncounterLevel,
  getEncounterLevelRange,
} from '../data/balance';
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
  calculateMaxHealth,
  calculateMaxResource,
} from '../utils/combatStats';
import {
  addItemToInventory,
  canAddItemToInventory,
  EQUIPMENT_SLOTS,
  hasMaterials,
  isEquipmentItem,
  removeMaterialsFromInventory,
} from '../utils/inventory';
import {
  createActiveQuest,
  isQuestReadyToClaim,
  updateQuestsForCollect,
} from '../utils/questManager';
import {
  CraftingRecipe,
  getEquipmentUpgradeCost,
  getEquipmentUpgradePowerGain,
  MaterialCost,
  MAX_EQUIPMENT_UPGRADE,
} from '../data/recipes';
import {
  createProfession,
  getProfessionForResourcePool,
  PROFESSION_BY_ID,
} from '../data/professions';
import { getUnlockedTitleIds } from '../data/achievements';
import {
  createGuild,
  getGuildUpgradeCost,
  GUILD_FOUNDATION_COST,
  MAX_GUILD_LEVEL,
} from '../data/guild';
import {
  advanceDailyTasks,
  normalizeDailyTasks,
} from '../data/dailyTasks';
import { getAttributeIncreaseUpdates, LEVEL_UP_ATTRIBUTE_POINTS } from '../utils/attributes';
import { getBossLairEntryCost, getRestCost, getSellPrice, RESPAWN_COST } from '../utils/economy';
import { CombatAction, resolveCombatTurn } from '../utils/combat';
import { calculateCombatRewards } from '../utils/combatRewards';
import {
  collectResources,
  consumeGatheringCharge,
  GATHERING_NODE_RESET_MS,
  getGatheringUpgradeCost,
  getGatheringNodeState,
  MAX_GATHERING_NODE_LEVEL,
} from '../utils/gathering';
import { cleanTechniqueDescription, upgradeTechnique } from '../utils/techniques';

const BOSS_LAIR_RESET_MS = 10 * 60 * 1000;

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
    const dailyProgress = normalizeDailyTasks(
      savedCharacter.dailyTasks,
      savedCharacter.dailyTasksResetAt,
      savedCharacter.level
    );
    const normalizedCharacter: SavedCharacter = {
      ...savedCharacter,
      spells: savedCharacter.spells.map((spell) => ({
        ...spell,
        description: cleanTechniqueDescription(spell.description),
      })),
      abilities: savedCharacter.abilities.map((ability) => ({
        ...ability,
        description: cleanTechniqueDescription(ability.description),
      })),
      equipment: {
        weapon: savedCharacter.equipment.weapon || null,
        armor: savedCharacter.equipment.armor || null,
        helmet: savedCharacter.equipment.helmet || null,
        gloves: savedCharacter.equipment.gloves || null,
        pants: savedCharacter.equipment.pants || null,
        boots: savedCharacter.equipment.boots || null,
      },
      quests: savedCharacter.quests || [],
      completedQuestIds: savedCharacter.completedQuestIds || [],
      professions: {
        ...Object.fromEntries(
          Object.keys(PROFESSION_BY_ID).map((professionId) => [
            professionId,
            createProfession(professionId as ProfessionId),
          ])
        ),
        ...(savedCharacter.professions || {}),
        ...(savedCharacter.profession
          ? { [savedCharacter.profession.id]: savedCharacter.profession }
          : {}),
      },
      profession: undefined,
      activeProfessionId: undefined,
      gatheringNodes: savedCharacter.gatheringNodes || {},
      stats: savedCharacter.stats || {
        kills: 0,
        bossesKilled: 0,
        resourcesGathered: 0,
        itemsCrafted: 0,
        equipmentUpgrades: 0,
      },
      unlockedTitleIds: savedCharacter.unlockedTitleIds || [],
      dailyTasks: dailyProgress.tasks,
      dailyTasksResetAt: dailyProgress.resetAt,
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
  const [lastCombatRewards, setLastCombatRewards] = useState<{
    enemyName: string;
    gold: number;
    experience: number;
    loot: { name: string; quantity: number }[];
    finishingBlow?: string;
    finishingDamage?: number;
  } | null>(null);
  const [combatFeedback, setCombatFeedback] = useState<CombatTurnFeedback | null>(null);
  const [showDeathModal, setShowDeathModal] = useState(initialCharacter.health <= 0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [attributePoints, setAttributePoints] = useState(0);
  const hasSavedNormalizedCharacter = useRef(false);

  useEffect(() => {
    if (hasSavedNormalizedCharacter.current) return;

    if (
      character.maxHealth !== initialCharacter.maxHealth ||
      character.maxMana !== initialCharacter.maxMana ||
      character.maxStamina !== initialCharacter.maxStamina ||
      character.spells.some((spell, index) => spell.description !== initialCharacter.spells[index]?.description) ||
      character.abilities.some((ability, index) => ability.description !== initialCharacter.abilities[index]?.description)
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

  const getAdvancedDailyTasks = (
    type: DailyTaskType,
    amount = 1,
    baseCharacter: SavedCharacter = character
  ) =>
    advanceDailyTasks(
      baseCharacter.dailyTasks,
      baseCharacter.dailyTasksResetAt,
      baseCharacter.level,
      type,
      amount
    );

  const handleAttributeIncrease = (attribute: keyof Attributes) => {
    if (attributePoints > 0) {
      updateCharacter(getAttributeIncreaseUpdates(character, attribute));
      setAttributePoints(points => points - 1);
    }
  };

  const handleSpellSelect = (spell: Spell) => {
    if (character.class.resourceType !== 'mana') return;

    const existingSpell = character.spells.find(s => s.id === spell.id);
    
    if (existingSpell) {
      // Level up existing spell
      const updatedSpells = character.spells.map(s => s.id === spell.id ? upgradeTechnique(s) : s);
      
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
      const updatedAbilities = character.abilities.map(a => a.id === ability.id ? upgradeTechnique(a) : a);
      
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
        setAttributePoints(LEVEL_UP_ATTRIBUTE_POINTS);
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
    setLastCombatRewards(null);
    setCombatFeedback(null);
    const encounterLevel = getEffectiveEncounterLevel(
      character.level,
      location.level || getEncounterLevel(character.level)
    );

    if (location.type === 'enemy') {
      setEnemy(generateEnemy(encounterLevel));
    } else if (location.type === 'boss_lair') {
      setEnemy(null);
      setShowRandomEvent(false);
      setRandomEventReward(null);
    } else if (location.type === 'event') {
      const bossChance = 0.25;

      if (Math.random() < bossChance) {
        setCurrentLocation({
          ...location,
          name: 'Chefão Encontrado',
        });
        setEnemy(generateBoss(encounterLevel, character));
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
    const range = getEncounterLevelRange(playerLevel);
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const handleCombatAction = (action: CombatAction) => {
    if (!enemy) return;
    const turn = resolveCombatTurn(character, enemy, action);
    if (!turn) return;

    setCombatFeedback(turn.feedback);
    if (turn.outcome === 'enemy') {
      handleEnemyDefeat(turn.resourceUpdates, turn.feedback.action, turn.feedback.playerDamage);
      return;
    }
    if (turn.outcome === 'player') {
      setShowDeathModal(true);
      updateCharacter({ health: 0, ...turn.resourceUpdates });
      return;
    }

    setEnemy({ ...enemy, health: turn.enemyHealth, turnsTaken: turn.turnsTaken });
    updateCharacter({ health: turn.playerHealth, ...turn.resourceUpdates });
  };

  const handleAttack = () => handleCombatAction({ type: 'attack' });
  const handleCastSpell = (spell: Spell) => handleCombatAction({ type: 'spell', spell });
  const handleUseAbility = (ability: Ability) => handleCombatAction({ type: 'ability', ability });

  const handleEnemyDefeat = (
    preRewardUpdates: Partial<SavedCharacter> = {},
    finishingBlow?: string,
    finishingDamage?: number
  ) => {
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
        (loc) => loc.type === 'event'
      ).length;

      const newLocations = [...remainingLocations];

      // Enemy replacement must always add an enemy. Events are optional extras.
      if (newEnemyCount < MAX_ENEMIES) {
        newLocations.push(generateRandomEnemyLocation(character.level));
      }

      if (newEventCount < MAX_EVENTS && Math.random() < 0.35) {
        const newLocation = generateRandomLocation(character.level);
        if (
          newLocation.type === 'event'
        ) {
          newLocations.push(newLocation);
        }
      }

      return newLocations;
    });

    const reward = calculateCombatRewards(character, enemy, preRewardUpdates);
    const updates = {
      ...reward.updates,
      ...(currentLocation.type === 'boss_lair'
        ? { bossLairResetAt: Date.now() + BOSS_LAIR_RESET_MS }
        : {}),
    };
    const rewardedCharacter = { ...character, ...updates };
    const levelUpUpdates = getLevelUpUpdates(rewardedCharacter, rewardedCharacter.experience);
    updateCharacter({ ...updates, ...levelUpUpdates });

    setLastCombatRewards({
      enemyName: enemy.name,
      gold: reward.gold,
      experience: reward.experience,
      finishingBlow,
      finishingDamage,
      loot: reward.collectedItems.map((item) => ({
        name:
          enemy.loot.find((lootItem) => lootItem.id === item.itemId)?.name ||
          item.itemId,
        quantity: item.quantity,
      })),
    });

    setEnemy(null);
    setCurrentLocation(null);
  };

  const canEnterBossLair = () => {
    return !character.bossLairResetAt || character.bossLairResetAt <= Date.now();
  };

  const handleEnterBossLair = () => {
    if (!currentLocation || currentLocation.type !== 'boss_lair') return;
    if (!canEnterBossLair()) return;
    const entryCost = getBossLairEntryCost(character.level);
    if (character.gold < entryCost) return;

    updateCharacter({
      gold: character.gold - entryCost,
    });
    setEnemy(generateBoss(Math.max(1, character.level), character));
    setLastCombatRewards(null);
    setCombatFeedback(null);
  };

  const handleRespawn = () => {
    if (character.gold >= RESPAWN_COST) {
      const updates: Partial<SavedCharacter> = {
        health: character.maxHealth,
        gold: character.gold - RESPAWN_COST,
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
    const restCost = getRestCost(character.level);
    if (character.gold >= restCost) {
      const updates: Partial<SavedCharacter> = {
        health: character.maxHealth,
        gold: character.gold - restCost,
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
    const inventoryItem = character.inventory.find((entry) =>
      entry.instanceId && item.instanceId
        ? entry.instanceId === item.instanceId
        : entry.id === item.id
    );
    if (!inventoryItem || inventoryItem.equipped) return;

    const sellQuantity = Math.max(1, Math.min(quantity, inventoryItem.quantity));
    const sellPrice = getSellPrice(inventoryItem.price, sellQuantity, inventoryItem.rarity);
    const isSameInventoryItem = (
      first: InventoryItem,
      second: InventoryItem
    ) =>
      first.instanceId && second.instanceId
        ? first.instanceId === second.instanceId
        : first.id === second.id;
    
    if (EQUIPMENT_SLOTS.some((slot) => {
      const equippedItem = character.equipment[slot];
      return equippedItem && isSameInventoryItem(equippedItem, item);
    })) {
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
    const dailyProgress = getAdvancedDailyTasks('sell', sellQuantity);

    updateCharacter({
      gold: character.gold + sellPrice,
      inventory: updatedInventory,
      dailyTasks: dailyProgress.tasks,
      dailyTasksResetAt: dailyProgress.resetAt,
    });
  };

  const handleClaimRandomEvent = () => {
    if (!randomEventReward || !currentLocation) return;

    if (randomEventReward.type === 'resource') {
      const collected = collectResources(
        character,
        randomEventReward.rewards,
        currentLocation.resourcePool
      );
      const dailyProgress = getAdvancedDailyTasks('gather', 1);

      updateCharacter({
        inventory: collected.inventory,
        quests: updateQuestsForCollect(character.quests || [], collected.collectedItems),
        profession: undefined,
        professions: collected.professions,
        activeProfessionId: undefined,
        dailyTasks: dailyProgress.tasks,
        dailyTasksResetAt: dailyProgress.resetAt,
      });
    } else if (randomEventReward.type === 'item') {
      const rewardItem = randomEventReward.reward as Item;
      if (canAddItemToInventory(rewardItem, character.inventory)) {
        updateCharacter({
          inventory: addItemToInventory(rewardItem, character.inventory),
        });
      }
    } else if (randomEventReward.type === 'gold') {
      updateCharacter({
        gold: character.gold + randomEventReward.gold,
      });
    } else if (randomEventReward.type === 'blessing') {
      const updates: Partial<SavedCharacter> = {
        health: Math.min(
          character.maxHealth,
          character.health + randomEventReward.healthRestore
        ),
      };

      if (character.mana !== undefined && character.maxMana !== undefined) {
        updates.mana = Math.min(
          character.maxMana,
          character.mana + randomEventReward.resourceRestore
        );
      }

      if (character.stamina !== undefined && character.maxStamina !== undefined) {
        updates.stamina = Math.min(
          character.maxStamina,
          character.stamina + randomEventReward.resourceRestore
        );
      }

      updateCharacter(updates);
    } else if (randomEventReward.type === 'quest') {
      const alreadyActive = (character.quests || []).some(
        (quest) => quest.id === randomEventReward.quest.id
      );
      const alreadyCompleted = (character.completedQuestIds || []).includes(
        randomEventReward.quest.id
      );

      if (!alreadyActive && !alreadyCompleted) {
        updateCharacter({
          quests: [
            ...(character.quests || []),
            createActiveQuest(randomEventReward.quest, character.inventory),
          ],
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
    return Boolean(getProfessionForResourcePool(currentLocation.resourcePool));
  };


  const handleGather = () => {
    if (!currentLocation || currentLocation.type !== 'gathering') return;
    if (!canGatherAtCurrentLocation()) return;
    const nodeState = getGatheringNodeState(character.gatheringNodes, currentLocation.id);
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
      Math.max(currentLocation.level || 1, Math.ceil(character.level / 4)),
      currentLocation.resourcePool
    );
    const bonus = currentLocation.id.startsWith('gathering_') ? (nodeState.level || 1) - 1 : 0;
    const collected = collectResources(character, gatheringReward.rewards, currentLocation.resourcePool, bonus);
    const totalCollected = collected.collectedItems.reduce((total, item) => total + item.quantity, 0);
    const dailyProgress = getAdvancedDailyTasks('gather', 1);

    updateCharacter({
      inventory: collected.inventory,
      quests: updateQuestsForCollect(character.quests || [], collected.collectedItems),
      profession: undefined,
      professions: collected.professions,
      activeProfessionId: undefined,
      gatheringNodes: {
        ...(character.gatheringNodes || {}),
        [currentLocation.id]: consumeGatheringCharge(nodeState),
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
          (character.stats?.resourcesGathered || 0) + totalCollected,
      },
      dailyTasks: dailyProgress.tasks,
      dailyTasksResetAt: dailyProgress.resetAt,
    });
    setLastGatheringRewards(collected.displayedRewards);
  };

  const handleUpgradeGatheringNode = () => {
    if (currentLocation?.type !== 'gathering' || !currentLocation.id.startsWith('gathering_')) return;
    const nodeState = getGatheringNodeState(character.gatheringNodes, currentLocation.id);
    const level = nodeState.level || 1;
    const cost = getGatheringUpgradeCost(level);
    if (level >= MAX_GATHERING_NODE_LEVEL || character.gold < cost) return;
    updateCharacter({
      gold: character.gold - cost,
      gatheringNodes: {
        ...(character.gatheringNodes || {}),
        [currentLocation.id]: { ...nodeState, level: level + 1 },
      },
    });
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
    const dailyProgress = getAdvancedDailyTasks('craft');

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
      dailyTasks: dailyProgress.tasks,
      dailyTasksResetAt: dailyProgress.resetAt,
    });
  };

  const handleUpgradeItem = (item: InventoryItem) => {
    if (!isEquipmentItem(item)) return;
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

    EQUIPMENT_SLOTS.forEach((slot) => {
      const equippedItem = character.equipment[slot];
      if (equippedItem && isSameInventoryItem(equippedItem, item)) {
        updatedEquipment[slot] = upgradedItem;
      }
    });
    const dailyProgress = getAdvancedDailyTasks('craft');

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
      dailyTasks: dailyProgress.tasks,
      dailyTasksResetAt: dailyProgress.resetAt,
    });
  };

  const canPayCost = (cost: { goldCost: number; materials: MaterialCost[] }) => {
    return character.gold >= cost.goldCost && hasMaterials(character.inventory, cost.materials);
  };

  const handleFoundGuild = (name: string) => {
    if (character.guild || !canPayCost(GUILD_FOUNDATION_COST)) return;

    updateCharacter({
      gold: character.gold - GUILD_FOUNDATION_COST.goldCost,
      inventory: removeMaterialsFromInventory(
        character.inventory,
        GUILD_FOUNDATION_COST.materials
      ),
      guild: createGuild(name),
    });
  };

  const handleUpgradeGuild = () => {
    if (!character.guild || character.guild.level >= MAX_GUILD_LEVEL) return;

    const cost = getGuildUpgradeCost(character.guild.level);
    if (!canPayCost(cost)) return;

    updateCharacter({
      gold: character.gold - cost.goldCost,
      inventory: removeMaterialsFromInventory(character.inventory, cost.materials),
      guild: {
        ...character.guild,
        level: character.guild.level + 1,
      },
    });
  };

  const handleClaimDailyTask = (task: DailyTaskProgress) => {
    const dailyProgress = normalizeDailyTasks(
      character.dailyTasks,
      character.dailyTasksResetAt,
      character.level
    );
    const currentTask = dailyProgress.tasks.find(
      (dailyTask) => dailyTask.id === task.id
    );

    if (!currentTask || currentTask.claimed || currentTask.current < currentTask.target) {
      return;
    }

    const rewardedCharacter = {
      ...character,
      gold: character.gold + currentTask.rewards.gold,
      experience: character.experience + currentTask.rewards.experience,
      dailyTasks: dailyProgress.tasks.map((dailyTask) =>
        dailyTask.id === currentTask.id
          ? { ...dailyTask, claimed: true }
          : dailyTask
      ),
      dailyTasksResetAt: dailyProgress.resetAt,
    };
    const levelUpUpdates = getLevelUpUpdates(
      rewardedCharacter,
      rewardedCharacter.experience
    );

    updateCharacter({
      gold: rewardedCharacter.gold,
      experience: rewardedCharacter.experience,
      dailyTasks: rewardedCharacter.dailyTasks,
      dailyTasksResetAt: rewardedCharacter.dailyTasksResetAt,
      ...levelUpUpdates,
    });
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
    lastCombatRewards,
    combatFeedback,
    gatheringNodeState:
      currentLocation?.type === 'gathering'
        ? getGatheringNodeState(character.gatheringNodes, currentLocation.id)
        : null,
    gatheringResetMs: GATHERING_NODE_RESET_MS,
    bossLairEntryCost: getBossLairEntryCost(character.level),
    bossLairResetMs: BOSS_LAIR_RESET_MS,
    canEnterBossLair: canEnterBossLair(),
    updateCharacter,
    handleLocationSelect,
    handleLeaveTown: () => setCurrentLocation(null),
    handleRest,
    handleAttack,
    handleCastSpell,
    handleUseAbility,
    handleEnterBossLair,
    handleRespawn,
    handleBuyItem,
    handleSellItem,
    handleClaimRandomEvent,
    handleGather,
    handleUpgradeGatheringNode,
    handleAcceptQuest,
    handleClaimQuestReward,
    handleCraftRecipe,
    handleUpgradeItem,
    handleFoundGuild,
    handleUpgradeGuild,
    handleClaimDailyTask,
    handleSetActiveTitle,
    handleAttributeIncrease,
    handleSpellSelect,
    handleAbilitySelect,
    closeLevelUpModal: () => setShowLevelUpModal(false),
  };
}
