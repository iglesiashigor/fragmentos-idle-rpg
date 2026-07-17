import { Character } from './Character';
import { GameMap } from './GameMap';
import { Town } from './Town';
import { Combat } from './Combat';
import { RandomEventModal } from './RandomEventModal';
import { UserProfile } from './Profile/UserProfile';
import { DeathModal } from './Character/DeathModal';
import { InventoryPanel } from './Inventory/InventoryPanel';
import { LevelUpModal } from './LevelUp/LevelUpModal';
import { useGameState } from '../hooks/useGameState';
import { SavedCharacter, InventoryItem } from '../types/game';

interface GameContentProps {
  character: SavedCharacter;
  onCharacterUpdate: (character: SavedCharacter) => void;
  onLogout: () => void;
  onCreateNew: () => void;
}

export function GameContent({ character: initialCharacter, onCharacterUpdate, onLogout, onCreateNew }: GameContentProps) {
  const gameState = useGameState(initialCharacter, onCharacterUpdate);

  const isSameInventoryItem = (
    first: InventoryItem,
    second: InventoryItem
  ) =>
    first.instanceId && second.instanceId
      ? first.instanceId === second.instanceId
      : first.id === second.id;

  const handleEquipItem = (item: InventoryItem) => {
    const slot = item.type === 'weapon' ? 'weapon' : 'armor';
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
  };

  const handleUnequipItem = (slot: 'weapon' | 'armor') => {
    const currentEquipped = gameState.character.equipment[slot];
    if (!currentEquipped) return;

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
    }
  };

  return (
    <div className="app-bg">
      <div className="page-wrap space-y-6">
        <UserProfile username={initialCharacter.name} onLogout={onLogout} />

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <Character character={gameState.character} />
            <InventoryPanel
              inventory={gameState.character.inventory}
              equipment={gameState.character.equipment}
              onEquipItem={handleEquipItem}
              onUnequipItem={handleUnequipItem}
              onUsePotion={handleUsePotion}
              currentHealth={gameState.character.health}
              maxHealth={gameState.character.maxHealth}
            />
          </div>

          <div className="rpg-panel rounded-lg p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-stone-950">Mapa</h2>
              <p className="text-sm font-semibold text-stone-500">
                Escolha um destino para continuar a aventura
              </p>
            </div>
            <GameMap
              locations={gameState.mapLocations}
              onLocationSelect={gameState.handleLocationSelect}
            />

            {gameState.currentLocation && (
              <div className="mt-6">
                <h2 className="mb-4 text-2xl font-black text-stone-950">
                  {gameState.currentLocation.name}
                </h2>
                {gameState.currentLocation.type === 'town' ? (
                  <Town
                    gold={gameState.character.gold}
                    inventory={gameState.character.inventory}
                    currentHealth={gameState.character.health}
                    maxHealth={gameState.character.maxHealth}
                    onBuyItem={gameState.handleBuyItem}
                    onSellItem={gameState.handleSellItem}
                    onRest={gameState.handleRest}
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
