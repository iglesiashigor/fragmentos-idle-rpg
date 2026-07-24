import { useState } from 'react';
import { FlaskRound, Info, Package, Shield, ShoppingCart, Sword } from 'lucide-react';
import { ARMORS, BOOTS, GLOVES, HELMETS, PANTS, POTIONS, WEAPONS } from '../data/items';
import {
  CRAFTING_RECIPES,
  CraftingRecipe,
  getEquipmentUpgradeCost,
  getEquipmentUpgradePowerGain,
  MAX_EQUIPMENT_UPGRADE,
  MaterialCost,
} from '../data/recipes';
import { RESOURCE_BY_ID } from '../data/resources';
import {
  DailyTaskProgress,
  InventoryItem,
  Item,
  Quest,
  SavedCharacter,
} from '../types/game';
import {
  canAddItemToInventory,
  getBagItems,
  getEquipmentSlot,
  getItemQuantity,
  getInventorySlotCount,
  hasMaterials,
  isEquipmentItem,
  MAX_INVENTORY_SLOTS,
} from '../utils/inventory';
import {
  getAvailableQuests,
  isQuestReadyToClaim,
} from '../utils/questManager';
import { Inn } from './Inn';
import { getRarityLabel, getRarityStyles } from '../utils/rarity';
import {
  getGuildBonusSummary,
  getGuildUpgradeCost,
  GUILD_FOUNDATION_COST,
  MAX_GUILD_LEVEL,
} from '../data/guild';
import { ItemDetailsModal } from './Inventory/ItemDetailsModal';

interface TownProps {
  character: SavedCharacter;
  gold: number;
  inventory: InventoryItem[];
  currentHealth: number;
  maxHealth: number;
  onBuyItem: (item: Item) => void;
  onSellItem: (item: InventoryItem, quantity: number) => void;
  onRest: () => void;
  onAcceptQuest: (quest: Quest) => void;
  onClaimQuestReward: (quest: Quest) => void;
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  onUpgradeItem: (item: InventoryItem) => void;
  onFoundGuild: (name: string) => void;
  onUpgradeGuild: () => void;
  onClaimDailyTask: (task: DailyTaskProgress) => void;
}

type TownTabId = 'shop' | 'inn' | 'sell' | 'quests' | 'daily' | 'craft' | 'guild';
type ShopCategoryId = 'weapons' | 'armor' | 'accessories' | 'potions';
type CraftTabId = 'crafting' | 'upgrades';

const SHOP_CATEGORIES: {
  id: ShopCategoryId;
  label: string;
  title: string;
  items: Item[];
}[] = [
  { id: 'weapons', label: 'Armas', title: 'Armas', items: WEAPONS },
  { id: 'armor', label: 'Armaduras', title: 'Armaduras', items: ARMORS },
  {
    id: 'accessories',
    label: 'Peças',
    title: 'Peças de Equipamento',
    items: [...HELMETS, ...GLOVES, ...PANTS, ...BOOTS],
  },
  { id: 'potions', label: 'Poções', title: 'Poções', items: POTIONS },
];

export function Town({
  character,
  gold,
  inventory,
  currentHealth,
  maxHealth,
  onBuyItem,
  onSellItem,
  onRest,
  onAcceptQuest,
  onClaimQuestReward,
  onCraftRecipe,
  onUpgradeItem,
  onFoundGuild,
  onUpgradeGuild,
  onClaimDailyTask,
}: TownProps) {
  const [activeTab, setActiveTab] = useState<TownTabId>('shop');
  const [activeShopCategory, setActiveShopCategory] = useState<ShopCategoryId>('weapons');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const activeShop = SHOP_CATEGORIES.find((category) => category.id === activeShopCategory) || SHOP_CATEGORIES[0];

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-black text-stone-950">Cidade</h2>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-lg font-bold text-amber-800">
          Ouro: {gold}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <TownTab label="Loja" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
        <TownTab label="Taverna" active={activeTab === 'inn'} onClick={() => setActiveTab('inn')} />
        <TownTab label="Missões" active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} />
        <TownTab label="Diárias" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} />
        <TownTab label="Oficina" active={activeTab === 'craft'} onClick={() => setActiveTab('craft')} />
        <TownTab label="Guilda" active={activeTab === 'guild'} onClick={() => setActiveTab('guild')} />
        <TownTab label="Vender" active={activeTab === 'sell'} onClick={() => setActiveTab('sell')} />
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {activeTab === 'inn' ? (
          <Inn
            gold={gold}
            currentHealth={currentHealth}
            maxHealth={maxHealth}
            onRest={onRest}
          />
        ) : activeTab === 'sell' ? (
          <SellPanel inventory={getBagItems(inventory)} onSellItem={onSellItem} />
        ) : activeTab === 'quests' ? (
          <QuestPanel
            character={character}
            onAcceptQuest={onAcceptQuest}
            onClaimQuestReward={onClaimQuestReward}
          />
        ) : activeTab === 'daily' ? (
          <DailyPanel
            tasks={character.dailyTasks || []}
            resetAt={character.dailyTasksResetAt || 0}
            onClaimDailyTask={onClaimDailyTask}
          />
        ) : activeTab === 'craft' ? (
          <CraftPanel
            gold={gold}
            inventory={inventory}
            onCraftRecipe={onCraftRecipe}
            onUpgradeItem={onUpgradeItem}
          />
        ) : activeTab === 'guild' ? (
          <GuildPanel
            character={character}
            gold={gold}
            inventory={inventory}
            onFoundGuild={onFoundGuild}
            onUpgradeGuild={onUpgradeGuild}
          />
        ) : (
          <div>
            <div className="sticky top-0 z-10 mb-4 flex gap-2 overflow-x-auto border-b border-stone-200 bg-white pb-3">
              {SHOP_CATEGORIES.map((category) => (
                <TownTab
                  key={category.id}
                  label={category.label}
                  active={activeShopCategory === category.id}
                  onClick={() => setActiveShopCategory(category.id)}
                />
              ))}
            </div>
            <ShopSection
              title={activeShop.title}
              items={activeShop.items}
              gold={gold}
              inventory={inventory}
              onBuyItem={onBuyItem}
              onShowDetails={setSelectedItem}
            />
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function GuildPanel({
  character,
  gold,
  inventory,
  onFoundGuild,
  onUpgradeGuild,
}: {
  character: SavedCharacter;
  gold: number;
  inventory: InventoryItem[];
  onFoundGuild: (name: string) => void;
  onUpgradeGuild: () => void;
}) {
  const [guildName, setGuildName] = useState('Guilda dos Fragmentos');
  const guild = character.guild;
  const cost = guild ? getGuildUpgradeCost(guild.level) : GUILD_FOUNDATION_COST;
  const isMaxLevel = Boolean(guild && guild.level >= MAX_GUILD_LEVEL);
  const canPay =
    gold >= cost.goldCost &&
    hasMaterials(inventory, cost.materials) &&
    !isMaxLevel;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-amber-700">
          Guilda
        </div>
        <h3 className="mt-1 text-2xl font-black text-stone-950">
          {guild?.name || 'Fundar uma Guilda'}
        </h3>
        <p className="mt-1 text-sm font-semibold text-stone-600">
          Invista ouro e materiais para liberar bônus permanentes para o personagem.
        </p>
      </div>

      {guild ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rpg-item rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-stone-950">Nível da Guilda</h4>
              <span className="rounded-md bg-stone-950 px-3 py-1 text-sm font-black text-white">
                Nv. {guild.level}/{MAX_GUILD_LEVEL}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {getGuildBonusSummary(guild).map((bonus) => (
                <div key={bonus} className="rounded-md bg-white px-3 py-2 text-sm font-bold text-emerald-700">
                  {bonus}
                </div>
              ))}
            </div>
          </div>

          <GuildCostCard
            title={isMaxLevel ? 'Nível máximo alcançado' : `Evoluir para Nv. ${guild.level + 1}`}
            gold={gold}
            inventory={inventory}
            cost={cost}
            buttonLabel={isMaxLevel ? 'Máximo' : 'Evoluir Guilda'}
            disabled={!canPay}
            onClick={onUpgradeGuild}
          />
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rpg-item rounded-lg">
            <label className="text-sm font-black text-stone-700">
              Nome da Guilda
            </label>
            <input
              value={guildName}
              onChange={(event) => setGuildName(event.target.value)}
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 font-semibold"
              maxLength={32}
            />
            <div className="mt-4 space-y-2">
              {getGuildBonusSummary().map((bonus) => (
                <div key={bonus} className="rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-600">
                  {bonus}
                </div>
              ))}
            </div>
          </div>

          <GuildCostCard
            title="Custo de fundação"
            gold={gold}
            inventory={inventory}
            cost={GUILD_FOUNDATION_COST}
            buttonLabel="Fundar Guilda"
            disabled={!canPay}
            onClick={() => onFoundGuild(guildName)}
          />
        </div>
      )}
    </div>
  );
}

function DailyPanel({
  tasks,
  resetAt,
  onClaimDailyTask,
}: {
  tasks: DailyTaskProgress[];
  resetAt: number;
  onClaimDailyTask: (task: DailyTaskProgress) => void;
}) {
  const resetHours = resetAt
    ? Math.max(1, Math.ceil((resetAt - Date.now()) / (60 * 60 * 1000)))
    : 24;
  const completedCount = tasks.filter(
    (task) => task.current >= task.target
  ).length;

  return (
    <div>
      <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-stone-950">Tarefas diárias</h3>
            <p className="text-sm font-semibold text-stone-600">
              Pequenos objetivos para guiar a sessão e ganhar recompensas extras.
            </p>
          </div>
          <span className="rounded-md bg-sky-700 px-3 py-1 text-sm font-black text-white">
            Reseta em {resetHours}h
          </span>
        </div>
        <div className="mt-3 text-sm font-black text-sky-800">
          {completedCount}/{tasks.length} completas
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState text="As tarefas diárias serão criadas ao recarregar o personagem." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {tasks.map((task) => {
            const ready = task.current >= task.target;
            const progress = Math.min(100, (task.current / task.target) * 100);

            return (
              <div
                key={task.id}
                className={`rounded-lg border p-3 ${
                  task.claimed
                    ? 'border-stone-200 bg-stone-100 opacity-75'
                    : ready
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-stone-950">{task.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-stone-600">
                      {task.description}
                    </p>
                  </div>
                  {ready && !task.claimed && (
                    <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-black text-white">
                      Pronta
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-black uppercase text-stone-500">
                    <span>Progresso</span>
                    <span>{Math.min(task.current, task.target)}/{task.target}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-sky-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-black text-amber-700">
                  +{task.rewards.gold} ouro | +{task.rewards.experience} XP
                </div>

                <button
                  onClick={() => onClaimDailyTask(task)}
                  disabled={!ready || task.claimed}
                  className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
                >
                  {task.claimed ? 'Recebida' : ready ? 'Receber' : 'Em andamento'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuildCostCard({
  title,
  gold,
  inventory,
  cost,
  buttonLabel,
  disabled,
  onClick,
}: {
  title: string;
  gold: number;
  inventory: InventoryItem[];
  cost: { goldCost: number; materials: MaterialCost[] };
  buttonLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="rpg-item rounded-lg p-3">
      <h4 className="font-black text-stone-950">{title}</h4>
      <div className={`mt-3 text-sm font-black ${gold >= cost.goldCost ? 'text-emerald-700' : 'text-red-600'}`}>
        Ouro: {gold}/{cost.goldCost}
      </div>
      <MaterialList materials={cost.materials} inventory={inventory} />
      <button
        onClick={onClick}
        disabled={disabled}
        className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function TownTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 font-semibold transition-colors ${
        active
          ? 'bg-amber-600 text-white'
          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
      }`}
    >
      {label}
    </button>
  );
}

function SellPanel({
  inventory,
  onSellItem,
}: {
  inventory: InventoryItem[];
  onSellItem: (item: InventoryItem, quantity: number) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-950">Itens na bolsa</h3>
          <p className="text-sm font-semibold text-stone-500">
            Equipamentos vestidos não aparecem aqui e não podem ser vendidos.
          </p>
        </div>
        <span className="rounded-md bg-stone-900 px-3 py-1 text-sm font-black text-amber-300">
          {getInventorySlotCount(inventory)}/{MAX_INVENTORY_SLOTS}
        </span>
      </div>
      {inventory.length === 0 && (
        <EmptyState text="Sua bolsa está vazia." />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {inventory.map((item) => (
          <SellItemCard
            key={item.instanceId || item.id}
            item={item}
            onSellItem={onSellItem}
          />
        ))}
      </div>
    </div>
  );
}

function SellItemCard({
  item,
  onSellItem,
}: {
  item: InventoryItem;
  onSellItem: (item: InventoryItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const isEquipped = Boolean(item.equipped);
  const selectedQuantity = Math.min(item.quantity, quantity);
  const sellPrice = Math.floor(item.price * 0.7) * selectedQuantity;

  return (
    <div className={`rpg-item rounded-lg p-3 ${isEquipped ? 'opacity-70' : ''}`}>
      <div className="font-bold text-stone-950">{item.name}</div>
      <div className="mt-2 text-sm text-stone-500">
        Quantidade: {item.quantity}
      </div>
      {isEquipped ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm font-bold text-amber-800">
          Item equipado não pode ser vendido.
        </div>
      ) : (
        <>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-stone-500">
            Quantidade para vender
          </label>
          <input
            type="number"
            min={1}
            max={item.quantity}
            value={selectedQuantity}
            onChange={(event) => {
              const value = Number(event.target.value);
              setQuantity(Math.max(1, Math.min(item.quantity, value || 1)));
            }}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 font-semibold"
          />
          <button
            onClick={() => onSellItem(item, selectedQuantity)}
            className="rpg-button-primary mt-3 w-full"
          >
            Vender por {sellPrice} ouro
          </button>
        </>
      )}
    </div>
  );
}


function QuestPanel({
  character,
  onAcceptQuest,
  onClaimQuestReward,
}: {
  character: SavedCharacter;
  onAcceptQuest: (quest: Quest) => void;
  onClaimQuestReward: (quest: Quest) => void;
}) {
  const activeQuests = [...(character.quests || [])].sort((first, second) =>
    Number(isQuestReadyToClaim(second)) - Number(isQuestReadyToClaim(first))
  );
  const availableQuests = getAvailableQuests(character);
  const readyCount = activeQuests.filter(isQuestReadyToClaim).length;

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-950">Missões ativas</h3>
          {readyCount > 0 && (
            <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700">
              {readyCount} pronta{readyCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {activeQuests.length === 0 ? (
          <EmptyState text="Nenhuma missão ativa." />
        ) : (
          <div className="space-y-2">
            {activeQuests.map((quest) => {
              const ready = isQuestReadyToClaim(quest);
              return (
                <div
                  key={quest.id}
                  className={`rounded-lg border p-3 ${
                    ready ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-black text-stone-950">{quest.name}</h4>
                    {ready && (
                      <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-black text-white">
                        Pronta
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">{quest.description}</p>
                  <QuestObjectives quest={quest} />
                  <RewardText quest={quest} />
                  <button
                    onClick={() => onClaimQuestReward(quest)}
                    disabled={!ready}
                    className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {ready ? 'Receber recompensa' : 'Em andamento'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Novas missões</h3>
        {availableQuests.length === 0 ? (
          <EmptyState text="Nenhuma missão nova disponível agora." />
        ) : (
          <div className="space-y-2">
            {availableQuests.map((quest) => (
              <div key={quest.id} className="rpg-item rounded-lg p-3">
                <h4 className="font-black text-stone-950">{quest.name}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-stone-600">{quest.description}</p>
                <QuestObjectives quest={quest} />
                <RewardText quest={quest} />
                <button
                  onClick={() => onAcceptQuest(quest)}
                  className="rpg-button-primary mt-3 w-full"
                >
                  Aceitar missão
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


function CraftPanel({
  gold,
  inventory,
  onCraftRecipe,
  onUpgradeItem,
}: {
  gold: number;
  inventory: InventoryItem[];
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  onUpgradeItem: (item: InventoryItem) => void;
}) {
  const [activeCraftTab, setActiveCraftTab] = useState<CraftTabId>('crafting');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const equipmentItems = inventory.filter(
    (item) => isEquipmentItem(item)
  );
  const canCraftRecipe = (recipe: CraftingRecipe) =>
    gold >= recipe.goldCost &&
    hasMaterials(inventory, recipe.materials) &&
    canAddItemToInventory(recipe.result, inventory);
  const visibleRecipes = CRAFTING_RECIPES
    .filter((recipe) => !showOnlyAvailable || canCraftRecipe(recipe))
    .sort((first, second) => Number(canCraftRecipe(second)) - Number(canCraftRecipe(first)));
  const canUpgradeItem = (item: InventoryItem) => {
    const upgradeLevel = item.upgradeLevel || 0;
    if (upgradeLevel >= MAX_EQUIPMENT_UPGRADE) return false;
    const cost = getEquipmentUpgradeCost(item);
    return gold >= cost.goldCost && hasMaterials(inventory, cost.materials);
  };
  const visibleEquipmentItems = equipmentItems
    .filter((item) => !showOnlyAvailable || canUpgradeItem(item))
    .sort((first, second) => Number(canUpgradeItem(second)) - Number(canUpgradeItem(first)));

  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap gap-2 border-b border-stone-200 bg-white pb-3">
        <TownTab
          label="Produzir"
          active={activeCraftTab === 'crafting'}
          onClick={() => setActiveCraftTab('crafting')}
        />
        <TownTab
          label="Melhorar"
          active={activeCraftTab === 'upgrades'}
          onClick={() => setActiveCraftTab('upgrades')}
        />
        <button
          onClick={() => setShowOnlyAvailable((value) => !value)}
          className={`rounded-md px-4 py-2 font-semibold transition-colors ${
            showOnlyAvailable
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }`}
        >
          Possíveis agora
        </button>
      </div>

      {activeCraftTab === 'crafting' ? (
      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Produzir</h3>
        {visibleRecipes.length === 0 ? (
          <EmptyState text="Nenhuma receita pode ser produzida agora." />
        ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleRecipes.map((recipe) => {
            const canCraft = canCraftRecipe(recipe);
            return (
              <div key={recipe.id} className="rpg-item rounded-lg p-3">
                <ItemTitle item={recipe.result} name={recipe.name} />
                <p className="mt-1 text-sm text-stone-600">{recipe.description}</p>
                <ActionPreview
                  items={[
                    `Gasta ${recipe.goldCost} ouro`,
                    canAddItemToInventory(recipe.result, inventory)
                      ? 'Mochila comporta o item'
                      : 'Mochila cheia',
                    `Cria ${recipe.quantity}x ${recipe.result.name}`,
                  ]}
                />
                <MaterialList materials={recipe.materials} inventory={inventory} />
                <div className="mt-3 text-sm font-bold text-amber-700">
                  Custo: {recipe.goldCost} ouro
                </div>
                <button
                  onClick={() => onCraftRecipe(recipe)}
                  disabled={!canCraft}
                  className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
                >
                  Produzir
                </button>
              </div>
            );
          })}
        </div>
        )}
      </section>
      ) : (
      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Melhorar equipamento</h3>
        {visibleEquipmentItems.length === 0 ? (
          <EmptyState text={showOnlyAvailable ? 'Nenhum equipamento pode ser melhorado agora.' : 'Nenhum equipamento disponível para melhorar.'} />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleEquipmentItems.map((item) => {
              const upgradeLevel = item.upgradeLevel || 0;
              const isMaxed = upgradeLevel >= MAX_EQUIPMENT_UPGRADE;
              const cost = getEquipmentUpgradeCost(item);
              const powerGain = getEquipmentUpgradePowerGain(item);
              const canUpgrade = canUpgradeItem(item);
              return (
                <div key={item.instanceId || item.id} className="rpg-item rounded-lg p-3">
                  <h4 className="font-black text-stone-950">{item.name}</h4>
                  <p className="mt-1 text-sm text-stone-600">
                    {item.type === 'weapon' ? 'Poder' : 'Defesa'} atual: {item.power || 0}
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    Próximo nível: +{powerGain} {item.type === 'weapon' ? 'poder' : 'defesa'}
                  </p>
                  <ActionPreview
                    items={[
                      `Gasta ${cost.goldCost} ouro`,
                      `Mantém no slot ${getItemTypeLabel(item)}`,
                      isMaxed ? 'Melhoria máxima' : `Vai para +${upgradeLevel + 1}`,
                    ]}
                  />
                  {!isMaxed && (
                    <>
                      <MaterialList materials={cost.materials} inventory={inventory} />
                      <div className="mt-3 text-sm font-bold text-amber-700">
                        Custo: {cost.goldCost} ouro
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => onUpgradeItem(item)}
                    disabled={!canUpgrade}
                    className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {isMaxed ? 'Melhoria máxima' : `Melhorar para +${upgradeLevel + 1}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function ShopSection({
  title,
  items,
  gold,
  inventory,
  onBuyItem,
  onShowDetails,
}: {
  title: string;
  items: Item[];
  gold: number;
  inventory: InventoryItem[];
  onBuyItem: (item: Item) => void;
  onShowDetails: (item: Item) => void;
}) {
  const sortedItems = [...items].sort(
    (first, second) =>
      Number(gold >= second.price && canAddItemToInventory(second, inventory)) -
      Number(gold >= first.price && canAddItemToInventory(first, inventory))
  );
  const buyableCount = sortedItems.filter(
    (item) => gold >= item.price && canAddItemToInventory(item, inventory)
  ).length;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between border-b border-stone-200 pb-2">
        <h3 className="text-lg font-black text-stone-950">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
          {buyableCount}/{items.length} possíveis
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {sortedItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
            onShowDetails={onShowDetails}
          />
        ))}
      </div>
    </section>
  );
}

function ShopItemCard({
  item,
  gold,
  inventory,
  onBuyItem,
  onShowDetails,
}: {
  item: Item;
  gold: number;
  inventory: InventoryItem[];
  onBuyItem: (item: Item) => void;
  onShowDetails: (item: Item) => void;
}) {
  const canBuy = gold >= item.price && canAddItemToInventory(item, inventory);
  const disabledReason =
    gold < item.price
      ? 'Ouro insuficiente'
      : !canAddItemToInventory(item, inventory)
        ? 'Mochila cheia'
        : null;
  const rarity = getRarityStyles(item);
  const slot = getEquipmentSlot(item);

  return (
    <div
      className={`group rounded-lg border p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md ${rarity.border} ${rarity.surface}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-700">
            <ShopItemIcon item={item} />
          </div>
          <div className="min-w-0">
            <h4 className={`font-black leading-tight ${rarity.text}`}>{item.name}</h4>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-stone-500">
              {getItemTypeLabel(item)}
            </div>
          </div>
        </div>
        <button
          onClick={() => onShowDetails(item)}
          className="rounded-full bg-white/90 p-1.5 text-stone-500 shadow-sm hover:bg-amber-100 hover:text-amber-700"
          aria-label={`Ver detalhes de ${item.name}`}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="rounded-md bg-amber-50 px-2 py-1 text-sm font-black text-amber-800">
          {item.price} ouro
        </div>
        <button
          onClick={() => onBuyItem(item)}
          disabled={!canBuy}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-black ${
            canBuy
              ? 'bg-stone-950 text-white'
              : 'bg-stone-200 text-stone-500'
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {canBuy ? 'Comprar' : disabledReason}
        </button>
      </div>
      <ActionPreview
        items={[
          `Gasta ${item.price} ouro`,
          slot ? `Equipa em ${getItemTypeLabel(item)}` : 'Vai para a mochila',
          canAddItemToInventory(item, inventory) ? 'Espaço disponível' : 'Mochila cheia',
        ]}
      />
    </div>
  );
}

function ActionPreview({ items }: { items: string[] }) {
  return (
    <div className="mt-2 grid gap-1 text-[11px] font-bold text-stone-500">
      {items.map((item) => (
        <div key={item} className="rounded bg-stone-100 px-2 py-1">
          {item}
        </div>
      ))}
    </div>
  );
}

function ItemTitle({ item, name }: { item: Item; name: string }) {
  const rarity = getRarityStyles(item);
  return (
    <div>
      <h4 className={`font-black ${rarity.text}`}>{name}</h4>
      <div className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${rarity.badge}`}>
        {getRarityLabel(item)}
      </div>
    </div>
  );
}

function ShopItemIcon({ item }: { item: Item }) {
  if (item.type === 'weapon') {
    return <Sword className="h-5 w-5" />;
  }
  if (isEquipmentItem(item)) {
    return <Shield className="h-5 w-5" />;
  }
  if (item.type === 'potion') {
    return <FlaskRound className="h-5 w-5" />;
  }
  return <Package className="h-5 w-5" />;
}

function getItemTypeLabel(item: Item) {
  const labels: Record<Item['type'], string> = {
    weapon: 'Arma',
    armor: 'Peitoral',
    helmet: 'Cabeça',
    gloves: 'Luvas',
    pants: 'Calças',
    boots: 'Botas',
    potion: 'Poção',
    loot: 'Item',
  };
  return labels[item.type];
}

function QuestObjectives({ quest }: { quest: Quest }) {
  return (
    <div className="mt-3 space-y-2">
      {quest.objectives.map((objective) => (
        <div key={objective.target}>
          <div className="mb-1 flex justify-between text-xs font-bold text-stone-600">
            <span>{objective.label || objective.target}</span>
            <span>
              {Math.min(objective.current, objective.amount)}/{objective.amount}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{
                width: `${Math.min(100, (objective.current / objective.amount) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardText({ quest }: { quest: Quest }) {
  return (
    <div className="mt-3 text-sm font-bold text-amber-700">
      Recompensa: {quest.rewards.gold} ouro, {quest.rewards.experience} EXP
    </div>
  );
}

function MaterialList({
  materials,
  inventory,
}: {
  materials: MaterialCost[];
  inventory: InventoryItem[];
}) {
  return (
    <div className="mt-3 space-y-1 text-sm">
      {materials.map((material) => {
        const owned = getItemQuantity(inventory, material.itemId);
        const progress = Math.min(100, (owned / material.quantity) * 100);
        const hasEnough = owned >= material.quantity;
        const materialNames: Record<string, string> = {
          couro: 'Couro',
        };
        const resourceName =
          RESOURCE_BY_ID[material.itemId]?.name ||
          materialNames[material.itemId] ||
          material.itemId;
        return (
          <div key={material.itemId}>
            <div
              className={`mb-1 flex justify-between font-semibold ${
                hasEnough ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              <span>{resourceName}</span>
              <span>{owned}/{material.quantity}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full ${hasEnough ? 'bg-emerald-600' : 'bg-red-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm font-semibold text-stone-500">
      {text}
    </div>
  );
}

