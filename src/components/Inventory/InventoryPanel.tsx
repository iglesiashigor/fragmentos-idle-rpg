import { ReactNode, useState } from 'react';
import { FlaskRound as Flask, Info, Package, Shield, Sword } from 'lucide-react';
import { Equipment, InventoryItem } from '../../types/game';
import {
  EQUIPMENT_SLOTS,
  EquipmentSlotId,
  getBagItems,
  getEquipmentSlot,
  isEquipmentItem,
  MAX_INVENTORY_SLOTS,
} from '../../utils/inventory';
import { getRarityStyles } from '../../utils/rarity';
import { ItemDetailsModal } from './ItemDetailsModal';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  equipment: Equipment;
  currentHealth: number;
  maxHealth: number;
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slot: EquipmentSlotId) => void;
  onUsePotion: (item: InventoryItem) => void;
  notice?: string | null;
  framed?: boolean;
}

const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlotId, string> = {
  weapon: 'Arma',
  helmet: 'Cabeça',
  armor: 'Peitoral',
  gloves: 'Luvas',
  pants: 'Calças',
  boots: 'Botas',
};

export function InventoryPanel({
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onUsePotion,
  notice,
  framed = true,
}: InventoryPanelProps) {
  const bagItems = getBagItems(inventory);
  const emptySlots = Math.max(0, MAX_INVENTORY_SLOTS - bagItems.length);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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

      {notice && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          {notice}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3">
        {EQUIPMENT_SLOTS.map((slot) => (
          <EquipmentSlot
            key={slot}
            title={EQUIPMENT_SLOT_LABELS[slot]}
            icon={slot === 'weapon' ? <Sword className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            item={equipment[slot] || null}
            onUnequip={() => onUnequipItem(slot)}
            onShowDetails={setSelectedItem}
          />
        ))}
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
            equipped={false}
            onEquipItem={onEquipItem}
            onUsePotion={onUsePotion}
            onShowDetails={setSelectedItem}
          />
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square rounded-md border border-dashed border-stone-300 bg-stone-100/70"
          />
        ))}
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

function EquipmentSlot({
  title,
  icon,
  item,
  onUnequip,
  onShowDetails,
}: {
  title: string;
  icon: ReactNode;
  item: InventoryItem | null;
  onUnequip: () => void;
  onShowDetails: (item: InventoryItem) => void;
}) {
  const rarity = item ? getRarityStyles(item) : null;

  return (
    <div className={`rounded-md border p-3 ${rarity ? `${rarity.border} ${rarity.surface}` : 'border-stone-200 bg-white'}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-600">
        {icon}
        {title}
      </div>
      {item ? (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className={`font-bold ${rarity?.text || 'text-stone-950'}`}>{item.name}</div>
            <button
              onClick={() => onShowDetails(item)}
              className="rounded-full bg-stone-100 p-1 text-stone-500 hover:bg-amber-100 hover:text-amber-700"
              aria-label={`Ver detalhes de ${item.name}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
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
  onShowDetails,
}: {
  item: InventoryItem;
  equipped: boolean;
  onEquipItem: (item: InventoryItem) => void;
  onUsePotion: (item: InventoryItem) => void;
  onShowDetails: (item: InventoryItem) => void;
}) {
  const canEquip = isEquipmentItem(item);
  const canUse = item.type === 'potion';
  const rarity = getRarityStyles(item);

  return (
    <div
      className={`group relative aspect-square rounded-md border p-2 shadow-sm transition-colors ${rarity.surface} ${
        equipped
          ? 'border-amber-500 ring-2 ring-amber-300'
          : `${rarity.border} hover:border-amber-300`
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <ItemIcon item={item} />
          <div className="flex items-center gap-1">
            {item.quantity > 1 && (
              <span className="rounded bg-stone-900 px-1.5 py-0.5 text-xs font-bold text-white">
                {item.quantity}
              </span>
            )}
            <button
              onClick={() => onShowDetails(item)}
              className="rounded-full bg-white/90 p-1 text-stone-500 shadow-sm hover:bg-amber-100 hover:text-amber-700"
              aria-label={`Ver detalhes de ${item.name}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div>
          <div className={`line-clamp-2 text-xs font-bold leading-tight ${rarity.text}`}>
            {item.name}
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
  if (getEquipmentSlot(item)) {
    return <Shield className={`${iconClass} text-sky-700`} />;
  }
  if (item.type === 'potion') {
    return <Flask className={`${iconClass} text-emerald-700`} />;
  }
  return <Package className={`${iconClass} text-amber-700`} />;
}
