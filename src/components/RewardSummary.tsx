import { ReactNode } from 'react';
import { Coins, Package, Sparkles, Trophy } from 'lucide-react';

interface RewardSummaryProps {
  reward: {
    enemyName: string;
    gold: number;
    experience: number;
    loot: { name: string; quantity: number }[];
    finishingBlow?: string;
    finishingDamage?: number;
  };
}

export function RewardSummary({ reward }: RewardSummaryProps) {
  return (
    <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 text-white">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-stone-950">Vitória contra {reward.enemyName}</h3>
          <p className="text-sm font-semibold text-emerald-800">Recompensas recebidas</p>
        </div>
      </div>

      {reward.finishingBlow && reward.finishingDamage && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-stone-700">
          Golpe final: <span className="text-emerald-700">{reward.finishingBlow}</span> causou{' '}
          <span className="text-red-700">{reward.finishingDamage}</span> dano.
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <RewardTile icon={<Coins className="h-4 w-4" />} label="Ouro" value={`+${reward.gold}`} />
        <RewardTile icon={<Sparkles className="h-4 w-4" />} label="Experiência" value={`+${reward.experience} XP`} />
        <RewardTile
          icon={<Package className="h-4 w-4" />}
          label="Loot"
          value={
            reward.loot.length > 0
              ? reward.loot.map((item) => `${item.name} x${item.quantity}`).join(', ')
              : 'Nenhum item'
          }
        />
      </div>
    </div>
  );
}

function RewardTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-stone-500">
        {icon}
        {label}
      </div>
      <div className="text-sm font-black text-stone-950">{value}</div>
    </div>
  );
}
