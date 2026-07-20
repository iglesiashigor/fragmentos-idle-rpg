import { Bed } from 'lucide-react';

interface InnProps {
  gold: number;
  currentHealth: number;
  maxHealth: number;
  onRest: () => void;
}

const REST_COST = 50;

export function Inn({ gold, currentHealth, maxHealth, onRest }: InnProps) {
  const canAffordRest = gold >= REST_COST;
  const needsRest = currentHealth < maxHealth;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <Bed className="h-6 w-6 text-blue-500" />
        <h3 className="text-xl font-bold">Taverna</h3>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">Descanse para recuperar sua vida.</p>
        <p className="font-medium text-yellow-600">Custo: {REST_COST} ouros</p>
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
          ? 'Você está curado'
          : !canAffordRest
            ? 'Ouro insuficiente'
            : 'Descansar e recuperar'}
      </button>
    </div>
  );
}
