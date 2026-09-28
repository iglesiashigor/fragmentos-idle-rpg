import { Clock, Coins, Shield, Skull, Sparkles, Swords } from 'lucide-react';
import { HUNT_AREAS, getStrategyLabel } from '../data/huntAreas';
import { ActiveHunt, HuntClaimSummary, HuntStrategy } from '../types/game';

interface IdleHuntPanelProps {
  activeHunt?: ActiveHunt;
  lastSummary?: HuntClaimSummary;
  characterLevel: number;
  onStartHunt: (areaId: string, strategy: HuntStrategy) => void;
  onClaimHunt: () => void;
  onStopHunt: () => void;
}

const formatDuration = (elapsedMs: number) => {
  const minutes = Math.floor(elapsedMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours <= 0) return `${Math.max(1, remainingMinutes)}min`;
  return `${hours}h ${remainingMinutes}min`;
};

export function IdleHuntPanel({
  activeHunt,
  lastSummary,
  characterLevel,
  onStartHunt,
  onClaimHunt,
  onStopHunt,
}: IdleHuntPanelProps) {
  const activeArea = HUNT_AREAS.find((area) => area.id === activeHunt?.areaId);

  return (
    <section className="rpg-panel rounded-lg p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
            Novo modo idle
          </p>
          <h2 className="text-2xl font-black text-stone-950">Caçada AFK</h2>
          <p className="text-sm font-semibold text-stone-500">
            Escolha uma área, defina uma estratégia e deixe o personagem trabalhar.
          </p>
        </div>
        {activeArea && (
          <div className="rounded-lg bg-stone-950 px-4 py-3 text-sm font-black text-amber-100">
            Caçando: {activeArea.name}
          </div>
        )}
      </div>

      {lastSummary && (
        <div className="mb-4 grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-950 sm:grid-cols-4">
          <div><Clock className="mb-1 h-4 w-4" />{formatDuration(lastSummary.elapsedMs)}</div>
          <div><Skull className="mb-1 h-4 w-4" />{lastSummary.kills} abates</div>
          <div><Sparkles className="mb-1 h-4 w-4" />+{lastSummary.experience} XP</div>
          <div><Coins className="mb-1 h-4 w-4" />+{lastSummary.gold} ouro</div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {HUNT_AREAS.map((area) => {
          const locked = characterLevel + 2 < area.recommendedLevel;
          const isActive = activeHunt?.areaId === area.id;

          return (
            <div
              key={area.id}
              className={`rounded-lg border p-4 ${
                isActive
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-stone-950">{area.name}</h3>
                  <p className="text-sm font-semibold text-stone-500">{area.description}</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">
                  Nv. {area.recommendedLevel}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black text-stone-700">
                <span><Swords className="inline h-3 w-3" /> {area.baseKillsPerHour}/h</span>
                <span><Sparkles className="inline h-3 w-3" /> {area.experiencePerKill} XP</span>
                <span><Shield className="inline h-3 w-3" /> risco {area.danger.toFixed(1)}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(['balanced', 'experience', 'gold', 'safe'] as HuntStrategy[]).map((strategy) => (
                  <button
                    key={strategy}
                    disabled={locked}
                    onClick={() => onStartHunt(area.id, strategy)}
                    className="rounded-md bg-stone-950 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {getStrategyLabel(strategy)}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs font-bold text-stone-500">
                Achado raro futuro: {area.rareFind}
              </p>
            </div>
          );
        })}
      </div>

      {activeHunt && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onClaimHunt}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800"
          >
            Coletar progresso
          </button>
          <button
            onClick={onStopHunt}
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-black text-stone-700 transition hover:bg-stone-100"
          >
            Parar caçada
          </button>
        </div>
      )}
    </section>
  );
}
