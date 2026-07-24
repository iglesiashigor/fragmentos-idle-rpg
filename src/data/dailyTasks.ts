import { DailyTaskProgress, DailyTaskType } from '../types/game';

const DAILY_RESET_MS = 24 * 60 * 60 * 1000;

const DAILY_TASK_TEMPLATES: {
  type: DailyTaskType;
  name: string;
  description: string;
  target: number;
  gold: number;
  experience: number;
}[] = [
  {
    type: 'kill',
    name: 'Patrulha do Dia',
    description: 'Derrote inimigos em qualquer ponto de combate.',
    target: 5,
    gold: 110,
    experience: 90,
  },
  {
    type: 'gather',
    name: 'Suprimentos da Cidade',
    description: 'Colete recursos nos pontos verdes do mapa.',
    target: 3,
    gold: 80,
    experience: 70,
  },
  {
    type: 'craft',
    name: 'Trabalho de Oficina',
    description: 'Produza ou melhore itens na oficina.',
    target: 1,
    gold: 95,
    experience: 85,
  },
  {
    type: 'sell',
    name: 'Comércio Local',
    description: 'Venda itens na cidade para movimentar a economia.',
    target: 1,
    gold: 70,
    experience: 55,
  },
];

export function getDailyResetAt(now = Date.now()) {
  return now + DAILY_RESET_MS;
}

export function createDailyTasks(level: number, now = Date.now()): {
  tasks: DailyTaskProgress[];
  resetAt: number;
} {
  const rewardMultiplier = Math.max(1, Math.floor(level / 4));

  return {
    resetAt: getDailyResetAt(now),
    tasks: DAILY_TASK_TEMPLATES.map((template) => ({
      id: `${template.type}_${now}`,
      type: template.type,
      name: template.name,
      description: template.description,
      target: template.target,
      current: 0,
      rewards: {
        gold: template.gold + rewardMultiplier * 15,
        experience: template.experience + rewardMultiplier * 12,
      },
      claimed: false,
    })),
  };
}

export function normalizeDailyTasks(
  tasks: DailyTaskProgress[] | undefined,
  resetAt: number | undefined,
  level: number,
  now = Date.now()
) {
  if (!tasks || tasks.length === 0 || !resetAt || resetAt <= now) {
    return createDailyTasks(level, now);
  }

  return { tasks, resetAt };
}

export function advanceDailyTasks(
  tasks: DailyTaskProgress[] | undefined,
  resetAt: number | undefined,
  level: number,
  type: DailyTaskType,
  amount = 1
) {
  const normalized = normalizeDailyTasks(tasks, resetAt, level);

  return {
    resetAt: normalized.resetAt,
    tasks: normalized.tasks.map((task) =>
      task.type === type && !task.claimed
        ? { ...task, current: Math.min(task.target, task.current + amount) }
        : task
    ),
  };
}
