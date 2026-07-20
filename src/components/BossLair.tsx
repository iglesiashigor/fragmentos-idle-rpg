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
  const weaponUpgrade = character.equipment.weapon?.upgradeLevel || 0;
  const armorUpgrade = character.equipment.armor?.upgradeLevel || 0;
  const recommendedUpgrade = Math.max(1, Math.floor(character.level / 2));
  const hasRecommendedGear =
    Boolean(character.equipment.weapon) &&
    Boolean(character.equipment.armor) &&
    weaponUpgrade >= recommendedUpgrade &&
    armorUpgrade >= recommendedUpgrade;

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
            Enfrente um chefão do seu nível. Custo: {entryCost} ouro.
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-md border border-purple-200 bg-white p-3 text-sm font-semibold text-stone-700">
        <div className="font-black text-stone-950">Preparo recomendado</div>
        <div className="mt-1">
          Arma +{recommendedUpgrade}, armadura +{recommendedUpgrade}, vida cheia e algumas poções.
        </div>
        {!hasRecommendedGear && (
          <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 font-bold text-amber-800">
            Seu equipamento ainda está abaixo do recomendado para uma luta confortável.
          </div>
        )}
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
