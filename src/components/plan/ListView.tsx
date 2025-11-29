import React, { useEffect, useMemo, useState } from 'react';
import { PlanState } from '../../types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { countTasks } from '../../utils';

interface ListViewProps {
  plan: PlanState;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  breakingDownTaskId: string | null;
  searchQuery: string;
}

/**
 * List view component for displaying plan days in an expandable list format
 */
export const ListView: React.FC<ListViewProps> = ({
  plan,
  onToggleTask,
  onToggleExpanded,
  onBreakDownTask,
  breakingDownTaskId,
  searchQuery
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (plan.days.length > 0) {
      setExpandedDays(prev => ({...prev, 0: true}));
    }
  }, [plan.days.length]);

  const toggleDay = (index: number) => {
    setExpandedDays(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Filter tasks based on search query
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

  return (
    <div className="space-y-6">
      {filteredDays.map((day, dayIndex) => {
        const isExpanded = expandedDays[dayIndex];
        const stats = countTasks(day.tasks);
        
        const dayProgress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

        if (searchQuery && stats.total === 0) return null;

        return (
          <div key={day.dayNumber} className="group border border-neutral-800 rounded-2xl bg-neutral-900/20 overflow-hidden transition-all hover:border-neutral-700">
             <div 
                className="flex items-center justify-between p-4 cursor-pointer select-none bg-gradient-to-r from-neutral-900/50 to-transparent"
                onClick={() => toggleDay(dayIndex)}
             >
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg transition-transform duration-300 ${isExpanded ? 'rotate-90 bg-amber-500/10 text-amber-500' : 'text-neutral-500'}`}>
                      <ChevronRight className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className="text-sm font-bold text-amber-500 uppercase tracking-widest">Day {day.dayNumber}</span>
                         <span className="text-neutral-600 text-xs">|</span>
                         <span className="text-sm text-neutral-400">{day.dayLabel}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-100 transition-colors">{day.theme}</h3>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative w-8 h-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                         <path className="text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                         <path className={`${dayProgress === 100 ? 'text-green-500' : 'text-amber-500'}`} strokeDasharray={`${dayProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                      </svg>
                   </div>
                </div>
             </div>

             {isExpanded && (
                <div className="border-t border-neutral-800 p-4 bg-black/20">
                   <div className="space-y-3">
                      {day.tasks.map((task) => (
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
                   </div>
                </div>
             )}
          </div>
        );
      })}
    </div>
  );
};
