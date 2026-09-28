import { Castle, LogOut, User } from 'lucide-react';

interface UserProfileProps {
  username: string;
  onLogout: () => void;
  onBackToSelection: () => void;
}

export function UserProfile({ username, onLogout, onBackToSelection }: UserProfileProps) {
  return (
    <header className="rpg-panel-dark rounded-2xl px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-500/15 text-amber-300">
            <Castle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-black leading-tight text-amber-100">Fragmentos</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
              <User className="h-3 w-3" />
              {username}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToSelection}
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
    </header>
  );
}
