import { Bed } from 'lucide-react';
import { getRestCost } from '../utils/economy';

interface InnProps {
  gold: number;
  level: number;
  currentHealth: number;
  maxHealth: number;
  currentResource: number;
  maxResource: number;
  onRest: () => void;
}

export function Inn({ gold, level, currentHealth, maxHealth, currentResource, maxResource, onRest }: InnProps) {
  const restCost = getRestCost(level);
  const canAffordRest = gold >= restCost;
  const needsRest = currentHealth < maxHealth || currentResource < maxResource;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <Bed className="h-6 w-6 text-blue-500" />
        <h3 className="text-xl font-bold">Taverna</h3>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">Descanse para recuperar vida e mana ou estamina.</p>
        <p className="font-medium text-yellow-600">Custo: {restCost} ouros</p>
      </div>

      <button
        onClick={onRest}
        disabled={!canAffordRest || !needsRest}
        className={`w-full rounded-lg px-4 py-2 text-white transition-colors ${
          canAffordRest && needsRest
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'cursor-not-allowed bg-gray-400'
        }`}
      >
        {!needsRest
          ? 'Vida e recurso completos'
          : !canAffordRest
            ? 'Ouro insuficiente'
            : 'Descansar e recuperar'}
      </button>
    </div>
  );
}
