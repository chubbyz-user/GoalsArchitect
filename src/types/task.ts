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
