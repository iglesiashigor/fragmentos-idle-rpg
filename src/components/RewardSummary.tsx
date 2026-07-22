import { ReactNode } from 'react';
import { Coins, Package, Sparkles, Trophy } from 'lucide-react';

interface RewardSummaryProps {
  reward: {
    enemyName: string;
    gold: number;
    experience: number;
    loot: { name: string; quantity: number }[];
  };
}

export function RewardSummary({ reward }: RewardSummaryProps) {
  return (
    <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-stone-950">Vitória contra {reward.enemyName}</h3>
          <p className="text-sm font-semibold text-emerald-800">Recompensas recebidas</p>
        </div>
      </div>

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
    <div className="rounded-md bg-white p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-stone-500">
        {icon}
        {label}
      </div>
      <div className="text-sm font-black text-stone-950">{value}</div>
    </div>
  );
}
