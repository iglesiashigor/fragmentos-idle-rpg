import { useEffect, useState } from 'react';
import { Hammer } from 'lucide-react';
import { PROFESSIONS, PROFESSION_BY_ID } from '../data/professions';
import { RESOURCE_BY_ID, RESOURCE_POOLS } from '../data/resources';
import { GatheringNodeState, MapLocation, SavedCharacter } from '../types/game';

interface GatheringProps {
  character: SavedCharacter;
  location: MapLocation;
  lastRewards: { name: string; quantity: number }[] | null;
  nodeState: GatheringNodeState | null;
  onGather: () => void;
}

export function Gathering({
  character,
  location,
  lastRewards,
  nodeState,
  onGather,
}: GatheringProps) {
  const [now, setNow] = useState(Date.now());
  const resourcePool = location.resourcePool || '';
  const pool = RESOURCE_POOLS[resourcePool];
  const requiredProfession = PROFESSIONS.find((profession) =>
    profession.resourcePools.includes(resourcePool)
  );
  const currentProfession = character.profession
    ? PROFESSION_BY_ID[character.profession.id]
    : null;
  const hasRightProfession = Boolean(
    character.profession && currentProfession?.resourcePools.includes(resourcePool)
  );
  const isDepleted = Boolean(
    nodeState && nodeState.remaining <= 0 && nodeState.resetAt > now
  );
  const canGather = hasRightProfession && !isDepleted;
  const effectiveRemaining =
    nodeState && nodeState.remaining <= 0 && nodeState.resetAt <= now
      ? 5
      : nodeState?.remaining ?? 0;
  const resetMinutes = nodeState
    ? Math.max(1, Math.ceil((nodeState.resetAt - now) / 60000))
    : 0;

  useEffect(() => {
    if (!nodeState || nodeState.remaining > 0) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [nodeState]);

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Hammer className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-stone-950">{location.name}</h3>
          <p className="text-sm font-semibold text-stone-600">
            Recursos:{' '}
            {pool?.items
              .map((itemId) => RESOURCE_BY_ID[itemId]?.name || itemId)
              .join(', ') || 'desconhecidos'}
          </p>
        </div>
      </div>

      {!character.profession ? (
        <WarningBox text="Escolha uma profissão na cidade antes de coletar." />
      ) : !hasRightProfession ? (
        <WarningBox
          text={`Sua profissão atual é ${currentProfession?.name}. Este ponto exige ${requiredProfession?.name}.`}
        />
      ) : isDepleted ? (
        <WarningBox text={`Este ponto esgotou. Volte em ${resetMinutes} min.`} />
      ) : (
        <div className="mb-4 rounded-md border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-800">
          {currentProfession?.name} Nv. {character.profession.level}: colete para ganhar recursos e XP de profissão.
          <div className="mt-2 text-stone-600">
            Coletas restantes: {effectiveRemaining}
          </div>
        </div>
      )}

      <button
        onClick={onGather}
        disabled={!canGather}
        className="rpg-button-primary w-full disabled:bg-stone-300 disabled:text-stone-500"
      >
        Coletar
      </button>

      {lastRewards && lastRewards.length > 0 && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-white p-3 text-sm font-bold text-emerald-800">
          Coletado:{' '}
          {lastRewards
            .map((reward) => `${reward.name} x${reward.quantity}`)
            .join(', ')}
        </div>
      )}
    </div>
  );
}

function WarningBox({ text }: { text: string }) {
  return (
    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
      {text}
    </div>
  );
}
