import { useState } from 'react';
import { SavedCharacter } from '../../types/game';
import { Crown, Plus, Swords, Trash2, UserCircle2 } from 'lucide-react';

interface CharacterSelectionProps {
  characters: SavedCharacter[];
  onSelectCharacter: (character: SavedCharacter) => void;
  onCreateNew: () => void;
  onDeleteCharacter: (characterId: string) => void;
}

export function CharacterSelection({
  characters,
  onSelectCharacter,
  onCreateNew,
  onDeleteCharacter,
}: CharacterSelectionProps) {
  const MAX_CHARACTERS = 5;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (characterId: string) => {
    setShowDeleteConfirm(characterId);
  };

  const handleConfirmDelete = (characterId: string) => {
    onDeleteCharacter(characterId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="rpg-panel w-full max-w-3xl rounded-lg p-8">
        <div className="mb-6 flex items-center justify-center gap-3 text-stone-950">
          <Crown className="h-7 w-7 text-amber-600" />
          <h2 className="text-3xl font-black">Seus Personagens</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="rpg-item relative rounded-lg"
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
                  <div className="flex-shrink-0 mr-4">
                    <UserCircle2 className="w-12 h-12 text-amber-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl text-stone-950">{character.name}</h3>
                    <p className="text-sm font-medium text-stone-600">
                      Nível {character.level} {character.race.name}{' '}
                      {character.class.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteClick(character.id)}
                      className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Excluir personagem"
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
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-300 p-4 font-semibold text-stone-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-stone-950"
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
