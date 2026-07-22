import { ReactNode } from 'react';
import { Backpack, Crown, Hammer, ListChecks, TrendingUp } from 'lucide-react';
import { PROFESSIONS, getProfessionRequiredExperience } from '../data/professions';
import { SavedCharacter } from '../types/game';
import { calculateRequiredExperience } from '../utils/experience';
import {
  EQUIPMENT_SLOTS,
  MAX_INVENTORY_SLOTS,
  getInventorySlotCount,
  isEquipmentItem,
} from '../utils/inventory';

interface ObjectivePanelProps {
  character: SavedCharacter;
  bossAvailable: boolean;
  bossEntryCost: number;
}

export function ObjectivePanel({
  character,
  bossAvailable,
  bossEntryCost,
}: ObjectivePanelProps) {
  const requiredExp = calculateRequiredExperience(character.level);
  const activeQuest = (character.quests || [])[0];
  const nextProfession = PROFESSIONS.map((profession) => {
    const progress = character.professions?.[profession.id] || {
      id: profession.id,
      level: 1,
      experience: 0,
    };
    const required = getProfessionRequiredExperience(progress.level);
    return {
      name: profession.name,
      level: progress.level,
      experience: progress.experience,
      required,
      progress: required > 0 ? progress.experience / required : 1,
    };
  }).sort((a, b) => b.progress - a.progress)[0];
  const bagSlots = getInventorySlotCount(character.inventory);
  const bestUpgrade = [...character.inventory, ...EQUIPMENT_SLOTS.map((slot) => character.equipment[slot]).filter(Boolean)]
    .filter((item) => item && isEquipmentItem(item))
    .sort((a, b) => (b?.upgradeLevel || 0) - (a?.upgradeLevel || 0))[0];

  const questText = activeQuest
    ? activeQuest.objectives
        .map((objective) => `${objective.label || objective.target}: ${Math.min(objective.current, objective.amount)}/${objective.amount}`)
        .join(' | ')
    : 'Pegue uma missão na cidade.';

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <ObjectiveCard
        icon={<ListChecks className="h-5 w-5" />}
        label="Missão"
        title={activeQuest?.name || 'Sem missão ativa'}
        detail={questText}
        tone={activeQuest ? 'emerald' : 'stone'}
      />
      <ObjectiveCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Próximo nível"
        title={`Nv. ${character.level}`}
        detail={`${character.experience}/${requiredExp} XP`}
        tone="amber"
      />
      <ObjectiveCard
        icon={<Hammer className="h-5 w-5" />}
        label="Profissão"
        title={nextProfession ? `${nextProfession.name} Nv. ${nextProfession.level}` : 'Coleta disponível'}
        detail={nextProfession?.required ? `${nextProfession.experience}/${nextProfession.required} XP` : 'Nível máximo alcançado'}
        tone="emerald"
      />
      <ObjectiveCard
        icon={<Crown className="h-5 w-5" />}
        label="Chefão"
        title={bossAvailable ? 'Covil disponível' : 'Covil em recarga'}
        detail={bossAvailable ? `Entrada: ${bossEntryCost} ouro` : 'Volte quando a recarga terminar.'}
        tone={bossAvailable ? 'purple' : 'stone'}
      />
      <ObjectiveCard
        icon={<Backpack className="h-5 w-5" />}
        label="Mochila"
        title={`${bagSlots}/${MAX_INVENTORY_SLOTS} slots`}
        detail={bestUpgrade ? `Melhor item: ${bestUpgrade.name}` : 'Equipe ou venda itens extras.'}
        tone={bagSlots >= MAX_INVENTORY_SLOTS ? 'red' : 'stone'}
      />
    </div>
  );
}

function ObjectiveCard({
  icon,
  label,
  title,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  detail: string;
  tone: 'stone' | 'amber' | 'emerald' | 'purple' | 'red';
}) {
  const toneClass = {
    stone: 'border-stone-700/50 bg-stone-950/80 text-stone-200',
    amber: 'border-amber-400/40 bg-amber-950/70 text-amber-100',
    emerald: 'border-emerald-400/40 bg-emerald-950/70 text-emerald-100',
    purple: 'border-purple-400/40 bg-purple-950/70 text-purple-100',
    red: 'border-red-400/40 bg-red-950/70 text-red-100',
  }[tone];

  return (
    <div className={`rounded-lg border p-3 shadow-lg ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <div className="text-sm font-black leading-tight text-white">{title}</div>
      <div className="mt-1 line-clamp-2 text-xs font-semibold opacity-80">{detail}</div>
    </div>
  );
}
