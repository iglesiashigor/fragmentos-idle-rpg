import { FormEvent, useState } from 'react';
import { Castle, Compass, Eye, EyeOff, Sparkles, Swords } from 'lucide-react';
import type { AuthFeedback } from '../../hooks/useAuth';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<AuthFeedback>;
  onRegister: (email: string, password: string) => Promise<AuthFeedback>;
}

export function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setFeedback(null);
    setIsSubmitting(true);
    try {
      setFeedback(await (isRegistering ? onRegister(email.trim(), password) : onLogin(email.trim(), password)));
    } catch {
      setFeedback({ type: 'error', message: 'Não foi possível conectar agora. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:py-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-amber-100/20 bg-stone-950 shadow-2xl shadow-black/40 lg:min-h-[620px] lg:grid-cols-[1.08fr_0.92fr]">
        <section
          className="relative flex min-h-[260px] flex-col justify-between bg-cover bg-center p-7 text-white sm:p-10 lg:min-h-[620px]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(13, 20, 19, .7), rgba(13, 20, 19, .22) 42%, rgba(13, 20, 19, .88)), url(/world-map.webp)' }}
        >
          <div className="flex items-center gap-3 text-amber-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/40 bg-stone-950/70">
              <Castle className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="text-xl font-black tracking-wide">FRAGMENTOS</span>
          </div>
          <div className="max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-stone-950/65 px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-amber-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Sua jornada começa aqui
            </div>
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Forje seu caminho entre ruínas e lendas.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-stone-100 sm:text-base">
              Explore o mapa, vença combates, reúna recursos e evolua seu aventureiro a cada jornada.
            </p>
            <div className="mt-7 hidden flex-wrap gap-2 sm:flex">
              <span className="rounded-full border border-white/20 bg-stone-950/60 px-3 py-1.5 text-xs font-bold text-stone-100">Combate por turnos</span>
              <span className="rounded-full border border-white/20 bg-stone-950/60 px-3 py-1.5 text-xs font-bold text-stone-100">Missões e coleta</span>
              <span className="rounded-full border border-white/20 bg-stone-950/60 px-3 py-1.5 text-xs font-bold text-stone-100">Evolução contínua</span>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#f5f0e6] px-6 py-9 sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              {isRegistering ? <Compass className="h-6 w-6" aria-hidden="true" /> : <Swords className="h-6 w-6" aria-hidden="true" />}
            </div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-800">{isRegistering ? 'Novo aventureiro' : 'Bem-vindo de volta'}</p>
            <h2 className="mt-2 text-3xl font-black text-stone-950">{isRegistering ? 'Crie sua conta' : 'Continue sua aventura'}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {isRegistering ? 'Crie uma conta para guardar seus personagens e seu progresso.' : 'Entre para voltar aos seus personagens.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-stone-800">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-950 shadow-sm outline-none transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                  placeholder="voce@exemplo.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-stone-800">Senha</label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 pr-12 text-stone-950 shadow-sm outline-none transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                    minLength={isRegistering ? 6 : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-500 hover:text-stone-900"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                {isRegistering && <p className="mt-2 text-xs text-stone-600">Use pelo menos 6 caracteres.</p>}
              </div>

              {feedback && (
                <p role={feedback.type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                  {feedback.message}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="rpg-button-primary w-full py-3 text-base">
                {isSubmitting ? 'Aguarde...' : isRegistering ? 'Criar conta' : 'Entrar no jogo'}
              </button>
            </form>

            <div className="mt-7 border-t border-stone-300 pt-6 text-center text-sm text-stone-600">
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setFeedback(null); setShowPassword(false); }}
                className="font-black text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline"
              >
                {isRegistering ? 'Entre aqui' : 'Comece sua jornada'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
