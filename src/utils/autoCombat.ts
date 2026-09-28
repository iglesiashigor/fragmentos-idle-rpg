import {
  Ability,
  AutoCombatSettings,
  InventoryItem,
  SavedCharacter,
  Spell,
} from '../types/game';

export type AutoCombatAction =
  | { type: 'basic' }
  | { type: 'spell'; spell: Spell }
  | { type: 'ability'; ability: Ability }
  | { type: 'potion'; potion: InventoryItem };

export const DEFAULT_AUTO_COMBAT_SETTINGS: AutoCombatSettings = {
  strategy: 'balanced',
  autoPotionHealthPercent: 35,
};

const resourceThresholdByStrategy = {
  conservative: 0.8,
  balanced: 0.6,
  aggressive: 0.3,
};

export function selectAutoCombatAction(
  character: SavedCharacter,
  settings: AutoCombatSettings = DEFAULT_AUTO_COMBAT_SETTINGS
): AutoCombatAction {
  const healthPercent = (character.health / Math.max(1, character.maxHealth)) * 100;
  const potion = character.inventory.find(
    (item) => item.type === 'potion' && item.quantity > 0 && Boolean(item.healing)
  );

  if (potion && healthPercent <= settings.autoPotionHealthPercent) {
    return { type: 'potion', potion };
  }

  const threshold = resourceThresholdByStrategy[settings.strategy];
  if (
    character.mana !== undefined &&
    character.maxMana !== undefined &&
    character.mana / Math.max(1, character.maxMana) >= threshold
  ) {
    const spell = character.spells.find((candidate) => candidate.manaCost <= character.mana!);
    if (spell) return { type: 'spell', spell };
  }

  if (
    character.stamina !== undefined &&
    character.maxStamina !== undefined &&
    character.stamina / Math.max(1, character.maxStamina) >= threshold
  ) {
    const ability = character.abilities.find(
      (candidate) => candidate.staminaCost <= character.stamina!
    );
    if (ability) return { type: 'ability', ability };
  }

  return { type: 'basic' };
}
