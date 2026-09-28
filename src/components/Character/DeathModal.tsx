import { Skull } from 'lucide-react';

interface DeathModalProps {
  characterName: string;
  killedBy: string;
  gold: number;
  onRespawn: () => void;
  onCreateNew: () => void;
}

export function DeathModal({ characterName, killedBy, gold, onRespawn, onCreateNew }: DeathModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="death-title">
      <div className="relative z-[101] rpg-panel rounded-lg p-6 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Skull className="w-16 h-16 text-red-700" aria-hidden="true" />
        </div>
        <h2 id="death-title" className="text-2xl font-black mb-4 text-stone-950">Seu herói morreu</h2>
        <p className="text-stone-700 mb-6">
          {characterName} foi derrotado por {killedBy}.
        </p>
        <div className="space-y-3">
          <button
            onClick={onRespawn}
            disabled={gold < 100}
            className="rpg-button-primary w-full"
          >
            Renascer na cidade (Custo: 100 Ouros)
          </button>
          {gold < 100 && <p className="text-sm text-red-700">Você tem {gold} ouros. São necessários 100 para renascer.</p>}
          <button
            onClick={onCreateNew}
            className="rpg-button-secondary w-full"
          >
            Criar novo personagem
          </button>
        </div>
      </div>
    </div>
  );
}
