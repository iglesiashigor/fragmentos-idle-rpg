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

const TOTAL_ATTRIBUTE_POINTS = 10;
const MIN_ATTRIBUTE_VALUE = 0;
const MAX_ATTRIBUTE_VALUE = 10;

interface CharacterCreationProps {
  onCreateCharacter: (
    name: string,
    race: Race,
    characterClass: CharacterClass,
    attributes: Attributes
  ) => void;
  onBack: () => void;
}

export function CharacterCreation({
  onCreateCharacter,
  onBack,
}: CharacterCreationProps) {
  const [name, setName] = useState('');
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

  const remainingPoints = TOTAL_ATTRIBUTE_POINTS - usedPoints;

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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() && remainingPoints === 0) {
      onCreateCharacter(name, selectedRace, selectedClass, attributes);
    }
  };

  const renderAttributeControl = (
    attribute: keyof Attributes,
    label: string,
    icon: ReactNode
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
          <div className="text-sm font-semibold text-stone-500">
            {baseValue} <span className="text-amber-700">â†’ {modifiedValue}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAttributeChange(attribute, baseValue - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-700 font-bold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
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
            className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={baseValue >= MAX_ATTRIBUTE_VALUE || remainingPoints <= 0}
          >
            +
          </button>
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

          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="rpg-panel rounded-lg p-5">
              <label className="mb-2 block text-sm font-bold text-stone-700">
                Nome do Personagem
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-semibold shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />

              <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-bold uppercase tracking-wide text-amber-700">
                  Resumo
                </div>
                <div className="mt-2 text-xl font-black text-stone-950">
                  {name.trim() || 'Sem nome'}
                </div>
                <div className="font-semibold text-stone-600">
                  {selectedRace.name} {selectedClass.name}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <SummaryTile label="Vida" value={selectedClass.baseHealth + selectedRace.bonuses.health} />
                  <SummaryTile label="Recurso" value={selectedClass.baseResource} />
                  <SummaryTile label="Ouro" value={selectedClass.startingGold} />
                  <SummaryTile label="Pontos" value={remainingPoints} />
                </div>
              </div>
            </div>

            <div className="rpg-panel rounded-lg p-5">
              <SectionTitle title="Raça" subtitle="Escolha a origem do personagem" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {RACES.map((race) => (
                  <button
                    key={race.id}
                    type="button"
                    onClick={() => setSelectedRace(race)}
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
          </div>

          <div className="rpg-panel rounded-lg p-5">
            <SectionTitle title="Classe" subtitle="Define estilo de combate e evolução" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {CLASSES.map((characterClass) => (
                <button
                  key={characterClass.id}
                  type="button"
                  onClick={() => setSelectedClass(characterClass)}
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
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rpg-panel rounded-lg p-5">
            <SectionTitle title="Profissões" subtitle="Todas evoluem conforme os pontos de coleta usados" />
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
              Lenhador, Coletor, Minerador e Explorador ficam disponíveis desde o início. Cada uma ganha XP no ponto de coleta correspondente.
            </div>
          </div>

          <div className="rpg-panel rounded-lg p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle title="Atributos" subtitle="Distribua todos os pontos disponíveis" />
              <span
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
              {renderAttributeControl('strength', 'Força', <Sword className="h-4 w-4" />)}
              {renderAttributeControl('effort', 'Esforço', <Dumbbell className="h-4 w-4" />)}
              {renderAttributeControl('resistance', 'Resistência', <Shield className="h-4 w-4" />)}
              {renderAttributeControl('intelligence', 'Inteligência', <Brain className="h-4 w-4" />)}
              {renderAttributeControl('accuracy', 'Acurácia', <Target className="h-4 w-4" />)}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || remainingPoints !== 0}
            className="rpg-button-primary w-full py-3 text-lg"
          >
            {!name.trim()
              ? 'Digite um nome'
              : remainingPoints !== 0
                ? `Distribua os ${remainingPoints} pontos restantes`
                : 'Criar Personagem'}
          </button>
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
