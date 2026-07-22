import { useEffect, useState } from 'react';
import { Character } from './Character';
import { GameMap } from './GameMap';
import { Town } from './Town';
import { Combat } from './Combat';
import { Gathering } from './Gathering';
import { BossLair } from './BossLair';
import { RewardSummary } from './RewardSummary';
import { ObjectivePanel } from './ObjectivePanel';
import { RandomEventModal } from './RandomEventModal';
import { UserProfile } from './Profile/UserProfile';
import { DeathModal } from './Character/DeathModal';
import { CharacterTabs } from './Character/CharacterTabs';
import { LevelUpModal } from './LevelUp/LevelUpModal';
import { useGameState } from '../hooks/useGameState';
import { SavedCharacter, InventoryItem, Item, Quest } from '../types/game';
import { CraftingRecipe } from '../data/recipes';
import {
  EquipmentSlotId,
  canAddItemToInventory,
  getEquipmentSlot,
  getInventorySlotCount,
  MAX_INVENTORY_SLOTS,
} from '../utils/inventory';

interface GameContentProps {
  character: SavedCharacter;
  onCharacterUpdate: (character: SavedCharacter) => void;
  onLogout: () => void;
  onCreateNew: () => void;
}

export function GameContent({ character: initialCharacter, onCharacterUpdate, onLogout, onCreateNew }: GameContentProps) {
  const gameState = useGameState(initialCharacter, onCharacterUpdate);
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = window.setTimeout(() => setActionNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [actionNotice]);

  const isSameInventoryItem = (
    first: InventoryItem,
    second: InventoryItem
  ) =>
    first.instanceId && second.instanceId
      ? first.instanceId === second.instanceId
      : first.id === second.id;

  const handleEquipItem = (item: InventoryItem) => {
    const slot = getEquipmentSlot(item);
    if (!slot) return;
    setInventoryNotice(null);
    const currentEquipped = gameState.character.equipment[slot];

    const updatedInventory = gameState.character.inventory.map(invItem => {
      if (isSameInventoryItem(invItem, item)) {
        return { ...invItem, equipped: true };
      }
      if (currentEquipped && isSameInventoryItem(invItem, currentEquipped)) {
        return { ...invItem, equipped: false };
      }
      return invItem;
    });

    const updatedEquipment = {
      ...gameState.character.equipment,
      [slot]: item
    };

    gameState.updateCharacter({
      inventory: updatedInventory,
      equipment: updatedEquipment
    });
    setActionNotice(`${item.name} equipado.`);
  };

  const handleUnequipItem = (slot: EquipmentSlotId) => {
    const currentEquipped = gameState.character.equipment[slot];
    if (!currentEquipped) return;

    if (getInventorySlotCount(gameState.character.inventory) >= MAX_INVENTORY_SLOTS) {
      setInventoryNotice('Sua mochila está cheia. Libere espaço antes de desequipar este item.');
      return;
    }

    setInventoryNotice(null);

    const updatedInventory = gameState.character.inventory.map(item => 
      isSameInventoryItem(item, currentEquipped)
        ? { ...item, equipped: false }
        : item
    );

    const updatedEquipment = {
      ...gameState.character.equipment,
      [slot]: null
    };

    gameState.updateCharacter({
      inventory: updatedInventory,
      equipment: updatedEquipment
    });
    setActionNotice(`${currentEquipped.name} voltou para a bolsa.`);
  };

  const handleUsePotion = (item: InventoryItem) => {
    if (item.type !== 'potion') return;

    const updates: Partial<SavedCharacter> = {};
    let effectApplied = false;

    // Apply healing
    if (item.healing && gameState.character.health < gameState.character.maxHealth) {
      const newHealth = Math.min(
        gameState.character.health + item.healing,
        gameState.character.maxHealth
      );
      updates.health = newHealth;
      effectApplied = true;
    }

    // Apply mana restore
    if (item.manaRestore && 
        gameState.character.mana !== undefined && 
        gameState.character.maxMana !== undefined && 
        gameState.character.mana < gameState.character.maxMana) {
      const newMana = Math.min(
        gameState.character.mana + item.manaRestore,
        gameState.character.maxMana
      );
      updates.mana = newMana;
      effectApplied = true;
    }

    // Apply stamina restore
    if (item.staminaRestore && 
        gameState.character.stamina !== undefined && 
        gameState.character.maxStamina !== undefined && 
        gameState.character.stamina < gameState.character.maxStamina) {
      const newStamina = Math.min(
        gameState.character.stamina + item.staminaRestore,
        gameState.character.maxStamina
      );
      updates.stamina = newStamina;
      effectApplied = true;
    }

    // Only consume the potion if any effect was applied
    if (effectApplied) {
      const updatedInventory = gameState.character.inventory.map(invItem => {
        if (invItem.id === item.id) {
          return { ...invItem, quantity: invItem.quantity - 1 };
        }
        return invItem;
      }).filter(item => item.quantity > 0);

      updates.inventory = updatedInventory;
      gameState.updateCharacter(updates);
      setActionNotice(`${item.name} usada.`);
    }
  };

  const handleBuyItem = (item: Item) => {
    if (gameState.character.gold < item.price) {
      setActionNotice('Ouro insuficiente para comprar este item.');
      return;
    }
    if (!canAddItemToInventory(item, gameState.character.inventory)) {
      setActionNotice('Sua mochila está cheia.');
      return;
    }
    gameState.handleBuyItem(item);
    setActionNotice(`${item.name} comprado.`);
  };

  const handleSellItem = (item: InventoryItem, quantity: number) => {
    gameState.handleSellItem(item, quantity);
    setActionNotice(`${item.name} vendido.`);
  };

  const handleRest = () => {
    if (gameState.character.gold < 20) {
      setActionNotice('Você precisa de 20 ouro para descansar.');
      return;
    }
    gameState.handleRest();
    setActionNotice('Descanso concluído. Recursos restaurados.');
  };

  const handleGather = () => {
    gameState.handleGather();
    setActionNotice('Coleta realizada.');
  };

  const handleAcceptQuest = (quest: Quest) => {
    gameState.handleAcceptQuest(quest);
    setActionNotice(`Missão aceita: ${quest.name}.`);
  };

  const handleClaimQuestReward = (quest: Quest) => {
    gameState.handleClaimQuestReward(quest);
    setActionNotice(`Recompensa recebida: ${quest.name}.`);
  };

  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    gameState.handleCraftRecipe(recipe);
    setActionNotice(`${recipe.name} produzido.`);
  };

  const handleUpgradeItem = (item: InventoryItem) => {
    gameState.handleUpgradeItem(item);
    setActionNotice(`${item.name} melhorado.`);
  };

  return (
    <div className="app-bg">
      <div className="page-wrap space-y-6">
        <UserProfile username={initialCharacter.name} onLogout={onLogout} />

        <ObjectivePanel
          character={gameState.character}
          bossAvailable={gameState.canEnterBossLair}
          bossEntryCost={gameState.bossLairEntryCost}
        />

        {actionNotice && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 shadow-sm">
            {actionNotice}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)] 2xl:grid-cols-[440px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Character character={gameState.character} />
            <CharacterTabs
              character={gameState.character}
              inventory={gameState.character.inventory}
              equipment={gameState.character.equipment}
              onEquipItem={handleEquipItem}
              onUnequipItem={handleUnequipItem}
              onUsePotion={handleUsePotion}
              onSetActiveTitle={gameState.handleSetActiveTitle}
              inventoryNotice={inventoryNotice}
            />
          </div>

          <div className="rpg-panel min-w-0 rounded-lg p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-stone-950">Mapa</h2>
              <p className="text-sm font-semibold text-stone-500">
                Escolha um destino para continuar a aventura
              </p>
            </div>
            <GameMap
              locations={gameState.mapLocations}
              currentLocationId={gameState.currentLocation?.id}
              onLocationSelect={gameState.handleLocationSelect}
            />

            {gameState.currentLocation && (
              <div className="mt-6">
                <h2 className="mb-4 text-2xl font-black text-stone-950">
                  {gameState.currentLocation.name}
                </h2>
                {gameState.currentLocation.type === 'town' ? (
                  <Town
                    character={gameState.character}
                    gold={gameState.character.gold}
                    inventory={gameState.character.inventory}
                    currentHealth={gameState.character.health}
                    maxHealth={gameState.character.maxHealth}
                    onBuyItem={handleBuyItem}
                    onSellItem={handleSellItem}
                    onRest={handleRest}
                    onAcceptQuest={handleAcceptQuest}
                    onClaimQuestReward={handleClaimQuestReward}
                    onCraftRecipe={handleCraftRecipe}
                    onUpgradeItem={handleUpgradeItem}
                  />
                ) : gameState.currentLocation.type === 'gathering' ? (
                  <Gathering
                    character={gameState.character}
                    location={gameState.currentLocation}
                    lastRewards={gameState.lastGatheringRewards}
                    nodeState={gameState.gatheringNodeState}
                    onGather={handleGather}
                  />
                ) : gameState.currentLocation.type === 'boss_lair' && !gameState.enemy ? (
                  <BossLair
                    character={gameState.character}
                    entryCost={gameState.bossLairEntryCost}
                    canEnter={gameState.canEnterBossLair}
                    onEnter={gameState.handleEnterBossLair}
                  />
                ) : (
                  gameState.enemy && (
                    <Combat
                      player={gameState.character}
                      enemy={gameState.enemy}
                      onAttack={gameState.handleAttack}
                      onCastSpell={gameState.handleCastSpell}
                      onUseAbility={gameState.handleUseAbility}
                    />
                  )
                )}
              </div>
            )}

            {gameState.lastCombatRewards && (
              <RewardSummary reward={gameState.lastCombatRewards} />
            )}
          </div>
        </div>

        {gameState.showDeathModal && gameState.enemy && (
          <DeathModal
            characterName={gameState.character.name}
            killedBy={gameState.enemy.name}
            onRespawn={gameState.handleRespawn}
            onCreateNew={onCreateNew}
          />
        )}

        {gameState.showLevelUpModal && (
          <LevelUpModal
            level={gameState.character.level}
            attributes={gameState.character.attributes}
            onAttributeIncrease={gameState.handleAttributeIncrease}
            onSpellSelect={gameState.handleSpellSelect}
            onAbilitySelect={gameState.handleAbilitySelect}
            availablePoints={gameState.attributePoints}
            onClose={gameState.closeLevelUpModal}
            character={gameState.character}
          />
        )}

        {gameState.showRandomEvent && gameState.randomEventReward && (
          <RandomEventModal
            reward={gameState.randomEventReward}
            onClaim={gameState.handleClaimRandomEvent}
          />
        )}
      </div>
    </div>
  );
}
