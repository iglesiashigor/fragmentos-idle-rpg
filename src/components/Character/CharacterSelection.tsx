import { useState } from 'react';
import { SavedCharacter } from '../../types/game';
import { Crown, LogOut, Plus, Swords, Trash2, UserCircle2 } from 'lucide-react';

interface CharacterSelectionProps {
  characters: SavedCharacter[];
  onSelectCharacter: (character: SavedCharacter) => void;
  onCreateNew: () => void;
  onDeleteCharacter: (characterId: string) => Promise<boolean>;
  onLogout: () => void;
}

export function CharacterSelection({
  characters,
  onSelectCharacter,
  onCreateNew,
  onDeleteCharacter,
  onLogout,
}: CharacterSelectionProps) {
  const MAX_CHARACTERS = 5;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (characterId: string) => {
    setShowDeleteConfirm(characterId);
  };

  const handleConfirmDelete = async (characterId: string) => {
    if (await onDeleteCharacter(characterId)) setShowDeleteConfirm(null);
  };

  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="rpg-panel w-full max-w-4xl rounded-2xl p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-amber-800">Fragmentos · Aventureiros</p>
            <div className="mb-2 flex items-center gap-3 text-stone-950">
              <Crown className="h-7 w-7 text-amber-600" aria-hidden="true" />
              <h1 className="text-3xl font-black sm:text-4xl">Seus personagens</h1>
            </div>
            <p className="text-sm text-stone-600">Escolha quem vai explorar o mundo de Fragmentos.</p>
          </div>
          <button onClick={onLogout} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200 hover:text-stone-950">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sair
          </button>
        </div>

        {characters.length === 0 && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm font-semibold text-stone-700">
            Sua aventura começa com um personagem. Crie o primeiro para jogar.
          </p>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3">
          {characters.map((character) => (
            <div
              key={character.id}
              className="rpg-item relative rounded-xl"
            >
              {showDeleteConfirm === character.id ? (
                <div className="p-4">
                  <p className="text-center font-semibold text-stone-700 mb-4">
                    Tem certeza que deseja excluir {character.name}?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleConfirmDelete(character.id)}
                      className="rpg-button-danger"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="rpg-button-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-100">
                    <UserCircle2 className="h-8 w-8 text-amber-800" aria-hidden="true" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl text-stone-950">{character.name}</h3>
                    <p className="text-sm font-medium text-stone-600">
                      {character.race.name} · {character.class.name}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-black text-stone-700">Nível {character.level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteClick(character.id)}
                      className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Excluir personagem"
                      aria-label={`Excluir ${character.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onSelectCharacter(character)}
                      className="rpg-button-primary"
                    >
                      <Swords className="w-5 h-5" />
                      <span>Jogar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {characters.length < MAX_CHARACTERS && (
            <button
              onClick={onCreateNew}
              className="flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white/50 p-4 font-semibold text-stone-600 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-stone-950"
            >
              <Plus className="w-6 h-6 mr-2" />
              <span>Criar Novo Personagem</span>
            </button>
          )}
        </div>

        <div className="text-center text-sm font-medium text-stone-500">
          {characters.length} de {MAX_CHARACTERS} personagens criados
        </div>
      </div>
    </div>
  );
}
