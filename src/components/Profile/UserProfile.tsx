import { LogOut, User } from 'lucide-react';

interface UserProfileProps {
  username: string;
  onLogout: () => void;
}

export function UserProfile({ username, onLogout }: UserProfileProps) {
  const handleBackToSelection = () => {
    // Force reload the page to go back to character selection
    window.location.reload();
  };

  return (
    <div className="rpg-panel-dark rounded-lg p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-stone-950">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Personagem ativo
            </div>
            <span className="font-bold text-stone-50">{username}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleBackToSelection}
            className="rounded-md px-3 py-2 text-sm font-semibold text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-50"
          >
            Seleção de Personagem
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/60 hover:text-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
