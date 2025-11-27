
export type Duration = string;

export interface Task {
  id: string; // Unique ID for UI tracking (generated on frontend if not from API)
  description: string;
  isCompleted: boolean;
  reminder?: string; // ISO Date String
  videoLink?: string; // URL to a YouTube video
  subTasks?: Task[]; // Nested tasks
  isExpanded?: boolean; // UI State for collapse/expand
}

export interface GeneratedTask {
  description: string;
  videoLink?: string;
}

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

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  plan: PlanState;
}