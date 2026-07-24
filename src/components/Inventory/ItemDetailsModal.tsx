import { FlaskRound, Package, Shield, Sword, X } from 'lucide-react';
import { InventoryItem, Item } from '../../types/game';
import { getEquipmentSlot } from '../../utils/inventory';
import { getRarityLabel, getRarityStyles } from '../../utils/rarity';

interface ItemDetailsModalProps {
  item: Item | InventoryItem;
  onClose: () => void;
}

export function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const rarity = getRarityStyles(item);
  const quantity = 'quantity' in item ? item.quantity : 1;
  const upgradeLevel = 'upgradeLevel' in item ? item.upgradeLevel || 0 : 0;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-stone-950/75 px-4 py-6">
      <section className={`w-full max-w-md rounded-lg border bg-white shadow-2xl ${rarity.border}`}>
        <div className={`flex items-start justify-between gap-4 rounded-t-lg border-b p-4 ${rarity.surface}`}>
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-stone-800 shadow-sm">
              <ItemIcon item={item} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl font-black leading-tight ${rarity.text}`}>{item.name}</h2>
              <div className={`mt-1 inline-flex rounded px-2 py-1 text-[10px] font-black uppercase ${rarity.badge}`}>
                {getRarityLabel(item)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-white/80 p-2 text-stone-600 transition-colors hover:bg-white hover:text-stone-950"
            aria-label="Fechar detalhes do item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-sm font-semibold leading-relaxed text-stone-600">{item.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <InfoTile label="Tipo" value={getItemTypeLabel(item)} />
            <InfoTile label="Valor" value={`${item.price} ouro`} />
            {quantity > 1 && <InfoTile label="Quantidade" value={`${quantity}`} />}
            {upgradeLevel > 0 && <InfoTile label="Melhoria" value={`+${upgradeLevel}`} />}
            {item.power !== undefined && (
              <InfoTile
                label={item.type === 'weapon' ? 'Poder' : 'Defesa'}
                value={`${item.power}`}
              />
            )}
            {item.healing && <InfoTile label="Cura" value={`${item.healing}`} />}
            {item.manaRestore && <InfoTile label="Mana" value={`${item.manaRestore}`} />}
            {item.staminaRestore && <InfoTile label="Estamina" value={`${item.staminaRestore}`} />}
          </div>

          <button onClick={onClose} className="rpg-button-primary w-full">
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-stone-100 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-wide text-stone-500">{label}</div>
      <div className="text-sm font-black text-stone-950">{value}</div>
    </div>
  );
}

function ItemIcon({ item }: { item: Item | InventoryItem }) {
  if (item.type === 'weapon') return <Sword className="h-5 w-5 text-red-700" />;
  if (getEquipmentSlot(item)) return <Shield className="h-5 w-5 text-sky-700" />;
  if (item.type === 'potion') return <FlaskRound className="h-5 w-5 text-emerald-700" />;
  return <Package className="h-5 w-5 text-amber-700" />;
}

function getItemTypeLabel(item: Item | InventoryItem) {
  const labels: Record<Item['type'], string> = {
    weapon: 'Arma',
    armor: 'Peitoral',
    helmet: 'Cabeça',
    gloves: 'Luvas',
    pants: 'Calças',
    boots: 'Botas',
    potion: 'Poção',
    loot: item.resourceCategory ? 'Recurso' : 'Item',
  };
  return labels[item.type];
}
