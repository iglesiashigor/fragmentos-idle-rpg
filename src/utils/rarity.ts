import { Item } from '../types/game';

type Rarity = NonNullable<Item['rarity']>;

const RARITY_LABELS: Record<Rarity | 'common', string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

const RARITY_STYLES: Record<Rarity | 'common', {
  border: string;
  badge: string;
  text: string;
  surface: string;
}> = {
  common: {
    border: 'border-stone-200',
    badge: 'bg-stone-100 text-stone-700',
    text: 'text-stone-950',
    surface: 'bg-white',
  },
  rare: {
    border: 'border-sky-300 ring-1 ring-sky-100',
    badge: 'bg-sky-100 text-sky-800',
    text: 'text-sky-800',
    surface: 'bg-sky-50/40',
  },
  epic: {
    border: 'border-purple-300 ring-1 ring-purple-100',
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-800',
    surface: 'bg-purple-50/40',
  },
  legendary: {
    border: 'border-amber-400 ring-1 ring-amber-200',
    badge: 'bg-amber-100 text-amber-900',
    text: 'text-amber-800',
    surface: 'bg-amber-50/50',
  },
};

export function getItemRarity(item: Pick<Item, 'rarity'>) {
  return item.rarity || 'common';
}

export function getRarityLabel(item: Pick<Item, 'rarity'>) {
  return RARITY_LABELS[getItemRarity(item)];
}

export function getRarityStyles(item: Pick<Item, 'rarity'>) {
  return RARITY_STYLES[getItemRarity(item)];
}
