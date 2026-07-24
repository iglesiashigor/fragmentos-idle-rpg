import { useEffect, useState } from 'react';
import { Hammer } from 'lucide-react';
import {
  getProfessionRequiredExperience,
  MAX_PROFESSION_LEVEL,
  PROFESSIONS,
} from '../data/professions';
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
  const professionProgress = requiredProfession
    ? character.professions?.[requiredProfession.id]
    : undefined;
  const professionLevel = professionProgress?.level || 1;
  const isKnownResourcePool = Boolean(pool && requiredProfession);
  const isDepleted = Boolean(
    nodeState && nodeState.remaining <= 0 && nodeState.resetAt > now
  );
  const canGather = isKnownResourcePool && !isDepleted;
  const effectiveRemaining =
    nodeState && nodeState.remaining <= 0 && nodeState.resetAt <= now
      ? 5
      : nodeState?.remaining ?? 0;
  const requiredExperience = getProfessionRequiredExperience(professionLevel);
  const professionExperience = professionProgress?.experience || 0;
  const isMaxProfession = professionLevel >= MAX_PROFESSION_LEVEL;
  const professionProgressPercent =
    isMaxProfession || requiredExperience === 0
      ? 100
      : Math.min(100, (professionExperience / requiredExperience) * 100);
  const chargeProgress = Math.min(100, (effectiveRemaining / 5) * 100);
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

      {!isKnownResourcePool ? (
        <WarningBox text="Este ponto de coleta ainda não tem uma profissão associada." />
      ) : isDepleted ? (
        <WarningBox text={`Este ponto esgotou. Volte em ${resetMinutes} min.`} />
      ) : (
        <div className="mb-4 rounded-md border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-800">
          {requiredProfession?.name} Nv. {professionLevel}: colete para ganhar recursos e XP de profissão.
          <div className="mt-3 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs font-black uppercase text-stone-600">
                <span>Coletas restantes</span>
                <span>{effectiveRemaining}/5</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${chargeProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-black uppercase text-stone-600">
                <span>XP da profissão</span>
                <span>
                  {isMaxProfession ? 'Máximo' : `${professionExperience}/${requiredExperience}`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${professionProgressPercent}%` }}
                />
              </div>
            </div>
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
        <div className="mt-4 rounded-md border border-emerald-200 bg-white p-3">
          <div className="mb-2 text-sm font-black text-emerald-800">
            Resultado da coleta
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {lastRewards.map((reward) => (
              <div
                key={reward.name}
                className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800"
              >
                +{reward.quantity} {reward.name}
              </div>
            ))}
            <div className="rounded-md bg-stone-100 px-3 py-2 text-sm font-black text-stone-700">
              +25 XP profissão
            </div>
          </div>
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
