import { Task, GeneratedTask } from './task';

export interface DayPlan {
  dayNumber: number;
  dayLabel: string; // e.g., "Day 1" or "Monday"
  theme: string; // Short summary of the day's focus
  tasks: GeneratedTask[]; 
}

export interface GeneratedPlan {
  planTitle: string;
  overview: string;
  days: DayPlan[];
}

// Frontend enhanced state
export interface PlanState extends Omit<GeneratedPlan, 'days'> {
  startDate?: string;
  days: {
    dayNumber: number;
    dayLabel: string;
    theme: string;
    tasks: Task[];
  }[];
}
