import { PlanState } from '../types';

/**
 * Counts tasks recursively, including subtasks
 * @param tasks - Array of tasks to count
 * @returns Object with total and completed counts
 */
export const countTasks = (tasks: PlanState['days'][0]['tasks']): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;
  tasks.forEach(t => {
    total++;
    if (t.isCompleted) completed++;
    if (t.subTasks) {
      const subResult = countTasks(t.subTasks);
      total += subResult.total;
      completed += subResult.completed;
    }
  });
  return { total, completed };
};

/**
 * Calculates overall progress percentage
 * @param days - Array of days with tasks
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (days: PlanState['days']): number => {
  let total = 0;
  let completed = 0;
  
  days.forEach(day => {
    const res = countTasks(day.tasks);
    total += res.total;
    completed += res.completed;
  });
  return total === 0 ? 0 : Math.round((completed / total) * 100);
};

/**
 * Calculates progress for a specific day
 * @param tasks - Tasks for the day
 * @returns Progress percentage (0-100)
 */
export const calculateDayProgress = (tasks: PlanState['days'][0]['tasks']): number => {
  const { total, completed } = countTasks(tasks);
  return total === 0 ? 0 : Math.round((completed / total) * 100);
};
