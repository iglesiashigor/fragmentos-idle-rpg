import { Backpack, Shield, Sword } from 'lucide-react';
import { Character as CharacterType } from '../types/game';
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

  return (
    <div className="rpg-panel rounded-lg p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-stone-950">
            {character.name}
          </h2>
          <p className="font-semibold text-stone-600">
            Nível {character.level} {character.race.name} {character.class.name}
          </p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-bold text-amber-800">
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

        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-stone-700">
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-stone-600" />
            <span>{character.equipment.weapon?.name || 'Sem arma'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-stone-600" />
            <span>{character.equipment.armor?.name || 'Sem armadura'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Backpack className="h-5 w-5 text-stone-600" />
            <span>{character.inventory.length} itens</span>
          </div>
        </div>

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
      <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-4 ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-stone-100 p-2">
      <div className="text-stone-500">{label}</div>
      <div className="font-bold text-stone-950">{value}</div>
    </div>
  );
}
