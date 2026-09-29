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
  view: 'equipment' | 'inventory';
  inventory: InventoryItem[];
  equipment: Equipment;
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slot: EquipmentSlotId) => void;
  onUsePotion: (item: InventoryItem) => void;
  notice?: string | null;
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
  view,
  inventory,
  equipment,
  onEquipItem,
  onUnequipItem,
  onUsePotion,
  notice,
}: InventoryPanelProps) {
  const bagItems = getBagItems(inventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-950">{view === 'equipment' ? 'Equipamentos' : 'Inventário'}</h2>
          <p className="text-sm font-medium text-stone-500">
            {view === 'equipment' ? 'Itens em uso pelo personagem.' : 'Itens carregados na bolsa.'}
          </p>
        </div>
        {view === 'inventory' && (
          <div className="shrink-0 rounded-md bg-stone-900 px-3 py-1 text-sm font-bold text-amber-300" aria-label={`${bagItems.length} de ${MAX_INVENTORY_SLOTS} espaços ocupados`}>
            {bagItems.length}/{MAX_INVENTORY_SLOTS}
          </div>
        )}
      </div>

      {notice && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          {notice}
        </div>
      )}

      {view === 'equipment' ? (
        <div className="grid grid-cols-2 gap-3">
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
      ) : (
        bagItems.length === 0 ? (
          <p className="rounded-md border border-dashed border-stone-300 bg-white p-4 text-sm font-semibold text-stone-500">A bolsa está vazia.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {bagItems.map((item) => (
              <BagSlot
                key={item.instanceId || item.id}
                item={item}
                onEquipItem={onEquipItem}
                onUsePotion={onUsePotion}
                onShowDetails={setSelectedItem}
              />
            ))}
          </div>
        )
      )}

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
  onEquipItem,
  onUsePotion,
  onShowDetails,
}: {
  item: InventoryItem;
  onEquipItem: (item: InventoryItem) => void;
  onUsePotion: (item: InventoryItem) => void;
  onShowDetails: (item: InventoryItem) => void;
}) {
  const canEquip = isEquipmentItem(item);
  const canUse = item.type === 'potion';
  const rarity = getRarityStyles(item);

  return (
    <div
      className={`flex min-h-28 flex-col rounded-md border p-2 shadow-sm transition-colors ${rarity.surface} ${rarity.border} hover:border-amber-300`}
    >
      <div className="flex flex-1 flex-col justify-between">
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
        <div className="mt-2 flex gap-1">
          {canEquip && (
            <button
              onClick={() => onEquipItem(item)}
              className="min-h-8 flex-1 rounded bg-amber-600 px-1 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
            >
              Equipar
            </button>
          )}
          {canUse && (
            <button
              onClick={() => onUsePotion(item)}
              className="min-h-8 flex-1 rounded bg-emerald-600 px-1 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
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
