import { ReactNode, useState } from 'react';
import { Award, Backpack, BarChart3, Hammer, Info } from 'lucide-react';
import { TITLE_ACHIEVEMENTS } from '../../data/achievements';
import {
  getProfessionRequiredExperience,
  MAX_PROFESSION_LEVEL,
  PROFESSIONS,
} from '../../data/professions';
import { Attributes, Equipment, InventoryItem, SavedCharacter } from '../../types/game';
import { InventoryPanel } from '../Inventory/InventoryPanel';

type CharacterTabId = 'inventory' | 'attributes' | 'professions' | 'achievements';

interface CharacterTabsProps {
  character: SavedCharacter;
  equipment: Equipment;
  inventory: InventoryItem[];
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (slot: 'weapon' | 'armor') => void;
  onUsePotion: (item: InventoryItem) => void;
  onSetActiveTitle: (titleId?: string) => void;
}

export function CharacterTabs({
  character,
  equipment,
  inventory,
  onEquipItem,
  onUnequipItem,
  onUsePotion,
  onSetActiveTitle,
}: CharacterTabsProps) {
  const [activeTab, setActiveTab] = useState<CharacterTabId>('inventory');

  return (
    <div className="rpg-panel rounded-lg p-4">
      <div className="mb-4 grid grid-cols-4 gap-2">
        <SidebarTab
          label="Inventário"
          active={activeTab === 'inventory'}
          icon={<Backpack className="h-4 w-4" />}
          onClick={() => setActiveTab('inventory')}
        />
        <SidebarTab
          label="Atributos"
          active={activeTab === 'attributes'}
          icon={<BarChart3 className="h-4 w-4" />}
          onClick={() => setActiveTab('attributes')}
        />
        <SidebarTab
          label="Profissões"
          active={activeTab === 'professions'}
          icon={<Hammer className="h-4 w-4" />}
          onClick={() => setActiveTab('professions')}
        />
        <SidebarTab
          label="Conquistas"
          active={activeTab === 'achievements'}
          icon={<Award className="h-4 w-4" />}
          onClick={() => setActiveTab('achievements')}
        />
      </div>

      {activeTab === 'inventory' ? (
        <InventoryPanel
          inventory={inventory}
          equipment={equipment}
          onEquipItem={onEquipItem}
          onUnequipItem={onUnequipItem}
          onUsePotion={onUsePotion}
          currentHealth={character.health}
          maxHealth={character.maxHealth}
          framed={false}
        />
      ) : activeTab === 'attributes' ? (
        <AttributesPanel attributes={character.attributes} />
      ) : activeTab === 'professions' ? (
        <ProfessionProgressPanel character={character} />
      ) : (
        <AchievementPanel
          character={character}
          onSetActiveTitle={onSetActiveTitle}
        />
      )}
    </div>
  );
}

function SidebarTab({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-black transition-colors ${
        active
          ? 'bg-stone-950 text-white'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

const ATTRIBUTE_INFO: Array<{
  key: keyof Attributes;
  name: string;
  description: string;
  effects: string[];
}> = [
  {
    key: 'strength',
    name: 'Força',
    description: 'Principal atributo para dano físico.',
    effects: ['Aumenta ataque básico.', 'Aumenta dano de habilidades físicas.'],
  },
  {
    key: 'effort',
    name: 'Esforço',
    description: 'Representa vigor e fôlego em combate.',
    effects: ['Aumenta ataque físico em menor escala.', 'Aumenta mana/estamina máxima.'],
  },
  {
    key: 'resistance',
    name: 'Resistência',
    description: 'Principal atributo defensivo.',
    effects: ['Aumenta vida máxima.', 'Aumenta defesa e reduz dano recebido.'],
  },
  {
    key: 'intelligence',
    name: 'Inteligência',
    description: 'Principal atributo para personagens mágicos.',
    effects: ['Aumenta poder mágico.', 'Aumenta mana/estamina máxima em menor escala.'],
  },
  {
    key: 'accuracy',
    name: 'Acurácia',
    description: 'Define precisão, chance crítica e controle ofensivo.',
    effects: ['Aumenta chance de crítico.', 'Aumenta um pouco o poder mágico.'],
  },
];

function AttributesPanel({ attributes }: { attributes: Attributes }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-black text-stone-950">Atributos</h2>
        <p className="text-sm font-medium text-stone-500">
          Veja onde cada ponto impacta seu personagem.
        </p>
      </div>

      <div className="space-y-3">
        {ATTRIBUTE_INFO.map((attribute) => (
          <div
            key={attribute.key}
            className="rounded-md border border-stone-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-stone-950">{attribute.name}</h3>
                  <Info
                    className="h-4 w-4 text-stone-400"
                    aria-label={attribute.description}
                  />
                </div>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {attribute.description}
                </p>
              </div>
              <div className="rounded-md bg-stone-950 px-3 py-1 text-sm font-black text-white">
                {attributes[attribute.key]}
              </div>
            </div>

            <div className="mt-3 space-y-1">
              {attribute.effects.map((effect) => (
                <div
                  key={effect}
                  className="flex items-start gap-2 text-xs font-semibold text-stone-600"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{effect}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfessionProgressPanel({ character }: { character: SavedCharacter }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-black text-stone-950">Profissões</h2>
        <p className="text-sm font-medium text-stone-500">
          Evoluem quando você coleta nos pontos do mapa.
        </p>
      </div>

      <div className="space-y-3">
        {PROFESSIONS.map((profession) => {
          const progressData = character.professions?.[profession.id] || {
            id: profession.id,
            level: 1,
            experience: 0,
          };
          const requiredExperience = getProfessionRequiredExperience(
            progressData.level
          );
          const isMaxLevel = progressData.level >= MAX_PROFESSION_LEVEL;
          const progress = Math.min(
            100,
            isMaxLevel || requiredExperience === 0
              ? 100
              : (progressData.experience / requiredExperience) * 100
          );

          return (
            <div key={profession.id} className="rounded-md border border-stone-200 bg-white p-3">
              <div className="flex justify-between gap-3 text-sm font-bold text-stone-950">
                <span>{profession.name}</span>
                <span>Nv. {progressData.level}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                {profession.description}
              </p>
              <div className="mt-3 flex justify-between text-xs font-bold text-stone-600">
                <span>Experiência</span>
                <span>
                  {isMaxLevel
                    ? 'Máximo'
                    : `${progressData.experience}/${requiredExperience}`}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementPanel({
  character,
  onSetActiveTitle,
}: {
  character: SavedCharacter;
  onSetActiveTitle: (titleId?: string) => void;
}) {
  const unlocked = new Set(character.unlockedTitleIds || []);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-black text-stone-950">Conquistas</h2>
        <p className="text-sm font-medium text-stone-500">
          Tags permanentes do personagem.
        </p>
        <button
          onClick={() => onSetActiveTitle(undefined)}
          className="rpg-button-secondary mt-3 w-full"
        >
          Remover título ativo
        </button>
      </div>

      <div className="space-y-3">
        {TITLE_ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked.has(achievement.id);
          const isActive = character.activeTitleId === achievement.id;

          return (
            <div
              key={achievement.id}
              className={`rounded-md border p-3 ${
                isUnlocked
                  ? 'border-amber-200 bg-white'
                  : 'border-stone-200 bg-stone-100 opacity-70'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wide text-amber-700">
                {achievement.title}
              </div>
              <h3 className="font-black text-stone-950">{achievement.name}</h3>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                {achievement.description}
              </p>
              <button
                onClick={() => onSetActiveTitle(achievement.id)}
                disabled={!isUnlocked || isActive}
                className="rpg-button-primary mt-3 w-full disabled:bg-stone-300 disabled:text-stone-500"
              >
                {isActive ? 'Título ativo' : isUnlocked ? 'Usar título' : 'Bloqueado'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
