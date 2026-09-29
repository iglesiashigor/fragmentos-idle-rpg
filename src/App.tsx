import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { LoginForm } from './components/Auth/LoginForm';
import { GameContent } from './components/GameContent';
import { CharacterSelection } from './components/Character/CharacterSelection';
import { CharacterCreation } from './components/Character/CharacterCreation';
import { useAuth } from './hooks/useAuth';
import { SavedCharacter, Race, CharacterClass, Attributes } from './types/game';
import { useCharacter } from './hooks/useCharacter';

function App() {
  const { user, isLoading, loadError, saveError, retryLoad, retrySave, login, register, logout, saveCharacter, updateCharacter, deleteCharacter } = useAuth();
  const { createCharacter } = useCharacter();
  const [activeCharacter, setActiveCharacter] = useState<SavedCharacter | null>(null);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);

  if (isLoading) {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center text-stone-100" role="status">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-300/30 border-t-amber-300" />
          <p className="font-semibold">Carregando sua aventura...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center px-4">
        <div className="rpg-panel w-full max-w-md rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-700" aria-hidden="true" />
          <h1 className="text-2xl font-black text-stone-950">Sua aventura está segura</h1>
          <p className="mt-3 text-sm text-stone-700" role="alert">{loadError}</p>
          <p className="mt-2 text-sm text-stone-600">Nenhum personagem foi alterado. Tente carregar novamente.</p>
          <button className="rpg-button-primary mt-6 w-full" onClick={retryLoad}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </button>
          <button className="mt-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-950" onClick={logout}>
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  const handleCreateNew = () => {
    setActiveCharacter(null);
    setShowCharacterCreation((user?.characters.length ?? 0) < 5);
  };

  const handleBackToSelection = () => {
    setActiveCharacter(null);
    setShowCharacterCreation(false);
  };

  if (showCharacterCreation) {
    const handleCreateCharacter = async (name: string, race: Race, characterClass: CharacterClass, attributes: Attributes) => {
      const newCharacter = createCharacter(name, race, characterClass, attributes);
      const savedCharacter: SavedCharacter = {
        ...newCharacter,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      if (await saveCharacter(savedCharacter)) {
        setShowCharacterCreation(false);
      }
    };

    return (
      <CharacterCreation
        onCreateCharacter={handleCreateCharacter}
        onBack={handleBackToSelection}
      />
    );
  }

  if (!activeCharacter) {
    return (
      <CharacterSelection
        characters={user.characters}
        onSelectCharacter={setActiveCharacter}
        onCreateNew={() => handleCreateNew()}
        onDeleteCharacter={deleteCharacter}
        onLogout={logout}
      />
    );
  }

  return (
    <>
      {saveError && (
        <div className="app-bg px-4 pt-4" role="alert">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
            <span>{saveError}</span>
            <button className="rpg-button-secondary" onClick={retrySave}>Tentar salvar novamente</button>
          </div>
        </div>
      )}
      <GameContent
        character={activeCharacter}
        onCharacterUpdate={updateCharacter}
        onBackToSelection={handleBackToSelection}
        onLogout={() => {
          setActiveCharacter(null);
          logout();
        }}
        onCreateNew={handleCreateNew}
      />
    </>
  );
}

export default App;
