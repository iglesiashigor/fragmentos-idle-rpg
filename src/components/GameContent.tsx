import { ReactNode, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Hammer, ScrollText, Sparkles, Trophy } from 'lucide-react';
import { Character } from './Character';
import { GameMap } from './GameMap';
import { Town } from './Town';
import { Combat } from './Combat';
import { AutoGatherField } from './AutoGatherField';
import { BossLair } from './BossLair';
import { RewardSummary } from './RewardSummary';
import { RandomEventModal } from './RandomEventModal';
import { UserProfile } from './Profile/UserProfile';
import { DeathModal } from './Character/DeathModal';
import { CharacterTabs } from './Character/CharacterTabs';
import { LevelUpModal } from './LevelUp/LevelUpModal';
import { TutorialModal } from './TutorialModal';
import { AutoFarmField } from './AutoFarmField';
import { useGameState } from '../hooks/useGameState';
import {
  DailyTaskProgress,
  SavedCharacter,
  InventoryItem,
  Item,
  Quest,
} from '../types/game';
import { CraftingRecipe } from '../data/recipes';
import { getDifficultyTone } from '../data/balance';
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
  onBackToSelection: () => void;
  onCreateNew: () => void;
}

type ActionNotice = {
  title: string;
  detail?: string;
  tone?: 'neutral' | 'success' | 'milestone';
  icon?: ReactNode;
};

type MarkerState = {
  status?: 'ready' | 'cooldown' | 'easy' | 'normal' | 'hard';
  label?: string;
};

export function GameContent({ character: initialCharacter, onCharacterUpdate, onLogout, onBackToSelection, onCreateNew }: GameContentProps) {
  const gameState = useGameState(initialCharacter, onCharacterUpdate);
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const previousCharacterRef = useRef(gameState.character);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = window.setTimeout(() => setActionNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [actionNotice]);

  useEffect(() => {
    const previousCharacter = previousCharacterRef.current;
    const currentCharacter = gameState.character;
    previousCharacterRef.current = currentCharacter;

    if (previousCharacter.id !== currentCharacter.id) return;

    if (currentCharacter.level > previousCharacter.level) {
      setActionNotice({
        title: `${currentCharacter.name} chegou ao nível ${currentCharacter.level}.`,
        detail: 'Atributos e recursos foram atualizados.',
        tone: 'milestone',
        icon: <Sparkles className="h-5 w-5" />,
      });
      return;
    }

    if (
      currentCharacter.guild &&
      previousCharacter.guild &&
      currentCharacter.guild.level > previousCharacter.guild.level
    ) {
      setActionNotice({
        title: `Guilda evoluiu para Nv. ${currentCharacter.guild.level}.`,
        detail: 'Os bônus permanentes ficaram melhores.',
        tone: 'milestone',
        icon: <Trophy className="h-5 w-5" />,
      });
      return;
    }

    const professionNames = {
      woodcutter: 'Lenhador',
      gatherer: 'Coletor',
      miner: 'Minerador',
      explorer: 'Explorador',
    };
    const upgradedProfession = Object.values(currentCharacter.professions || {}).find(
      (profession) =>
        profession &&
        profession.level >
          (previousCharacter.professions?.[profession.id]?.level || 1)
    );

    if (upgradedProfession) {
      setActionNotice({
        title: `${professionNames[upgradedProfession.id]} subiu para Nv. ${upgradedProfession.level}.`,
        detail: 'Suas coletas podem render mais recursos.',
        tone: 'milestone',
        icon: <Hammer className="h-5 w-5" />,
      });
    }
  }, [gameState.character]);

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
    setActionNotice({
      title: `${item.name} equipado.`,
      tone: 'success',
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
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
    setActionNotice({
      title: `${currentEquipped.name} voltou para a bolsa.`,
      tone: 'success',
      icon: <CheckCircle2 className="h-5 w-5" />,
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
      setActionNotice({
        title: `${item.name} usada.`,
        tone: 'success',
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
    }
  };

  const handleBuyItem = (item: Item) => {
    if (gameState.character.gold < item.price) {
      setActionNotice({ title: 'Ouro insuficiente para comprar este item.' });
      return;
    }
    if (!canAddItemToInventory(item, gameState.character.inventory)) {
      setActionNotice({ title: 'Sua mochila está cheia.' });
      return;
    }
    gameState.handleBuyItem(item);
    setActionNotice({
      title: `${item.name} comprado.`,
      detail: `${item.price} ouro gasto.`,
      tone: 'success',
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  };

  const handleSellItem = (item: InventoryItem, quantity: number) => {
    gameState.handleSellItem(item, quantity);
    setActionNotice({
      title: `${item.name} vendido.`,
      detail: `${quantity} unidade${quantity > 1 ? 's' : ''} vendida${quantity > 1 ? 's' : ''}.`,
      tone: 'success',
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  };

  const handleRest = () => {
    if (gameState.character.gold < 20) {
      setActionNotice({ title: 'Você precisa de 20 ouro para descansar.' });
      return;
    }
    gameState.handleRest();
    setActionNotice({
      title: 'Descanso concluído.',
      detail: 'Vida e recursos restaurados.',
      tone: 'success',
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  };

  const handleAcceptQuest = (quest: Quest) => {
    gameState.handleAcceptQuest(quest);
    setActionNotice({
      title: `Missão aceita: ${quest.name}.`,
      detail: 'Acompanhe o progresso na cidade.',
      tone: 'success',
      icon: <ScrollText className="h-5 w-5" />,
    });
  };

  const handleClaimQuestReward = (quest: Quest) => {
    gameState.handleClaimQuestReward(quest);
    setActionNotice({
      title: `Recompensa recebida: ${quest.name}.`,
      detail: `+${quest.rewards.gold} ouro e +${quest.rewards.experience} XP.`,
      tone: 'milestone',
      icon: <Trophy className="h-5 w-5" />,
    });
  };

  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    gameState.handleCraftRecipe(recipe);
    setActionNotice({
      title: `${recipe.name} produzido.`,
      detail: 'Item adicionado à mochila.',
      tone: 'success',
      icon: <Hammer className="h-5 w-5" />,
    });
  };

  const handleUpgradeItem = (item: InventoryItem) => {
    gameState.handleUpgradeItem(item);
    setActionNotice({
      title: `${item.name} melhorado.`,
      detail: 'O poder do equipamento aumentou.',
      tone: 'milestone',
      icon: <Sparkles className="h-5 w-5" />,
    });
  };

  const handleFoundGuild = (name: string) => {
    gameState.handleFoundGuild(name);
    setActionNotice({
      title: `Guilda fundada: ${name || 'Guilda dos Fragmentos'}.`,
      detail: 'Bônus permanentes foram liberados.',
      tone: 'milestone',
      icon: <Trophy className="h-5 w-5" />,
    });
  };

  const handleUpgradeGuild = () => {
    gameState.handleUpgradeGuild();
    setActionNotice({
      title: 'Guilda evoluída.',
      detail: 'Os bônus permanentes ficaram melhores.',
      tone: 'milestone',
      icon: <Trophy className="h-5 w-5" />,
    });
  };

  const handleClaimDailyTask = (task: DailyTaskProgress) => {
    gameState.handleClaimDailyTask(task);
    setActionNotice({
      title: `Diária concluída: ${task.name}.`,
      detail: `+${task.rewards.gold} ouro e +${task.rewards.experience} XP.`,
      tone: 'milestone',
      icon: <Trophy className="h-5 w-5" />,
    });
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    gameState.updateCharacter({ tutorialSeen: true });
  };

  const handleDismissTutorial = () => {
    setShowTutorial(false);
    gameState.updateCharacter({
      tutorialSeen: true,
      tutorialDismissed: true,
    });
  };

  const shouldShowTutorial =
    showTutorial ||
    (!gameState.character.tutorialSeen && !gameState.character.tutorialDismissed);
  const now = Date.now();
  const markerStates: Record<string, MarkerState> = Object.fromEntries(
    gameState.mapLocations.map((location) => {
      if (location.type === 'gathering') {
        const node = gameState.character.gatheringNodes?.[location.id];
        const isDepleted = Boolean(node && node.remaining <= 0 && node.resetAt > now);
        return [
          location.id,
          {
            status: isDepleted ? 'cooldown' : 'ready',
            label: isDepleted ? 'Recarregando' : 'Pronto',
          },
        ];
      }

      if (location.type === 'boss_lair') {
        const isCoolingDown = Boolean(
          gameState.character.bossLairResetAt &&
            gameState.character.bossLairResetAt > now
        );
        return [
          location.id,
          {
            status: isCoolingDown ? 'cooldown' : 'ready',
            label: isCoolingDown ? 'Em recarga' : 'Disponível',
          },
        ];
      }

      if (location.type === 'enemy') {
        const region = gameState.enemyRegionStates[location.id];
        const isExhausted = Boolean(
          region && region.remaining <= 0 && region.resetAt > now
        );
        const difficulty = getDifficultyTone(
          location.level,
          gameState.character.level
        );
        if (isExhausted) {
          return [
            location.id,
            {
              status: 'cooldown',
              label: `Recarrega em ${Math.max(1, Math.ceil((region!.resetAt - now) / 60000))} min`,
            },
          ];
        }
        if (region) {
          return [
            location.id,
            {
              status: difficulty,
              label: `${region.remaining}/${region.total} inimigos`,
            },
          ];
        }
        return [
          location.id,
          {
            status: difficulty,
            label:
              difficulty === 'hard'
                ? 'Perigoso'
                : difficulty === 'easy'
                  ? 'Fácil'
                  : 'Equilibrado',
          },
        ];
      }

      return [location.id, { status: 'normal' }];
    })
  );

  return (
    <div className="app-bg">
      <div className="page-wrap space-y-5 sm:space-y-6">
        <UserProfile username={initialCharacter.name} onLogout={onLogout} onBackToSelection={onBackToSelection} />

        {actionNotice && (
          <ActionToast notice={actionNotice} />
        )}

        <div className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)] xl:gap-6 2xl:grid-cols-[430px_minmax(0,1fr)]">
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

          <main className="rpg-panel min-w-0 rounded-2xl p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">O mundo espera</div>
                <h1 className="text-2xl font-black text-stone-950 sm:text-3xl">Mapa</h1>
                <p className="text-sm font-semibold text-stone-500">
                  Escolha um destino para continuar a aventura
                </p>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="self-start rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-black text-amber-900 transition-colors hover:bg-amber-100"
              >
                Tutorial
              </button>
            </div>
            <GameMap
              locations={gameState.mapLocations}
              currentLocationId={gameState.currentLocation?.id}
              markerStates={markerStates}
              onLocationSelect={gameState.handleLocationSelect}
            />

            {gameState.currentLocation && (
              <div className="mt-6 border-t border-stone-200 pt-5">
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
                    onFoundGuild={handleFoundGuild}
                    onUpgradeGuild={handleUpgradeGuild}
                    onClaimDailyTask={handleClaimDailyTask}
                  />
                ) : gameState.currentLocation.type === 'gathering' ? (
                  <AutoGatherField
                    player={gameState.character}
                    location={gameState.currentLocation}
                    lastRewards={gameState.lastGatheringRewards}
                    nodeState={gameState.gatheringNodeState}
                    onAutoGather={gameState.handleGather}
                    onLeave={gameState.handleLeaveLocation}
                  />
                ) : gameState.currentLocation.type === 'boss_lair' && !gameState.enemy ? (
                  <BossLair
                    character={gameState.character}
                    entryCost={gameState.bossLairEntryCost}
                    canEnter={gameState.canEnterBossLair}
                    onEnter={gameState.handleEnterBossLair}
                  />
                ) : (gameState.currentLocation.type === 'enemy' ||
                    (gameState.currentLocation.type === 'boss_lair' && gameState.enemy) ||
                    (gameState.currentLocation.type === 'event' && gameState.enemy)) ? (
                  <AutoFarmField
                    player={gameState.character}
                    enemy={gameState.enemy}
                    location={gameState.currentLocation}
                    feedback={gameState.combatFeedback}
                    onAutoTurn={gameState.handleAutoCombatTurn}
                    strategy={gameState.character.autoCombatSettings?.strategy || 'balanced'}
                    onStrategyChange={gameState.handleSetAutoCombatStrategy}
                    remainingEncounters={
                      gameState.currentLocation.type === 'enemy'
                        ? gameState.enemyRegionStates[gameState.currentLocation.id]?.remaining
                        : undefined
                    }
                    totalEncounters={
                      gameState.currentLocation.type === 'enemy'
                        ? gameState.enemyRegionStates[gameState.currentLocation.id]?.total
                        : undefined
                    }
                    onLeave={gameState.handleLeaveLocation}
                  />
                ) : (
                  gameState.enemy && (
                    <Combat
                      player={gameState.character}
                      enemy={gameState.enemy}
                      onAttack={gameState.handleAttack}
                      onCastSpell={gameState.handleCastSpell}
                      onUseAbility={gameState.handleUseAbility}
                      feedback={gameState.combatFeedback}
                    />
                  )
                )}
              </div>
            )}

            {gameState.lastCombatRewards && (
              <RewardSummary reward={gameState.lastCombatRewards} />
            )}
          </main>
        </div>

        {gameState.showDeathModal && (
          <DeathModal
            characterName={gameState.character.name}
            killedBy={gameState.enemy?.name || 'um inimigo'}
            gold={gameState.character.gold}
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

        {shouldShowTutorial && (
          <TutorialModal
            character={gameState.character}
            onClose={handleCloseTutorial}
            onDismiss={handleDismissTutorial}
          />
        )}
      </div>
    </div>
  );
}

function ActionToast({ notice }: { notice: ActionNotice }) {
  const toneClasses = {
    neutral: 'border-amber-300 bg-amber-50 text-amber-900',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    milestone: 'border-amber-400 bg-gradient-to-r from-amber-50 to-white text-amber-950',
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${
        toneClasses[notice.tone || 'neutral']
      }`}
    >
      {notice.icon && (
        <div className="mt-0.5 shrink-0">
          {notice.icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="font-black">{notice.title}</div>
        {notice.detail && (
          <div className="mt-0.5 font-semibold opacity-80">{notice.detail}</div>
        )}
      </div>
    </div>
  );
}
