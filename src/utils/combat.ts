import { Ability, Character, CombatTurnFeedback, Enemy, Spell } from '../types/game';
import {
  calculateAbilityBase,
  calculateAbilityDamage,
  calculateBasicAttackBase,
  calculateBasicAttackDamage,
  calculateEnemyDamage,
  calculateSpellBase,
  calculateSpellDamage,
} from './combatStats';

export type CombatAction =
  | { type: 'attack' }
  | { type: 'spell'; spell: Spell }
  | { type: 'ability'; ability: Ability };

export function resolveCombatTurn(character: Character, enemy: Enemy, action: CombatAction) {
  let name: string;
  let damage: number;
  let baseDamage: number;
  const resourceUpdates: Partial<Character> = {};

  if (action.type === 'spell') {
    if (character.mana === undefined || character.mana < action.spell.manaCost) return null;
    name = action.spell.name;
    damage = calculateSpellDamage(character, action.spell.damage);
    baseDamage = calculateSpellBase(character, action.spell.damage);
    resourceUpdates.mana = character.mana - action.spell.manaCost;
  } else if (action.type === 'ability') {
    if (character.stamina === undefined || character.stamina < action.ability.staminaCost) return null;
    name = action.ability.name;
    damage = calculateAbilityDamage(character, action.ability.damage);
    baseDamage = calculateAbilityBase(character, action.ability.damage);
    resourceUpdates.stamina = character.stamina - action.ability.staminaCost;
  } else {
    name = 'Ataque básico';
    damage = calculateBasicAttackDamage(character);
    baseDamage = calculateBasicAttackBase(character);
  }

  const enemyHealth = enemy.health - damage;
  const enemyDamage = enemyHealth <= 0 ? 0 : calculateEnemyDamage(enemy, character);
  const playerHealth = character.health - enemyDamage;
  const outcome: 'enemy' | 'player' | 'continue' =
    enemyHealth <= 0 ? 'enemy' : playerHealth <= 0 ? 'player' : 'continue';
  const feedback: CombatTurnFeedback = {
    action: name,
    playerDamage: damage,
    enemyDamage,
    isCritical: damage > baseDamage,
    ...(outcome === 'enemy' ? { defeatedEnemy: true } : {}),
    ...(outcome === 'player' ? { defeatedPlayer: true } : {}),
  };

  return { outcome, feedback, enemyHealth, playerHealth, resourceUpdates };
}
