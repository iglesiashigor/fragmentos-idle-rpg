import {
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import { SavedCharacter } from '../types/game';
import { getJourneySummary } from '../utils/journey';

interface TutorialModalProps {
  character: SavedCharacter;
  onClose: () => void;
  onDismiss: () => void;
}

export function TutorialModal({ character, onClose, onDismiss }: TutorialModalProps) {
  const summary = getJourneySummary(character);
  const progress = Math.round((summary.completed / summary.total) * 100);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-950/75 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-amber-200 bg-stone-50 shadow-2xl">
        <div className="border-b border-stone-200 bg-stone-950 px-5 py-4 text-white sm:px-6">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-amber-500 text-stone-950">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-amber-300">
                Tutorial guiado
              </div>
              <h2 className="mt-1 text-2xl font-black">Jornada v0.1</h2>
              <p className="mt-1 text-sm font-semibold text-stone-300">
                Acompanhe os primeiros passos do jogo ou siga sozinho quando preferir.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <aside className="mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-lg font-black text-stone-950">Primeiros passos</h3>
            <p className="mt-1 text-sm font-semibold text-stone-600">
              Você pode abrir esta janela novamente pelo botão Tutorial.
            </p>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-black text-stone-600">
                <span>Progresso</span>
                <span>{summary.completed}/{summary.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-amber-600" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {summary.steps.map((step) => {
                const isCurrent = !step.completed && summary.nextStep?.id === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-md border p-3 ${
                      step.completed
                        ? 'border-emerald-200 bg-white'
                        : isCurrent
                          ? 'border-amber-400 bg-white shadow-sm'
                          : 'border-amber-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-amber-600" />
                      )}
                      {step.title}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-stone-600">{step.description}</p>
                    <div className="mt-2 text-xs font-black text-stone-500">
                      {step.progress}/{step.target}
                      {isCurrent ? ' - passo atual' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-md bg-stone-950 px-4 py-3 font-black text-white transition-colors hover:bg-stone-800"
            >
              Continuar tutorial
            </button>
            <button
              onClick={onDismiss}
              className="mt-2 w-full rounded-md border border-stone-300 bg-white px-4 py-3 font-black text-stone-700 transition-colors hover:bg-stone-100"
            >
              Seguir sozinho
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
