import { Character as CharacterType } from '../types/game';
import { TITLE_BY_ID } from '../data/achievements';
import { calculateRequiredExperience } from '../utils/experience';
import { calculateCharacterStats } from '../utils/combatStats';

interface CharacterProps {
  character: CharacterType;
}

export function Character({ character }: CharacterProps) {
  const requiredExp = calculateRequiredExperience(character.level);
  const expPercentage = Math.min(
    100,
    (character.experience / requiredExp) * 100
  );
  const combatStats = calculateCharacterStats(character);
  const activeTitle = character.activeTitleId
    ? TITLE_BY_ID[character.activeTitleId]
    : null;

  return (
    <div className="rpg-panel rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Aventureiro</div>
          <h2 className="text-2xl font-black text-stone-950 sm:text-3xl">
            {character.name}
          </h2>
          {activeTitle && (
            <div className="mt-1 inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
              {activeTitle.title}
            </div>
          )}
          <p className="font-semibold text-stone-600">
            Nível {character.level} {character.race.name} {character.class.name}
          </p>
        </div>
        <div className="self-start rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-black text-amber-900 shadow-sm">
          {character.gold} Ouro
        </div>
      </div>

      <div className="space-y-3">
        <ResourceBar
          label="Vida"
          value={character.health}
          max={character.maxHealth}
          color="bg-red-600"
        />

        {character.mana !== undefined && (
          <ResourceBar
            label="Mana"
            value={character.mana}
            max={character.maxMana || 1}
            color="bg-sky-600"
          />
        )}

        {character.stamina !== undefined && (
          <ResourceBar
            label="Estamina"
            value={character.stamina}
            max={character.maxStamina || 1}
            color="bg-amber-500"
          />
        )}

        <ResourceBar
          label="Experiência"
          value={character.experience}
          max={requiredExp}
          color="bg-emerald-600"
          percentage={expPercentage}
        />

        <div className="grid grid-cols-2 gap-2 pt-4 text-sm md:grid-cols-4">
          <StatTile label="Ataque" value={Math.round(combatStats.attack)} />
          <StatTile label="Magia" value={Math.round(combatStats.magicPower)} />
          <StatTile label="Defesa" value={Math.round(combatStats.defense)} />
          <StatTile
            label="Crítico"
            value={`${Math.round(combatStats.criticalChance * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  percentage?: number;
}

function ResourceBar({
  label,
  value,
  max,
  color,
  percentage,
}: ResourceBarProps) {
  const width = percentage ?? Math.min(100, (value / max) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200 shadow-inner">
        <div className={`h-3 rounded-full ${color} transition-[width] duration-300`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white/80 p-2.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</div>
      <div className="text-lg font-black text-stone-950">{value}</div>
    </div>
  );
}
