import { FormEvent, ReactNode, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Dumbbell,
  Shield,
  Sparkles,
  Sword,
  Target,
} from 'lucide-react';
import { CLASSES } from '../../data/classes';
import { CLASS_PASSIVE_DESCRIPTIONS } from '../../data/classPassives';
import { RACES } from '../../data/races';
import { Attributes, CharacterClass, Race } from '../../types/game';
import { CREATION_ATTRIBUTE_POINTS } from '../../utils/attributes';

const MIN_ATTRIBUTE_VALUE = 0;
const MAX_ATTRIBUTE_VALUE = 10;
const STEPS = ['Raça', 'Classe', 'Atributos'] as const;
const ATTRIBUTE_NAMES: Record<keyof Attributes, string> = {
  strength: 'Força',
  effort: 'Esforço',
  resistance: 'Resistência',
  intelligence: 'Inteligência',
  accuracy: 'Acurácia',
};

interface CharacterCreationProps {
  onCreateCharacter: (
    name: string,
    race: Race,
    characterClass: CharacterClass,
    attributes: Attributes
  ) => Promise<void>;
  onBack: () => void;
}

export function CharacterCreation({
  onCreateCharacter,
  onBack,
}: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race>(RACES[0]);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(
    CLASSES[0]
  );
  const [attributes, setAttributes] = useState<Attributes>({
    strength: 0,
    effort: 0,
    resistance: 0,
    intelligence: 0,
    accuracy: 0,
  });

  const usedPoints =
    attributes.strength +
    attributes.effort +
    attributes.resistance +
    attributes.intelligence +
    attributes.accuracy;

  const remainingPoints = CREATION_ATTRIBUTE_POINTS - usedPoints;
  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleAttributeChange = (
    attribute: keyof Attributes,
    value: number
  ) => {
    if (value < MIN_ATTRIBUTE_VALUE || value > MAX_ATTRIBUTE_VALUE) return;

    const pointDifference = value - attributes[attribute];
    if (remainingPoints - pointDifference < 0) return;

    setAttributes((prev) => ({
      ...prev,
      [attribute]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      if (step > 0 || name.trim()) goToStep(step + 1);
      return;
    }
    if (name.trim() && remainingPoints === 0 && !isSaving) {
      setIsSaving(true);
      try {
        await onCreateCharacter(name.trim(), selectedRace, selectedClass, attributes);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const renderAttributeControl = (
    attribute: keyof Attributes,
    label: string,
    icon: ReactNode,
    description: string
  ) => {
    const baseValue = attributes[attribute];
    const modifier = selectedClass.attributeModifiers[attribute];
    const modifiedValue = Math.round(baseValue * modifier);

    return (
      <div className="rounded-md border border-stone-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            {icon}
            <span>{label}</span>
          </div>
          <div className="text-sm font-semibold text-stone-500">{baseValue} pontos</div>
        </div>
        <p className="mb-3 text-xs text-stone-600">{description}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAttributeChange(attribute, baseValue - 1)}
            aria-label={`Diminuir ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-700 font-bold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={baseValue <= MIN_ATTRIBUTE_VALUE}
          >
            -
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-2 bg-amber-600"
              style={{ width: `${(baseValue / MAX_ATTRIBUTE_VALUE) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleAttributeChange(attribute, baseValue + 1)}
            aria-label={`Aumentar ${label}`}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={baseValue >= MAX_ATTRIBUTE_VALUE || remainingPoints <= 0}
          >
            +
          </button>
        </div>
        <div className="mt-2 text-right text-xs font-semibold text-amber-800">
          Valor com ajuste da classe: {modifiedValue}
        </div>
      </div>
    );
  };

  return (
    <div className="app-bg">
      <div className="page-wrap">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rpg-panel-dark rounded-lg p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  Novo aventureiro
                </div>
                <h1 className="mt-1 text-3xl font-black text-white">
                  Criar Personagem
                </h1>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-800 px-4 py-2 font-semibold text-stone-200 transition-colors hover:bg-stone-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            </div>
          </div>

          <nav aria-label="Etapas da criação" className="grid grid-cols-3 gap-2">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(index)}
                disabled={index > step}
                aria-current={index === step ? 'step' : undefined}
                className={`rounded-lg border px-2 py-3 text-sm font-bold transition-colors sm:text-base ${
                  index === step
                    ? 'border-amber-600 bg-amber-100 text-stone-900'
                    : index < step
                      ? 'border-stone-300 bg-[#f7eedb] text-stone-700 hover:bg-amber-50'
                      : 'border-stone-200 bg-stone-100 text-stone-400'
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </nav>

          <div className="rpg-panel rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">Seu aventureiro</div>
                <div className="text-xl font-black text-stone-950">{name.trim() || 'Sem nome'}</div>
                <div className="text-sm font-semibold text-stone-600">{selectedRace.name} · {selectedClass.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <SummaryTile label="Vida base" value={selectedClass.baseHealth + selectedRace.bonuses.health} />
                <SummaryTile label="Recurso base" value={selectedClass.baseResource} />
                <SummaryTile label="Pontos livres" value={remainingPoints} />
              </div>
            </div>
          </div>

          {step === 0 && <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="rpg-panel rounded-lg p-5">
              <label htmlFor="character-name" className="mb-2 block text-sm font-bold text-stone-700">
                Nome do Personagem
              </label>
              <input
                id="character-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-semibold shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
              <p className="mt-3 text-sm text-stone-600">Escolha um nome para aparecer nas suas aventuras.</p>
            </div>

            <div className="rpg-panel rounded-lg p-5">
              <SectionTitle title="Raça" subtitle="Escolha a origem do personagem" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {RACES.map((race) => (
                  <button
                    key={race.id}
                    type="button"
                    onClick={() => setSelectedRace(race)}
                    aria-pressed={selectedRace.id === race.id}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selectedRace.id === race.id
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <h3 className="font-black text-stone-950">{race.name}</h3>
                    <p className="mt-1 text-sm text-stone-600">{race.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-stone-600">
                      <span>Vida +{race.bonuses.health}</span>
                      <span>Dano +{race.bonuses.damage}</span>
                      <span>Defesa +{race.bonuses.defense}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>}

          {step === 1 && <div className="rpg-panel rounded-lg p-5">
            <SectionTitle title="Classe" subtitle="Define estilo de combate e evolução" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {CLASSES.map((characterClass) => (
                <button
                  key={characterClass.id}
                  type="button"
                  onClick={() => setSelectedClass(characterClass)}
                  aria-pressed={selectedClass.id === characterClass.id}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    selectedClass.id === characterClass.id
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  <h3 className="font-black text-stone-950">
                    {characterClass.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {characterClass.description}
                  </p>
                  <div className="mt-3 text-xs font-semibold text-stone-600">
                    <div>Vida base: {characterClass.baseHealth}</div>
                    <div>Recurso: {characterClass.baseResource}</div>
                    <div>Ouro inicial: {characterClass.startingGold}</div>
                    <div className="mt-2 text-emerald-700">
                      Passiva: {CLASS_PASSIVE_DESCRIPTIONS[characterClass.id]}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(characterClass.attributeModifiers)
                        .filter(([, modifier]) => modifier !== 1)
                        .map(([attribute, modifier]) => (
                          <span key={attribute} className={`rounded px-2 py-1 ${modifier > 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                            {ATTRIBUTE_NAMES[attribute as keyof Attributes]} ×{modifier}
                          </span>
                        ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>}

          {step === 2 && <>
          <div className="rpg-panel rounded-lg p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle title="Atributos" subtitle="Distribua todos os pontos disponíveis" />
              <span aria-live="polite"
                className={`rounded-md px-3 py-2 text-sm font-black ${
                  remainingPoints === 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                Pontos restantes: {remainingPoints}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {renderAttributeControl('strength', 'Força', <Sword className="h-4 w-4" />, 'Aumenta o ataque físico.')}
              {renderAttributeControl('effort', 'Esforço', <Dumbbell className="h-4 w-4" />, 'Aumenta ataque e recurso.')}
              {renderAttributeControl('resistance', 'Resistência', <Shield className="h-4 w-4" />, 'Aumenta vida e defesa.')}
              {renderAttributeControl('intelligence', 'Inteligência', <Brain className="h-4 w-4" />, 'Aumenta magia e recurso.')}
              {renderAttributeControl('accuracy', 'Acurácia', <Target className="h-4 w-4" />, 'Aumenta chance crítica e magia.')}
            </div>
          </div>

          <div className="rpg-panel rounded-lg p-5">
            <SectionTitle title="Profissões" subtitle="Todas evoluem conforme os pontos de coleta usados" />
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
              Lenhador, Coletor, Minerador e Explorador ficam disponíveis desde o início. Cada uma ganha XP no ponto de coleta correspondente.
            </div>
          </div>

          </>}

          <div className="flex gap-3">
          {step > 0 && <button
            type="button"
            onClick={() => goToStep(step - 1)}
            className="rounded-md border border-stone-400 bg-[#f7eedb] px-5 py-3 font-bold text-stone-800 hover:bg-amber-50"
          >
            Voltar etapa
          </button>}
          <button
            type="submit"
            disabled={!name.trim() || (step === 2 && remainingPoints !== 0) || isSaving}
            className="rpg-button-primary flex-1 py-3 text-lg"
          >
            {isSaving
              ? 'Salvando personagem...'
              : !name.trim()
              ? 'Digite um nome'
              : step < 2
                ? `Continuar: ${STEPS[step + 1]}`
                : remainingPoints !== 0
                ? `Distribua os ${remainingPoints} pontos restantes`
                : 'Criar Personagem'}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black text-stone-950">{title}</h2>
      <p className="text-sm font-semibold text-stone-500">{subtitle}</p>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-white p-2">
      <div className="text-xs font-semibold text-stone-500">{label}</div>
      <div className="font-black text-stone-950">{value}</div>
    </div>
  );
}
