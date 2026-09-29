import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const rules = {
  ...await server.ssrLoadModule('/src/utils/combat.ts'),
  ...await server.ssrLoadModule('/src/utils/combatRewards.ts'),
  ...await server.ssrLoadModule('/src/utils/gathering.ts'),
  ...await server.ssrLoadModule('/src/data/professions.ts'),
  ...await server.ssrLoadModule('/src/utils/combatStats.ts'),
  ...await server.ssrLoadModule('/src/utils/economy.ts'),
  ...await server.ssrLoadModule('/src/data/enemies.ts'),
  ...await server.ssrLoadModule('/src/data/balance.ts'),
  ...await server.ssrLoadModule('/src/data/recipes.ts'),
  ...await server.ssrLoadModule('/src/utils/randomEvents.ts'),
  ...await server.ssrLoadModule('/src/utils/pendingSave.ts'),
  ...await server.ssrLoadModule('/src/utils/techniques.ts'),
  ...await server.ssrLoadModule('/src/data/resources.ts'),
  ...await server.ssrLoadModule('/src/data/items.ts'),
  ...await server.ssrLoadModule('/src/data/quests.ts'),
};
await server.close();

const resource = { id: 'wood', name: 'Madeira', type: 'loot', description: '', price: 1 };
const character = {
  id: 'test', createdAt: 0, name: 'Teste', health: 50, maxHealth: 50,
  mana: 20, stamina: 20, gold: 0, level: 1, experience: 0,
  inventory: [], equipment: { weapon: null, armor: null }, spells: [], abilities: [],
  race: { bonuses: { health: 0, damage: 0, defense: 0 } },
  class: { id: 'mage', resourceType: 'mana', baseHealth: 50, baseResource: 20 },
  attributes: { strength: 1, effort: 1, resistance: 1, intelligence: 1, accuracy: 1 },
};
const enemy = { name: 'Lobo', health: 1, maxHealth: 1, level: 1, damage: 5, experience: 10, loot: [resource] };
const spell = { name: 'Fogo', damage: 4, manaCost: 6 };

assert.equal(rules.resolveCombatTurn({ ...character, mana: 5 }, enemy, { type: 'spell', spell }), null);
const turn = rules.resolveCombatTurn(character, enemy, { type: 'spell', spell });
assert.equal(turn.outcome, 'enemy');
assert.equal(turn.feedback.enemyDamage, 0);
assert.equal(turn.resourceUpdates.mana, 14);

const armoredEnemy = { ...enemy, health: 200, maxHealth: 200, defense: 6,
  abilities: [{ name: 'Investida', damage: 30, cooldown: 3 }] };
const random = Math.random;
Math.random = () => 1;
const regularTurn = rules.resolveCombatTurn(character, { ...armoredEnemy, turnsTaken: 1 }, { type: 'attack' });
const specialTurn = rules.resolveCombatTurn(character, { ...armoredEnemy, turnsTaken: 2 }, { type: 'attack' });
Math.random = random;
assert.equal(regularTurn.feedback.enemyAction, undefined);
assert.equal(specialTurn.feedback.enemyAction, 'Investida');
assert.ok(specialTurn.feedback.enemyDamage > regularTurn.feedback.enemyDamage);
assert.equal(regularTurn.feedback.playerDamage,
  rules.calculateDamageAgainstEnemy(rules.calculateBasicAttackBase(character), armoredEnemy));

const mageResource = rules.calculateMaxResource(character);
assert.equal(rules.calculateMaxResource({ ...character, attributes: { ...character.attributes, intelligence: 2 } }), mageResource + 2);
const fighter = { ...character, class: { ...character.class, resourceType: 'stamina' } };
assert.equal(rules.calculateMaxResource({ ...fighter, attributes: { ...fighter.attributes, intelligence: 2 } }),
  rules.calculateMaxResource(fighter));
assert.equal(rules.calculateMaxResource({ ...fighter, attributes: { ...fighter.attributes, strength: 2 } }),
  rules.calculateMaxResource(fighter) + 2);
const developedCharacter = { ...character,
  attributes: { ...character.attributes, intelligence: 4, resistance: 3 } };
assert.ok(rules.calculateCharacterStats({ ...developedCharacter, race: { ...character.race, id: 'elf' } }).magicPower >
  rules.calculateCharacterStats(developedCharacter).magicPower);
assert.ok(rules.calculateCharacterStats({ ...developedCharacter, race: { ...character.race, id: 'dwarf' } }).defense >
  rules.calculateCharacterStats(developedCharacter).defense);
assert.equal(rules.getRestCost(1), 20);
assert.ok(rules.getRestCost(10) > rules.getRestCost(1));
assert.ok(rules.getBossLairEntryCost(10) > rules.getBossLairEntryCost(1));
assert.equal(rules.generateBoss(3).name, rules.getBossPreview(3).name);
assert.equal(rules.getEffectiveEncounterLevel(10, 1), 9);
assert.equal(rules.getEffectiveEncounterLevel(3, 5), 5);
assert.ok(rules.getEnemyBalance(10).healthBonus > rules.getEnemyBalance(1).healthBonus);
assert.ok(rules.generateBoss(10).maxHealth > rules.generateBoss(1).maxHealth);
const powerfulCharacter = { ...character, equipment: {
  ...character.equipment, weapon: { power: 100 }, armor: { power: 100 },
} };
assert.ok(rules.generateBoss(1, powerfulCharacter).maxHealth > rules.generateBoss(1).maxHealth);
assert.equal(rules.generateBoss(1, powerfulCharacter).maxHealth,
  rules.getBossPreview(1, powerfulCharacter).estimatedHealth);
assert.ok(rules.calculateIncomingDamage(30, { ...enemy, isBoss: true }, powerfulCharacter) >= 15);
assert.equal(rules.getSellPrice(1000, 1, 'legendary'), 250);
assert.equal(rules.getSellPrice(1, 3), 3);
assert.equal(rules.getEquipmentUpgradeCost({ type: 'weapon', upgradeLevel: 0 }).goldCost, 58);
assert.ok(rules.getCombatGoldReward({ level: 1, isBoss: true }) < 70);
Math.random = () => 0;
assert.ok(rules.generateBoss(1).loot.every((item) => item.rarity !== 'legendary'));
assert.ok(rules.generateBoss(8).loot.some((item) => item.rarity === 'legendary'));
Math.random = () => 0.9;
assert.equal(rules.generateRandomEvent(1, false).reward.rarity, 'rare');
assert.notEqual(rules.generateRandomEvent(8, false).reward.rarity, 'legendary');
Math.random = random;

const reward = rules.calculateCombatRewards(character, enemy, turn.resourceUpdates);
assert.equal(reward.updates.mana, 14);
assert.equal(reward.updates.gold, 11);
assert.equal(reward.updates.experience, 10);
assert.equal(reward.updates.inventory[0].quantity, 1);
assert.equal(reward.updates.stats.kills, 1);

const exhausted = rules.consumeGatheringCharge({ remaining: 1, resetAt: 0 }, 1000);
assert.equal(rules.getGatheringNodeState({ forest: exhausted }, 'forest', 1001).remaining, 0);
assert.equal(rules.getGatheringNodeState({ forest: exhausted }, 'forest', exhausted.resetAt).remaining, 5);
const upgraded = rules.consumeGatheringCharge({ remaining: 1, resetAt: 0, level: 3 }, 1000);
assert.equal(rules.getGatheringNodeState({ forest: upgraded }, 'forest', upgraded.resetAt).level, 3);
assert.equal(rules.getGatheringUpgradeCost(1), 100);
assert.equal(rules.getGatheringUpgradeCost(3), 300);
assert.deepEqual(rules.getGatheringProfessionUpdate({ id: 'woodcutter', level: 1, experience: 50 }, 'forest', 1).profession,
  { id: 'woodcutter', level: 2, experience: 15 });
Math.random = () => 1;
const collected = rules.collectResources(character, [{ item: resource, quantity: 2 }], 'forest');
Math.random = random;
assert.equal(collected.inventory[0].quantity, 2);
assert.equal(collected.professions.woodcutter.experience, 25);
assert.equal(rules.collectResources(character, [{ item: resource, quantity: 2 }], 'forest', 2).inventory[0].quantity, 4);
const obtainableItems = new Set([
  ...rules.RESOURCES.map((item) => item.id),
  ...rules.LOOT.map((item) => item.id),
]);
assert.equal(new Set(rules.CRAFTING_RECIPES.map((recipe) => recipe.id)).size, rules.CRAFTING_RECIPES.length);
assert.ok(rules.CRAFTING_RECIPES.every((recipe) => recipe.name === recipe.result.name));
assert.ok(rules.CRAFTING_RECIPES.every((recipe) =>
  recipe.materials.every((material) => obtainableItems.has(material.itemId))));
const questIds = new Set(rules.QUESTS.map((quest) => quest.id));
assert.equal(questIds.size, rules.QUESTS.length);
assert.ok(rules.QUESTS.every((quest) =>
  (quest.requirements.previousQuests || []).every((id) => questIds.has(id))));
assert.ok(rules.QUESTS.every((quest) =>
  quest.type !== 'collect' || quest.objectives.every((objective) => obtainableItems.has(objective.target))));
assert.ok(Object.values(rules.RESOURCE_POOLS).every((pool) =>
  pool.items.every((itemId) => rules.RESOURCE_BY_ID[itemId])));
Math.random = () => 0.99;
assert.equal(rules.generateGatheringEvent(1, 'ruins', 1).rewards[0].item.id, 'ancient_fragment');
assert.equal(rules.generateGatheringEvent(3, 'ruins', 6).rewards[0].item.id, 'relic_core');
assert.equal(rules.generateEnemy(1).name, 'Bandido');
assert.equal(rules.generateEnemy(6).name, 'Lobo Lunar');
assert.equal(rules.generateEnemy(6).abilities[0].name, 'Salto Lunar');
Math.random = random;

const savedEntries = new Map();
globalThis.localStorage = {
  getItem: (key) => savedEntries.get(key) ?? null,
  setItem: (key, value) => savedEntries.set(key, value),
  removeItem: (key) => savedEntries.delete(key),
};
rules.storePendingSave('player-1', { ...character, level: 2 });
assert.equal(rules.getPendingSave('player-1', character.id).level, 2);
assert.equal(rules.getPendingSave('player-2', character.id), null);
rules.storePendingSave('player-1', { ...character, level: 3 });
assert.equal(rules.getPendingSave('player-1', character.id).level, 3);
savedEntries.set(rules.pendingSaveKey('player-1', character.id), '{broken');
assert.equal(rules.getPendingSave('player-1', character.id), null);
assert.equal(savedEntries.size, 0);

const oldDescription = 'Potencializa sua arma (Nível 2) (Nível 3) (Nível 4)';
assert.equal(rules.cleanTechniqueDescription(oldDescription), 'Potencializa sua arma');
assert.equal(rules.cleanTechniqueDescription('Fogo'), 'Fogo');
assert.deepEqual(rules.upgradeTechnique({ ...spell, damage: 30, level: 4, description: oldDescription }),
  { ...spell, damage: 36, level: 5, description: 'Potencializa sua arma' });
const ability = { name: 'Lâmina', damage: 30, staminaCost: 20, level: 4, description: oldDescription };
assert.deepEqual(rules.upgradeTechnique(ability),
  { ...ability, damage: 36, level: 5, description: 'Potencializa sua arma' });

console.log('Game rules check passed');
