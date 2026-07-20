import { useState } from 'react';
import { FlaskRound, Package, Shield, ShoppingCart, Sword } from 'lucide-react';
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
import { InventoryItem, Item, Quest, SavedCharacter } from '../types/game';
import {
  canAddItemToInventory,
  getItemQuantity,
  hasMaterials,
  isEquipmentItem,
} from '../utils/inventory';
import {
  getAvailableQuests,
  isQuestReadyToClaim,
} from '../utils/questManager';
import { Inn } from './Inn';

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
}

type TownTabId = 'shop' | 'inn' | 'sell' | 'quests' | 'craft';

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
}: TownProps) {
  const [activeTab, setActiveTab] = useState<TownTabId>('shop');

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-black text-stone-950">Cidade</h2>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-lg font-bold text-amber-800">
          Ouro: {gold}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <TownTab label="Loja" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
        <TownTab label="Taverna" active={activeTab === 'inn'} onClick={() => setActiveTab('inn')} />
        <TownTab label="Missões" active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} />
        <TownTab label="Oficina" active={activeTab === 'craft'} onClick={() => setActiveTab('craft')} />
        <TownTab label="Vender" active={activeTab === 'sell'} onClick={() => setActiveTab('sell')} />
      </div>

      {activeTab === 'inn' ? (
        <Inn
          gold={gold}
          currentHealth={currentHealth}
          maxHealth={maxHealth}
          onRest={onRest}
        />
      ) : activeTab === 'sell' ? (
        <SellPanel inventory={inventory} onSellItem={onSellItem} />
      ) : activeTab === 'quests' ? (
        <QuestPanel
          character={character}
          onAcceptQuest={onAcceptQuest}
          onClaimQuestReward={onClaimQuestReward}
        />
      ) : activeTab === 'craft' ? (
        <CraftPanel
          gold={gold}
          inventory={inventory}
          onCraftRecipe={onCraftRecipe}
          onUpgradeItem={onUpgradeItem}
        />
      ) : (
        <div className="space-y-6">
          <ShopSection
            title="Armas"
            items={WEAPONS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Armaduras"
            items={ARMORS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Cabeça"
            items={HELMETS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Luvas"
            items={GLOVES}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Calças"
            items={PANTS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Botas"
            items={BOOTS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
          <ShopSection
            title="Poções"
            items={POTIONS}
            gold={gold}
            inventory={inventory}
            onBuyItem={onBuyItem}
          />
        </div>
      )}
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
      <h3 className="mb-4 text-lg font-bold text-stone-950">Seu inventário</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    <div className={`rpg-item rounded-lg ${isEquipped ? 'opacity-70' : ''}`}>
      <div className="font-bold text-stone-950">{item.name}</div>
      <div className="text-sm text-stone-600">{item.description}</div>
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
  const activeQuests = character.quests || [];
  const availableQuests = getAvailableQuests(character);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Missões ativas</h3>
        {activeQuests.length === 0 ? (
          <EmptyState text="Nenhuma missão ativa." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeQuests.map((quest) => {
              const ready = isQuestReadyToClaim(quest);
              return (
                <div key={quest.id} className="rpg-item rounded-lg">
                  <h4 className="font-black text-stone-950">{quest.name}</h4>
                  <p className="mt-1 text-sm text-stone-600">{quest.description}</p>
                  <QuestObjectives quest={quest} />
                  <RewardText quest={quest} />
                  <button
                    onClick={() => onClaimQuestReward(quest)}
                    disabled={!ready}
                    className="rpg-button-primary mt-4 w-full disabled:bg-stone-300 disabled:text-stone-500"
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {availableQuests.map((quest) => (
              <div key={quest.id} className="rpg-item rounded-lg">
                <h4 className="font-black text-stone-950">{quest.name}</h4>
                <p className="mt-1 text-sm text-stone-600">{quest.description}</p>
                <QuestObjectives quest={quest} />
                <RewardText quest={quest} />
                <button
                  onClick={() => onAcceptQuest(quest)}
                  className="rpg-button-primary mt-4 w-full"
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
  const equipmentItems = inventory.filter(
    (item) => isEquipmentItem(item)
  );

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Produzir</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {CRAFTING_RECIPES.map((recipe) => {
            const canCraft =
              gold >= recipe.goldCost &&
              hasMaterials(inventory, recipe.materials) &&
              canAddItemToInventory(recipe.result, inventory);
            return (
              <div key={recipe.id} className="rpg-item rounded-lg">
                <h4 className="font-black text-stone-950">{recipe.name}</h4>
                <p className="mt-1 text-sm text-stone-600">{recipe.description}</p>
                <MaterialList materials={recipe.materials} inventory={inventory} />
                <div className="mt-3 text-sm font-bold text-amber-700">
                  Custo: {recipe.goldCost} ouro
                </div>
                <button
                  onClick={() => onCraftRecipe(recipe)}
                  disabled={!canCraft}
                  className="rpg-button-primary mt-4 w-full disabled:bg-stone-300 disabled:text-stone-500"
                >
                  Produzir
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold text-stone-950">Melhorar equipamento</h3>
        {equipmentItems.length === 0 ? (
          <EmptyState text="Nenhum equipamento na bolsa para melhorar." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {equipmentItems.map((item) => {
              const upgradeLevel = item.upgradeLevel || 0;
              const isMaxed = upgradeLevel >= MAX_EQUIPMENT_UPGRADE;
              const cost = getEquipmentUpgradeCost(item);
              const powerGain = getEquipmentUpgradePowerGain(item);
              const canUpgrade =
                !isMaxed &&
                gold >= cost.goldCost &&
                hasMaterials(inventory, cost.materials);
              return (
                <div key={item.instanceId || item.id} className="rpg-item rounded-lg">
                  <h4 className="font-black text-stone-950">{item.name}</h4>
                  <p className="mt-1 text-sm text-stone-600">
                    {item.type === 'weapon' ? 'Poder' : 'Defesa'} atual: {item.power || 0}
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    Próximo nível: +{powerGain} {item.type === 'weapon' ? 'poder' : 'defesa'}
                  </p>
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
                    className="rpg-button-primary mt-4 w-full disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {isMaxed ? 'Melhoria máxima' : `Melhorar para +${upgradeLevel + 1}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ShopSection({
  title,
  items,
  gold,
  inventory,
  onBuyItem,
}: {
  title: string;
  items: Item[];
  gold: number;
  inventory: InventoryItem[];
  onBuyItem: (item: Item) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between border-b border-stone-200 pb-2">
        <h3 className="text-lg font-black text-stone-950">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
          {items.length} itens
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            canBuy={gold >= item.price && canAddItemToInventory(item, inventory)}
            onBuyItem={onBuyItem}
          />
        ))}
      </div>
    </section>
  );
}

function ShopItemCard({
  item,
  canBuy,
  onBuyItem,
}: {
  item: Item;
  canBuy: boolean;
  onBuyItem: (item: Item) => void;
}) {
  const statLabel =
    item.type === 'weapon'
      ? 'Poder'
      : isEquipmentItem(item)
        ? 'Defesa'
        : item.healing
          ? 'Cura'
          : item.manaRestore
            ? 'Mana'
            : item.staminaRestore
              ? 'Estamina'
              : 'Valor';
  const statValue =
    item.power || item.healing || item.manaRestore || item.staminaRestore || item.price;

  return (
    <button
      onClick={() => onBuyItem(item)}
      disabled={!canBuy}
      className="group rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-stone-200 disabled:hover:shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-700">
            <ShopItemIcon item={item} />
          </div>
          <div className="min-w-0">
            <h4 className="font-black leading-tight text-stone-950">{item.name}</h4>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-stone-500">
              {getItemTypeLabel(item)}
            </div>
          </div>
        </div>
        <div className="rounded-md bg-amber-50 px-2 py-1 text-sm font-black text-amber-800">
          {item.price}
        </div>
      </div>

      <p className="min-h-10 text-sm font-medium text-stone-600">
        {item.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="rounded-md bg-stone-100 px-2 py-1 text-xs font-black text-stone-700">
          {statLabel}: {statValue}
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black ${
            canBuy
              ? 'bg-stone-950 text-white'
              : 'bg-stone-200 text-stone-500'
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {canBuy ? 'Comprar' : 'Indispon?vel'}
        </div>
      </div>
    </button>
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
    helmet: 'Cabe?a',
    gloves: 'Luvas',
    pants: 'Cal?as',
    boots: 'Botas',
    potion: 'Po??o',
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
        const materialNames: Record<string, string> = {
          couro: 'Couro',
        };
        const resourceName =
          RESOURCE_BY_ID[material.itemId]?.name ||
          materialNames[material.itemId] ||
          material.itemId;
        return (
          <div
            key={material.itemId}
            className={`font-semibold ${
              owned >= material.quantity ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {resourceName}: {owned}/{material.quantity}
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

