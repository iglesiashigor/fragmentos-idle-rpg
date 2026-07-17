import { Gem, Sparkles } from 'lucide-react';
import { Item, Spell } from '../types/game';
import { RandomEventReward } from '../utils/randomEvents';

interface RandomEventModalProps {
  reward: RandomEventReward;
  onClaim: () => void;
}

export function RandomEventModal({ reward, onClaim }: RandomEventModalProps) {
  const isSpell = reward.type === 'spell';
  const isResource = reward.type === 'resource';
  const itemReward = !isResource ? (reward.reward as Item) : null;
  const spellReward = !isResource ? (reward.reward as Spell) : null;
  const itemStat =
    itemReward?.type === 'armor'
      ? `Defesa: ${itemReward.power}`
      : itemReward?.type === 'weapon'
        ? `Poder: ${itemReward.power}`
        : `Valor: ${itemReward?.price || 0} ouro`;

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
              {isResource
                ? `Voce coletou recursos em ${reward.sourceName}.`
                : `Voce encontrou ${isSpell ? 'uma nova magia' : 'um item raro'}.`}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="rounded-lg bg-stone-100 p-4">
            {isResource ? (
              <div className="space-y-3">
                {reward.rewards.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Gem className="mt-1 h-5 w-5 text-emerald-700" />
                    <div>
                      <h3 className="text-base font-black text-stone-950">
                        {item.name} x{quantity}
                      </h3>
                      <p className="text-sm text-stone-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Gem className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="mb-2 text-lg font-black text-stone-950">
                    {reward.reward.name}
                  </h3>
                  <p className="text-sm text-stone-600">{reward.reward.description}</p>
                  <p className="mt-2 text-sm font-bold text-blue-700">
                    {isSpell ? `Dano: ${spellReward?.damage || 0}` : itemStat}
                  </p>
                </div>
              </div>
            )}
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
