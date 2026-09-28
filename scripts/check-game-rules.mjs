import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const rules = {
  ...await server.ssrLoadModule('/src/utils/combat.ts'),
  ...await server.ssrLoadModule('/src/utils/combatRewards.ts'),
  ...await server.ssrLoadModule('/src/utils/gathering.ts'),
  ...await server.ssrLoadModule('/src/data/professions.ts'),
};
await server.close();

const resource = { id: 'wood', name: 'Madeira', type: 'loot', description: '', price: 1 };
const character = {
  id: 'test', createdAt: 0, name: 'Teste', health: 50, maxHealth: 50,
  mana: 20, stamina: 20, gold: 0, level: 1, experience: 0,
  inventory: [], equipment: { weapon: null, armor: null }, spells: [], abilities: [],
  race: { bonuses: { health: 0, damage: 0, defense: 0 } },
  class: { id: 'mage', baseHealth: 50, baseResource: 20 },
  attributes: { strength: 1, effort: 1, resistance: 1, intelligence: 1, accuracy: 1 },
};
const enemy = { name: 'Lobo', health: 1, maxHealth: 1, level: 1, damage: 5, experience: 10, loot: [resource] };
const spell = { name: 'Fogo', damage: 4, manaCost: 6 };

assert.equal(rules.resolveCombatTurn({ ...character, mana: 5 }, enemy, { type: 'spell', spell }), null);
const turn = rules.resolveCombatTurn(character, enemy, { type: 'spell', spell });
assert.equal(turn.outcome, 'enemy');
assert.equal(turn.feedback.enemyDamage, 0);
assert.equal(turn.resourceUpdates.mana, 14);

const reward = rules.calculateCombatRewards(character, enemy, turn.resourceUpdates);
assert.equal(reward.updates.mana, 14);
assert.equal(reward.updates.gold, 15);
assert.equal(reward.updates.experience, 10);
assert.equal(reward.updates.inventory[0].quantity, 1);
assert.equal(reward.updates.stats.kills, 1);

const exhausted = rules.consumeGatheringCharge({ remaining: 1, resetAt: 0 }, 1000);
assert.equal(rules.getGatheringNodeState({ forest: exhausted }, 'forest', 1001).remaining, 0);
assert.equal(rules.getGatheringNodeState({ forest: exhausted }, 'forest', exhausted.resetAt).remaining, 5);
assert.deepEqual(rules.getGatheringProfessionUpdate({ id: 'woodcutter', level: 1, experience: 50 }, 'forest', 1).profession,
  { id: 'woodcutter', level: 2, experience: 15 });
const random = Math.random;
Math.random = () => 1;
const collected = rules.collectResources(character, [{ item: resource, quantity: 2 }], 'forest');
Math.random = random;
assert.equal(collected.inventory[0].quantity, 2);
assert.equal(collected.professions.woodcutter.experience, 25);

console.log('Game rules check passed');
