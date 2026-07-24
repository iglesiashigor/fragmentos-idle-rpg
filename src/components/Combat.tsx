import { ReactNode } from 'react';
import { Ability, Character, CombatTurnFeedback, Enemy, Spell } from '../types/game';
import {
  calculateAbilityBase,
  calculateBasicAttackBase,
  calculateSpellBase,
} from '../utils/combatStats';

interface CombatProps {
  player: Character;
  enemy: Enemy;
  onAttack: () => void;
  onCastSpell: (spell: Spell) => void;
  onUseAbility: (ability: Ability) => void;
  feedback?: CombatTurnFeedback | null;
}

export function Combat({
  player,
  enemy,
  onAttack,
  onCastSpell,
  onUseAbility,
  feedback,
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
          {enemy.abilities?.[0] && (
            <div className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-black text-purple-800">
              Especial: {enemy.abilities[0].name} ~{enemy.abilities[0].damage} dano
            </div>
          )}
        </CombatantPanel>
      </div>

      {feedback && <CombatFeedback feedback={feedback} />}

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

function CombatFeedback({ feedback }: { feedback: CombatTurnFeedback }) {
  return (
    <div
      className={`mb-5 rounded-lg border p-3 ${
        feedback.defeatedPlayer
          ? 'border-red-300 bg-red-50'
          : feedback.defeatedEnemy
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-stone-950 px-2 py-1 text-xs font-black text-white">
          Último turno
        </span>
        {feedback.isCritical && (
          <span className="rounded-md bg-amber-500 px-2 py-1 text-xs font-black text-stone-950">
            Crítico
          </span>
        )}
        {feedback.defeatedEnemy && (
          <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-black text-white">
            Vitória
          </span>
        )}
      </div>
      <div className="grid gap-2 text-sm font-bold text-stone-700 sm:grid-cols-2">
        <div className="rounded-md bg-white px-3 py-2">
          {feedback.action}: <span className="text-red-700">{feedback.playerDamage}</span> dano causado
        </div>
        <div className="rounded-md bg-white px-3 py-2">
          Contra-ataque: <span className="text-red-700">{feedback.enemyDamage}</span> dano recebido
        </div>
      </div>
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
