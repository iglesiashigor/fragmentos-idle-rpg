import { useEffect, useMemo } from 'react';
import { Activity, ArrowLeft, Coins, Shield, Sparkles, Swords } from 'lucide-react';
import { AutoCombatStrategy, Character, CombatTurnFeedback, Enemy, MapLocation } from '../types/game';

interface AutoFarmFieldProps {
  player: Character;
  enemy: Enemy | null;
  location: MapLocation;
  feedback?: CombatTurnFeedback | null;
  onAutoTurn: () => void;
  strategy: AutoCombatStrategy;
  onStrategyChange: (strategy: AutoCombatStrategy) => void;
  remainingEncounters?: number;
  totalEncounters?: number;
  onLeave: () => void;
}

const sceneryByLevel = [
  'from-emerald-900 via-green-800 to-lime-900',
  'from-stone-800 via-amber-900 to-orange-950',
  'from-slate-900 via-stone-800 to-zinc-950',
  'from-indigo-950 via-purple-950 to-stone-950',
];

export function AutoFarmField({
  player,
  enemy,
  location,
  feedback,
  onAutoTurn,
  strategy,
  onStrategyChange,
  remainingEncounters,
  totalEncounters,
  onLeave,
}: AutoFarmFieldProps) {
  const fieldTone = sceneryByLevel[Math.min(sceneryByLevel.length - 1, Math.floor((location.level || 1) / 4))];
  const isBossBattle = Boolean(enemy?.isBoss);

  useEffect(() => {
    if (!enemy || player.health <= 0) return;
    const timer = window.setInterval(() => {
      onAutoTurn();
    }, 1600);
    return () => window.clearInterval(timer);
  }, [enemy, onAutoTurn, player.health]);

  const floatingEnemies = useMemo(
    () => [
      { left: '27%', top: '31%', delay: '0s' },
      { left: '72%', top: '24%', delay: '0.8s' },
      { left: '64%', top: '68%', delay: '1.4s' },
    ],
    []
  );

  return (
    <div className="overflow-hidden rounded-xl border border-amber-300/40 bg-stone-950 shadow-2xl shadow-black/35">
      <div className="flex items-center justify-between border-b border-amber-300/30 bg-stone-950/95 px-4 py-3 text-amber-100">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${isBossBattle ? 'text-purple-300' : 'text-amber-400'}`}>
            {isBossBattle ? 'Batalha especial automática' : 'Campo de farm'}
          </p>
          <h2 className="text-xl font-black">{location.name}</h2>
        </div>
        <button
          onClick={onLeave}
          className="inline-flex items-center gap-2 rounded-md border border-amber-300/40 bg-stone-900 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao mapa
        </button>
      </div>

      <div className={`relative min-h-[520px] overflow-hidden bg-gradient-to-br ${fieldTone}`}>
        <div className="absolute inset-0 opacity-35 farm-grid" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.18),transparent_24rem)]" />

        <aside className="absolute left-4 top-4 z-20 w-[250px] rounded-xl border border-amber-300/40 bg-stone-950/90 p-4 text-stone-100 shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-700 text-xl font-black">
              {player.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="font-black">{player.name}</h3>
              <p className="text-xs font-bold text-stone-400">Nv. {player.level} · {player.class.name}</p>
            </div>
          </div>
          <div className="mb-3 flex gap-1 rounded-lg bg-stone-900 p-1 text-[11px] font-black">
            {(['conservative', 'balanced', 'aggressive'] as AutoCombatStrategy[]).map((option) => (
              <button
                key={option}
                onClick={() => onStrategyChange(option)}
                className={`flex-1 rounded-md px-2 py-1.5 transition ${
                  strategy === option ? 'bg-cyan-500 text-slate-950' : 'text-stone-400 hover:bg-stone-800'
                }`}
              >
                {option === 'conservative' ? 'Seguro' : option === 'balanced' ? 'Equilíbrio' : 'Agressivo'}
              </button>
            ))}
          </div>
          <StatusBar label="Vida" value={player.health} max={player.maxHealth} color="bg-emerald-500" />
          {player.mana !== undefined && (
            <StatusBar label="Mana" value={player.mana} max={player.maxMana || 1} color="bg-sky-500" />
          )}
          {player.stamina !== undefined && (
            <StatusBar label="Estamina" value={player.stamina} max={player.maxStamina || 1} color="bg-amber-400" />
          )}
          {remainingEncounters !== undefined && totalEncounters !== undefined && (
            <StatusBar
              label="Inimigos na região"
              value={remainingEncounters}
              max={totalEncounters}
              color="bg-red-500"
            />
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black">
            <span className="rounded-md bg-stone-800 px-2 py-2"><Coins className="inline h-3 w-3" /> {player.gold}</span>
            <span className="rounded-md bg-stone-800 px-2 py-2"><Sparkles className="inline h-3 w-3" /> {player.experience} XP</span>
          </div>
        </aside>

        <div className="absolute left-[43%] top-[52%] z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="farm-nameplate">{player.name}</div>
          <div className="farm-hero">
            <Shield className="h-8 w-8 text-amber-100" />
          </div>
        </div>

        {floatingEnemies.slice(0, Math.max(0, Math.min(floatingEnemies.length, remainingEncounters ?? floatingEnemies.length))).map((mob, index) => (
          <div
            key={index}
            className="farm-wanderer"
            style={{ left: mob.left, top: mob.top, animationDelay: mob.delay }}
          >
            <Swords className="h-6 w-6" />
          </div>
        ))}

        {enemy && (
          <div className="absolute left-[56%] top-[45%] z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="farm-nameplate text-red-200">{enemy.name} Nv. {enemy.level}</div>
            <div className="farm-enemy">
              <Swords className="h-8 w-8 text-red-100" />
            </div>
          </div>
        )}

        <div className="absolute right-4 top-20 z-20 w-[330px] rounded-xl border border-cyan-300/50 bg-slate-950/92 p-4 text-stone-100 shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-300" />
            <div>
              <h3 className="font-black">{isBossBattle ? 'Chefe automático' : 'Combate automático'}</h3>
              <p className="text-xs font-bold text-stone-400">Sem botão de ataque · seu personagem decide</p>
            </div>
          </div>

          {enemy ? (
            <>
              <StatusBar label={`${enemy.name} vida`} value={enemy.health} max={enemy.maxHealth} color="bg-red-500" />
              {feedback && (
                <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-950/40 p-3 text-sm font-bold">
                  <p>{feedback.action}: <span className="text-red-300">{feedback.playerDamage}</span> dano</p>
                  <p>Contra-ataque: <span className="text-red-300">{feedback.enemyDamage}</span> dano recebido</p>
                  {feedback.isCritical && <p className="text-amber-300">Crítico!</p>}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-stone-900 p-3 text-sm font-bold text-stone-300">
              {player.health <= 0
                ? 'Farm pausado. O personagem caiu em batalha.'
                : remainingEncounters === 0
                  ? 'Região esgotada. Escolha outro ponto do mapa enquanto ela recarrega.'
                : 'Procurando o próximo inimigo...'}
            </div>
          )}
        </div>

        {player.health <= 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/55 backdrop-blur-[1px]">
            <div className="rounded-xl border border-red-300 bg-stone-950/95 p-6 text-center text-stone-100 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">Caçada interrompida</p>
              <h3 className="mt-2 text-2xl font-black">Seu personagem foi derrotado</h3>
              <p className="mt-2 text-sm font-semibold text-stone-400">
                O farm automático parou. Use a janela de morte para reviver ou criar outro personagem.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-xs font-black">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-800">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
