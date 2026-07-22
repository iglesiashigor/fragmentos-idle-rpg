import { ReactNode } from 'react';
import { Coins, Gem, HeartPulse, ScrollText, Sparkles } from 'lucide-react';
import { Item, Spell } from '../types/game';
import { RandomEventReward } from '../utils/randomEvents';
import { getEquipmentSlot } from '../utils/inventory';
import { getRarityLabel, getRarityStyles } from '../utils/rarity';

interface RandomEventModalProps {
  reward: RandomEventReward;
  onClaim: () => void;
}

export function RandomEventModal({ reward, onClaim }: RandomEventModalProps) {
  const isSpell = reward.type === 'spell';
  const isResource = reward.type === 'resource';
  const hasDirectReward = reward.type === 'spell' || reward.type === 'item';
  const itemReward = hasDirectReward ? (reward.reward as Item) : null;
  const spellReward = hasDirectReward ? (reward.reward as Spell) : null;
  const itemStat =
    itemReward?.type === 'weapon'
      ? `Poder: ${itemReward.power}`
      : itemReward && getEquipmentSlot(itemReward)
        ? `Defesa: ${itemReward.power}`
        : `Valor: ${itemReward?.price || 0} ouro`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="rpg-panel relative z-[101] w-full max-w-md rounded-lg p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-stone-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-950">Evento Misterioso</h2>
            <p className="text-sm font-semibold text-stone-500">
              {isResource
                ? `Você coletou recursos em ${reward.sourceName}.`
                : getRewardSubtitle(reward.type)}
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
            ) : reward.type === 'gold' ? (
              <RewardInfo
                icon={<Coins className="mt-1 h-5 w-5 text-amber-600" />}
                title={reward.title}
                description={reward.description}
                detail={`+${reward.gold} ouro`}
              />
            ) : reward.type === 'blessing' ? (
              <RewardInfo
                icon={<HeartPulse className="mt-1 h-5 w-5 text-red-600" />}
                title={reward.title}
                description={reward.description}
                detail={`+${reward.healthRestore} vida | +${reward.resourceRestore} recurso`}
              />
            ) : reward.type === 'quest' ? (
              <RewardInfo
                icon={<ScrollText className="mt-1 h-5 w-5 text-emerald-700" />}
                title={reward.title}
                description={`${reward.description} Missão: ${reward.quest.name}.`}
                detail={`Recompensa: ${reward.quest.rewards.gold} ouro, ${reward.quest.rewards.experience} XP`}
              />
            ) : (
              <div className={`flex items-start gap-3 rounded-md p-3 ${itemReward ? `${getRarityStyles(itemReward).surface} ${getRarityStyles(itemReward).border} border` : ''}`}>
                <Gem className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <h3 className={`mb-1 text-lg font-black ${itemReward ? getRarityStyles(itemReward).text : 'text-stone-950'}`}>
                    {reward.reward.name}
                  </h3>
                  {itemReward && (
                    <div className={`mb-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${getRarityStyles(itemReward).badge}`}>
                      {getRarityLabel(itemReward)}
                    </div>
                  )}
                  <p className="text-sm text-stone-600">{reward.reward.description}</p>
                  <p className="mt-2 text-sm font-bold text-blue-700">
                    {isSpell ? `Dano: ${spellReward?.damage || 0}` : itemStat}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={onClaim} className="rpg-button-primary w-full">
          {reward.type === 'quest' ? 'Aceitar Missão' : 'Coletar Recompensa'}
        </button>
      </div>
    </div>
  );
}

function getRewardSubtitle(type: RandomEventReward['type']) {
  if (type === 'spell') return 'Você encontrou uma nova magia.';
  if (type === 'item') return 'Você encontrou um item raro.';
  if (type === 'gold') return 'Você encontrou um tesouro perdido.';
  if (type === 'blessing') return 'Você encontrou um santuário esquecido.';
  if (type === 'quest') return 'Você encontrou alguém pedindo ajuda.';
  return 'Você encontrou algo no caminho.';
}

function RewardInfo({
  icon,
  title,
  description,
  detail,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <h3 className="mb-2 text-lg font-black text-stone-950">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
        <p className="mt-2 text-sm font-bold text-blue-700">{detail}</p>
      </div>
    </div>
  );
}
