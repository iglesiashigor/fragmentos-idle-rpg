import { ArrowLeft, LogOut, Shield, User } from 'lucide-react';

interface UserProfileProps {
  username: string;
  onLogout: () => void;
  onBackToSelection: () => void;
}

export function UserProfile({ username, onLogout, onBackToSelection }: UserProfileProps) {
  return (
    <header className="rpg-panel-dark rounded-xl p-4 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-300">
            <Shield className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="border-r border-stone-600 pr-4">
            <div className="font-serif text-lg font-bold tracking-wide text-amber-100">Fragmentos</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Idle RPG</div>
          </div>
          <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-stone-950">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Personagem ativo
            </div>
            <span className="font-bold text-stone-50">{username}</span>
          </div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Conta e personagem">
          <button
            type="button"
            onClick={onBackToSelection}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-600 px-3 py-2 text-sm font-semibold text-stone-200 transition-colors hover:border-amber-400 hover:bg-stone-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Personagens
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/60 hover:text-red-100"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
