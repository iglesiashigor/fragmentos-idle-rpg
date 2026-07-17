import { Gem, Sparkles } from 'lucide-react';
import { Item, Spell } from '../types/game';

interface RandomEventModalProps {
  reward: { type: 'spell' | 'item'; reward: Spell | Item };
  onClaim: () => void;
}

export function RandomEventModal({ reward, onClaim }: RandomEventModalProps) {
  const isSpell = reward.type === 'spell';
  const itemReward = reward.reward as Item;
  const spellReward = reward.reward as Spell;
  const itemStat =
    itemReward.type === 'armor'
      ? `Defesa: ${itemReward.power}`
      : itemReward.type === 'weapon'
        ? `Poder: ${itemReward.power}`
        : `Valor: ${itemReward.price} ouro`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="rpg-panel relative z-[101] w-full max-w-md rounded-lg p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-stone-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-950">Descoberta Especial!</h2>
            <p className="text-sm font-semibold text-stone-500">
              Voce encontrou {isSpell ? 'uma nova magia' : 'um item raro'}.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="rounded-lg bg-stone-100 p-4">
            <div className="flex items-start gap-3">
              <Gem className="mt-1 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="mb-2 text-lg font-black text-stone-950">{reward.reward.name}</h3>
                <p className="text-sm text-stone-600">{reward.reward.description}</p>
                <p className="mt-2 text-sm font-bold text-blue-700">
                  {isSpell ? `Dano: ${spellReward.damage}` : itemStat}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClaim}
          className="rpg-button-primary w-full"
        >
          Coletar Recompensa
        </button>
      </div>
    </div>
  );
}
