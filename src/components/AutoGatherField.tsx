import { useEffect, useMemo } from 'react';
import { ArrowLeft, Axe, Gem, Hammer, Leaf, Pickaxe, TreePine } from 'lucide-react';
import { GatheringNodeState, MapLocation, SavedCharacter } from '../types/game';

interface AutoGatherFieldProps {
  player: SavedCharacter;
  location: MapLocation;
  nodeState: GatheringNodeState | null;
  lastRewards: { name: string; quantity: number }[] | null;
  onAutoGather: () => void;
  onLeave: () => void;
}

const nodeDetails = {
  forest: { action: 'Cortando madeira', node: 'Arvore antiga', Icon: TreePine, tone: 'from-emerald-950 via-green-800 to-lime-900' },
  quarry: { action: 'Minerando pedra', node: 'Veio de minerio', Icon: Pickaxe, tone: 'from-stone-950 via-slate-700 to-amber-800' },
  grove: { action: 'Colhendo ervas', node: 'Moita de ervas', Icon: Leaf, tone: 'from-emerald-950 via-teal-800 to-green-700' },
  ruins: { action: 'Escavando ruinas', node: 'Escombros antigos', Icon: Gem, tone: 'from-stone-950 via-indigo-900 to-purple-950' },
} as const;

export function AutoGatherField({
  player,
  location,
  nodeState,
  lastRewards,
  onAutoGather,
  onLeave,
}: AutoGatherFieldProps) {
  const details = nodeDetails[location.resourcePool as keyof typeof nodeDetails] || {
    action: 'Coletando recursos',
    node: 'Ponto de coleta',
    Icon: Hammer,
    tone: 'from-stone-950 via-stone-800 to-amber-900',
  };
  const remaining = nodeState?.remaining ?? 5;
  const isDepleted = remaining <= 0 && Boolean(nodeState?.resetAt && nodeState.resetAt > Date.now());
  const resetMinutes = nodeState?.resetAt
    ? Math.max(1, Math.ceil((nodeState.resetAt - Date.now()) / 60000))
    : 0;

  useEffect(() => {
    if (isDepleted || player.health <= 0) return;
    const timer = window.setInterval(onAutoGather, 1600);
    return () => window.clearInterval(timer);
  }, [isDepleted, onAutoGather, player.health]);

  const debris = useMemo(
    () => [
      { left: '28%', top: '34%', delay: '0s' },
      { left: '70%', top: '28%', delay: '.9s' },
      { left: '65%', top: '69%', delay: '1.5s' },
    ],
    []
  );
  const NodeIcon = details.Icon;

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-300/40 bg-stone-950 shadow-2xl shadow-black/35">
      <div className="flex items-center justify-between border-b border-emerald-300/30 bg-stone-950/95 px-4 py-3 text-emerald-50">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Campo de coleta</p>
          <h2 className="text-xl font-black">{location.name}</h2>
        </div>
        <button onClick={onLeave} className="inline-flex items-center gap-2 rounded-md border border-emerald-300/40 bg-stone-900 px-3 py-2 text-sm font-black transition hover:bg-stone-800">
          <ArrowLeft className="h-4 w-4" /> Voltar ao mapa
        </button>
      </div>

      <div className={`relative min-h-[520px] overflow-hidden bg-gradient-to-br ${details.tone}`}>
        <div className="absolute inset-0 opacity-35 farm-grid" />
        <div className="absolute left-4 top-4 z-20 w-[250px] rounded-xl border border-emerald-300/40 bg-stone-950/90 p-4 text-stone-100 shadow-xl">
          <p className="font-black">{player.name} <span className="text-emerald-300">Nv. {player.level}</span></p>
          <p className="mt-1 text-xs font-bold text-stone-400">{isDepleted ? 'Ponto esgotado' : details.action}</p>
          <Progress label="Vida" value={player.health} max={player.maxHealth} color="bg-emerald-500" />
          <Progress label="Recursos" value={remaining} max={5} color="bg-amber-400" />
        </div>

        <div className="absolute left-[43%] top-[52%] z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="farm-nameplate">{player.name}</div>
          <div className="farm-hero"><Axe className="h-8 w-8 text-amber-100" /></div>
        </div>
        {debris.map((item, index) => (
          <div key={index} className="farm-wanderer text-emerald-100" style={{ left: item.left, top: item.top, animationDelay: item.delay }}><Leaf className="h-6 w-6" /></div>
        ))}
        <div className={`absolute left-[58%] top-[46%] z-10 -translate-x-1/2 -translate-y-1/2 ${isDepleted ? 'opacity-35 grayscale' : ''}`}>
          <div className="farm-nameplate text-emerald-100">{details.node}</div>
          <div className="farm-enemy border-emerald-300/60 bg-emerald-700"><NodeIcon className="h-9 w-9 text-emerald-50" /></div>
        </div>

        <aside className="absolute right-4 top-20 z-20 w-[330px] rounded-xl border border-emerald-300/45 bg-stone-950/92 p-4 text-stone-100 shadow-xl">
          <h3 className="font-black text-emerald-200">Coleta automatica</h3>
          <p className="mt-1 text-xs font-bold text-stone-400">Sem botao: o personagem trabalha enquanto voce estiver neste campo.</p>
          {isDepleted ? (
            <p className="mt-4 rounded-lg bg-amber-950/50 p-3 text-sm font-bold text-amber-200">Ponto esgotado. Novos recursos em cerca de {resetMinutes} min.</p>
          ) : lastRewards?.length ? (
            <div className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-950/40 p-3 text-sm font-bold">
              <p className="mb-1 text-emerald-200">Ultima coleta</p>
              {lastRewards.map((reward) => <p key={reward.name}>+{reward.quantity} {reward.name}</p>)}
            </div>
          ) : <p className="mt-4 text-sm font-bold text-stone-300">Preparando a primeira coleta...</p>}
        </aside>
      </div>
    </div>
  );
}

function Progress({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className="mt-3"><div className="mb-1 flex justify-between text-xs font-black"><span>{label}</span><span>{value}/{max}</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-800"><div className={`h-full ${color}`} style={{ width: `${percent}%` }} /></div></div>;
}
