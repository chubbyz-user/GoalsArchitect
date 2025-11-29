import { PlanState } from './plan';

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  plan: PlanState;
}
