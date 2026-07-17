import { useState } from 'react';
import { ARMORS, POTIONS, WEAPONS } from '../data/items';
import { InventoryItem, Item } from '../types/game';
import { Inn } from './Inn';

interface TownProps {
  gold: number;
  inventory: InventoryItem[];
  currentHealth: number;
  maxHealth: number;
  onBuyItem: (item: Item) => void;
  onSellItem: (item: InventoryItem) => void;
  onRest: () => void;
}

export function Town({
  gold,
  inventory,
  currentHealth,
  maxHealth,
  onBuyItem,
  onSellItem,
  onRest,
}: TownProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'inn' | 'sell'>('shop');

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
        <div>
          <h3 className="mb-4 text-lg font-bold text-stone-950">Seu inventário</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {inventory.map((item) => (
              <button
                key={item.id}
                onClick={() => onSellItem(item)}
                className="rpg-item rounded-lg text-left"
              >
                <div className="font-bold text-stone-950">{item.name}</div>
                <div className="text-sm text-stone-600">{item.description}</div>
                <div className="mt-2 font-semibold text-amber-700">
                  Vender por {Math.floor(item.price * 0.7)} ouro
                </div>
                <div className="text-sm text-stone-500">
                  Quantidade: {item.quantity}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ShopSection title="Armas" items={WEAPONS} gold={gold} onBuyItem={onBuyItem} />
          <ShopSection title="Armaduras" items={ARMORS} gold={gold} onBuyItem={onBuyItem} />
          <ShopSection title="Poções" items={POTIONS} gold={gold} onBuyItem={onBuyItem} />
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

function ShopSection({
  title,
  items,
  gold,
  onBuyItem,
}: {
  title: string;
  items: Item[];
  gold: number;
  onBuyItem: (item: Item) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold text-stone-950">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onBuyItem(item)}
            disabled={gold < item.price}
            className="rpg-item rounded-lg text-left disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="font-bold text-stone-950">{item.name}</div>
            <div className="text-sm text-stone-600">{item.description}</div>
            <div className="mt-2 font-semibold text-amber-700">
              {item.price} ouro
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
