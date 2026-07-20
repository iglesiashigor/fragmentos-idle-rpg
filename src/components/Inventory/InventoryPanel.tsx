import { ReactNode } from 'react';
import { FlaskRound as Flask, Package, Shield, Sword } from 'lucide-react';
import { Equipment, InventoryItem } from '../../types/game';
import { MAX_INVENTORY_SLOTS } from '../../utils/inventory';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  equipment: Equipment;
  currentHealth: number;
  maxHealth: number;
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slot: 'weapon' | 'armor') => void;
  onUsePotion: (item: InventoryItem) => void;
  framed?: boolean;
}

export function InventoryPanel({
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onUsePotion,
  framed = true,
}: InventoryPanelProps) {
  const bagItems = inventory;
  const emptySlots = Math.max(0, MAX_INVENTORY_SLOTS - bagItems.length);
  const isSameInventoryItem = (
    first: InventoryItem,
    second: InventoryItem
  ) =>
    first.instanceId && second.instanceId
      ? first.instanceId === second.instanceId
      : first.id === second.id;

  return (
    <div className={framed ? 'rpg-panel rounded-lg p-5' : ''}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-950">Inventário</h2>
          <p className="text-sm font-medium text-stone-500">
            Equipamentos e bolsa
          </p>
        </div>
        <div className="rounded-md bg-stone-900 px-3 py-1 text-sm font-bold text-amber-300">
          {bagItems.length}/{MAX_INVENTORY_SLOTS}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <EquipmentSlot
          title="Arma"
          icon={<Sword className="h-5 w-5" />}
          item={equipment.weapon}
          onUnequip={() => onUnequipItem('weapon')}
        />
        <EquipmentSlot
          title="Armadura"
          icon={<Shield className="h-5 w-5" />}
          item={equipment.armor}
          onUnequip={() => onUnequipItem('armor')}
        />
      </div>

      <div className="mb-3 flex items-center justify-between border-t border-stone-200 pt-4">
        <h3 className="font-black text-stone-950">Bolsa</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Itens carregados
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {bagItems.map((item) => (
          <BagSlot
            key={item.instanceId || item.id}
            item={item}
            equipped={Boolean(
              (equipment.weapon && isSameInventoryItem(equipment.weapon, item)) ||
              (equipment.armor && isSameInventoryItem(equipment.armor, item))
            )}
            onEquipItem={onEquipItem}
            onUsePotion={onUsePotion}
          />
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square rounded-md border border-dashed border-stone-300 bg-stone-100/70"
          />
        ))}
      </div>
    </div>
  );
}

function EquipmentSlot({
  title,
  icon,
  item,
  onUnequip,
}: {
  title: string;
  icon: ReactNode;
  item: Equipment['weapon'];
  onUnequip: () => void;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-600">
        {icon}
        {title}
      </div>
      {item ? (
        <div>
          <div className="font-bold text-stone-950">{item.name}</div>
          <div className="text-xs text-stone-500">
            {item.type === 'weapon' ? 'Poder' : 'Defesa'}: {item.power || 0}
          </div>
          <button
            onClick={onUnequip}
            className="mt-2 text-xs font-bold text-red-600 hover:text-red-700"
          >
            Desequipar
          </button>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center rounded border border-dashed border-stone-300 text-xs font-semibold text-stone-400">
          Vazio
        </div>
      )}
    </div>
  );
}

function BagSlot({
  item,
  equipped,
  onEquipItem,
  onUsePotion,
}: {
  item: InventoryItem;
  equipped: boolean;
  onEquipItem: (item: InventoryItem) => void;
  onUsePotion: (item: InventoryItem) => void;
}) {
  const canEquip = item.type === 'weapon' || item.type === 'armor';
  const canUse = item.type === 'potion';

  return (
    <div
      className={`group relative aspect-square rounded-md border bg-white p-2 shadow-sm transition-colors ${
        equipped
          ? 'border-amber-500 ring-2 ring-amber-300'
          : 'border-stone-200 hover:border-amber-300'
      }`}
      title={item.description}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <ItemIcon item={item} />
          {item.quantity > 1 && (
            <span className="rounded bg-stone-900 px-1.5 py-0.5 text-xs font-bold text-white">
              {item.quantity}
            </span>
          )}
        </div>
        <div>
          <div className="line-clamp-2 text-xs font-bold leading-tight text-stone-950">
            {item.name}
          </div>
          <div className="text-[11px] font-semibold text-stone-500">
            {item.type === 'weapon' && `Poder ${item.power || 0}`}
            {item.type === 'armor' && `Defesa ${item.power || 0}`}
            {item.type === 'potion' && 'Poção'}
            {item.type === 'loot' &&
              (item.resourceCategory ? 'Recurso' : `${item.price} ouro`)}
          </div>
        </div>
      </div>

      {(canEquip || canUse) && (
        <div className="absolute inset-x-1 bottom-1 hidden gap-1 group-hover:flex">
          {canEquip && (
            <button
              onClick={() => onEquipItem(item)}
              disabled={equipped}
              className="flex-1 rounded bg-amber-600 px-1 py-1 text-[11px] font-bold text-white hover:bg-amber-700 disabled:bg-stone-400"
            >
              {equipped ? 'Equipado' : 'Equipar'}
            </button>
          )}
          {canUse && (
            <button
              onClick={() => onUsePotion(item)}
              className="flex-1 rounded bg-emerald-600 px-1 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              Usar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ItemIcon({ item }: { item: InventoryItem }) {
  const iconClass = 'h-6 w-6';

  if (item.type === 'weapon') {
    return <Sword className={`${iconClass} text-red-700`} />;
  }
  if (item.type === 'armor') {
    return <Shield className={`${iconClass} text-sky-700`} />;
  }
  if (item.type === 'potion') {
    return <Flask className={`${iconClass} text-emerald-700`} />;
  }
  return <Package className={`${iconClass} text-amber-700`} />;
}
