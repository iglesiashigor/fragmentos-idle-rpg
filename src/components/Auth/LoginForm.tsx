import React, { useState } from 'react';
import { Castle, User } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
}

export function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="rpg-panel w-full max-w-md rounded-lg p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-amber-300">
            <Castle className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-black text-stone-950">
          Fragmentos
        </h1>
        <h2 className="mb-6 mt-2 text-center text-lg font-semibold text-stone-600">
          {isRegistering ? 'Criar Conta' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-stone-700"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-stone-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>
          <button
            type="submit"
            className="rpg-button-primary w-full"
          >
            <User className="h-4 w-4" />
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full rounded-md px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950"
          >
            {isRegistering
              ? 'Já tem uma conta? Entre'
              : 'Não tem uma conta? Cadastre-se'}
          </button>
        </form>
      </div>
    </div>
  );
}
