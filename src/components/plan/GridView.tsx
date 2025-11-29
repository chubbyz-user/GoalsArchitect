import React, { useMemo } from 'react';
import { PlanState } from '../../types';
import { TaskItem } from './TaskItem';
import { countTasks } from '../../utils';

interface GridViewProps {
  plan: PlanState;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  breakingDownTaskId: string | null;
  searchQuery: string;
}

/**
 * Grid/calendar view component for displaying plan days in a card grid
 */
export const GridView: React.FC<GridViewProps> = ({
  plan,
  onToggleTask,
  onToggleExpanded,
  onBreakDownTask,
  breakingDownTaskId,
  searchQuery
}) => {
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return plan.days;
    
    const filterTasks = (tasks: PlanState['days'][0]['tasks']): PlanState['days'][0]['tasks'] => {
      return tasks.filter(task => {
        const matches = task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const subTaskMatches = task.subTasks ? filterTasks(task.subTasks) : [];
        return matches || subTaskMatches.length > 0;
      });
    };

    return plan.days.map(day => ({
      ...day,
      tasks: filterTasks(day.tasks)
    }));
  }, [plan.days, searchQuery]);

  const planStartDate = new Date(plan.startDate || new Date());
  planStartDate.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDays.map((day, dayIndex) => {
        const date = new Date(planStartDate);
        date.setDate(planStartDate.getDate() + (day.dayNumber - 1));
        
        const stats = countTasks(day.tasks);

        if (searchQuery && stats.total === 0) return null;

        return (
          <div 
            key={day.dayNumber} 
            className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex flex-col hover:border-amber-500/30 transition-all shadow-sm group relative overflow-hidden h-[28rem]"
          >
              {/* Date Header */}
              <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white tracking-tight">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full uppercase tracking-wider border border-neutral-700/50">
                  Day {day.dayNumber}
                </span>
              </div>
              
              {/* Theme */}
              <div className="mb-4 flex-shrink-0">
                 <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider mb-1">Focus</div>
                 <div className="text-sm font-medium text-amber-100 leading-snug line-clamp-2" title={day.theme}>
                    {day.theme}
                 </div>
              </div>

              {/* Task List */}
              <div className="flex-1 flex flex-col min-h-0">
                 <div className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider mb-2 flex justify-between items-center flex-shrink-0">
                    <span>Tasks</span>
                    <span className="text-neutral-600">{stats.completed}/{stats.total}</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-1">
                    {day.tasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        dayIndex={dayIndex} 
                        onToggleTask={onToggleTask}
                        onBreakDownTask={onBreakDownTask}
                        onToggleExpanded={onToggleExpanded}
                        breakingDownTaskId={breakingDownTaskId}
                      />
                    ))}
                    {day.tasks.length === 0 && (
                        <div className="text-center py-8 text-neutral-600 text-xs italic">
                            {searchQuery ? "No matching tasks." : "No tasks scheduled."}
                        </div>
                    )}
                 </div>
              </div>
          </div>
        );
      })}
    </div>
  );
};
