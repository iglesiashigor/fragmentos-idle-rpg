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
    <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="font-black text-stone-950">
        Vitória contra {reward.enemyName}
      </h3>
      <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-emerald-800">
        <span>+{reward.gold} ouro</span>
        <span>+{reward.experience} XP</span>
        {reward.loot.length > 0 && (
          <span>
            Loot:{' '}
            {reward.loot
              .map((item) => `${item.name} x${item.quantity}`)
              .join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
