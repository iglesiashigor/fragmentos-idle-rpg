import { ReactNode } from 'react';
import { Ability, Character, Spell } from '../types/game';
import {
  calculateAbilityBase,
  calculateBasicAttackBase,
  calculateSpellBase,
} from '../utils/combatStats';

interface CombatProps {
  player: Character;
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    level: number;
  };
  onAttack: () => void;
  onCastSpell: (spell: Spell) => void;
  onUseAbility: (ability: Ability) => void;
}

export function Combat({
  player,
  enemy,
  onAttack,
  onCastSpell,
  onUseAbility,
}: CombatProps) {
  const basicDamage = calculateBasicAttackBase(player);

  const hasResource = (cost: number, type: 'mana' | 'stamina') => {
    if (type === 'mana' && player.mana !== undefined) {
      return player.mana >= cost;
    }
    if (type === 'stamina' && player.stamina !== undefined) {
      return player.stamina >= cost;
    }
    return false;
  };

  return (
    <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <CombatantPanel name={player.name}>
          <Bar label="Vida" value={player.health} max={player.maxHealth} color="bg-red-600" />
          {player.mana !== undefined && (
            <Bar label="Mana" value={player.mana} max={player.maxMana || 1} color="bg-sky-600" />
          )}
          {player.stamina !== undefined && (
            <Bar
              label="Estamina"
              value={player.stamina}
              max={player.maxStamina || 1}
              color="bg-amber-500"
            />
          )}
        </CombatantPanel>

        <div className="text-center text-2xl font-black text-red-700">VS</div>

        <CombatantPanel name={`${enemy.name} Nv. ${enemy.level}`}>
          <Bar label="Vida" value={enemy.health} max={enemy.maxHealth} color="bg-red-700" />
        </CombatantPanel>
      </div>

      <div className="space-y-4">
        <button
          onClick={onAttack}
          className="w-full rounded-md bg-red-700 px-4 py-2 font-bold text-white transition-colors hover:bg-red-800"
        >
          Ataque Básico
          <span className="ml-2 text-red-100">~{basicDamage} dano</span>
        </button>

        {player.class.resourceType === 'mana' && player.spells.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {player.spells.map((spell) => (
              <button
                key={`${spell.id}_${spell.level}`}
                onClick={() => onCastSpell(spell)}
                disabled={!hasResource(spell.manaCost, 'mana')}
                className={`rounded-md px-4 py-2 transition-colors ${
                  hasResource(spell.manaCost, 'mana')
                    ? 'bg-sky-700 text-white hover:bg-sky-800'
                    : 'cursor-not-allowed bg-stone-300 text-stone-500'
                }`}
              >
                <div className="text-sm font-bold">{spell.name}</div>
                <div className="text-xs">
                  Dano: ~{calculateSpellBase(player, spell.damage)} | Mana:{' '}
                  {spell.manaCost}
                </div>
                {spell.level > 1 && (
                  <div className="text-xs text-sky-100">Nível {spell.level}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {player.class.resourceType === 'stamina' &&
          player.abilities.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {player.abilities.map((ability) => (
                <button
                  key={`${ability.id}_${ability.level}`}
                  onClick={() => onUseAbility(ability)}
                  disabled={!hasResource(ability.staminaCost, 'stamina')}
                  className={`rounded-md px-4 py-2 transition-colors ${
                    hasResource(ability.staminaCost, 'stamina')
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'cursor-not-allowed bg-stone-300 text-stone-500'
                  }`}
                >
                  <div className="text-sm font-bold">{ability.name}</div>
                  <div className="text-xs">
                    Dano: ~{calculateAbilityBase(player, ability.damage)} |
                    Estamina: {ability.staminaCost}
                  </div>
                  {ability.level > 1 && (
                    <div className="text-xs text-amber-100">
                      Nível {ability.level}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function CombatantPanel({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="text-lg font-black text-stone-950">{name}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Bar({
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
  return (
    <div>
      <div className="mb-1 text-sm text-stone-600">
        {label}: {value}/{max}
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-4 ${color}`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}
