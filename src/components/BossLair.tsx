import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { SavedCharacter } from '../types/game';

interface BossLairProps {
  character: SavedCharacter;
  entryCost: number;
  canEnter: boolean;
  onEnter: () => void;
}

export function BossLair({
  character,
  entryCost,
  canEnter,
  onEnter,
}: BossLairProps) {
  const [now, setNow] = useState(Date.now());
  const resetAt = character.bossLairResetAt || 0;
  const isCoolingDown = resetAt > now;
  const remainingMinutes = Math.max(1, Math.ceil((resetAt - now) / 60000));
  const hasGold = character.gold >= entryCost;

  useEffect(() => {
    if (!isCoolingDown) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isCoolingDown]);

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-700 text-white">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-stone-950">Covil do Chefão</h3>
          <p className="text-sm font-semibold text-stone-600">
            Enfrente um chefão escalado ao seu nível. Custo: {entryCost} ouro.
          </p>
        </div>
      </div>

      {isCoolingDown && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
          O covil está se reorganizando. Volte em {remainingMinutes} min.
        </div>
      )}

      {!hasGold && !isCoolingDown && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          Ouro insuficiente para entrar.
        </div>
      )}

      <button
        onClick={onEnter}
        disabled={!canEnter || !hasGold}
        className="rpg-button-primary w-full disabled:bg-stone-300 disabled:text-stone-500"
      >
        Enfrentar Chefão
      </button>
    </div>
  );
}
