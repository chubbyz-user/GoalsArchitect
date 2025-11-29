import React from 'react';
import { PlanState, Task } from '../../types';
import { CheckCircle2, Youtube, Split, Loader2, ChevronRight, ChevronDown } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  dayIndex: number;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  breakingDownTaskId: string | null;
  level?: number;
}

/**
 * Individual task item component with support for nested subtasks
 */
export const TaskItem: React.FC<TaskItemProps> = React.memo(({ 
  task, 
  dayIndex, 
  onToggleTask, 
  onBreakDownTask, 
  onToggleExpanded,
  breakingDownTaskId,
  level = 0
}) => {
   const isBreakingDown = breakingDownTaskId === task.id;
   const hasSubTasks = task.subTasks && task.subTasks.length > 0;

   return (
      <div className={`transition-all ${level > 0 ? 'mt-2' : ''}`}>
         <div 
            className={`p-3 rounded-xl border text-sm transition-all flex gap-3 items-start group/task relative ${
               task.isCompleted 
               ? 'bg-green-950/10 border-green-900/20 text-green-500/60' 
               : 'bg-black/40 border-neutral-800/60 text-neutral-300 hover:bg-neutral-800/60 hover:border-neutral-700'
            }`}
         >
            {/* Expand/Collapse Toggle */}
            {hasSubTasks && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded(dayIndex, task.id);
                }}
                className="absolute -left-3 top-3.5 -ml-1.5 p-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors z-10"
              >
                {task.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}

            <button
               onClick={() => onToggleTask(dayIndex, task.id)}
               className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 transition-colors border flex items-center justify-center cursor-pointer ${
                   task.isCompleted 
                   ? 'bg-green-600/20 border-green-600/50 text-green-500' 
                   : 'border-neutral-600 hover:border-amber-500/50'
               }`}
            >
               {task.isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
            </button>
            
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className={`text-xs sm:text-sm leading-relaxed ${task.isCompleted ? 'line-through decoration-neutral-700' : ''}`}>
                  {task.description}
                </span>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.videoLink && task.videoLink.startsWith('http') && (
                    <a 
                      href={task.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-medium text-red-400 hover:text-red-300 w-fit px-2 py-1 bg-red-950/10 rounded-full hover:bg-red-950/20 transition-colors border border-red-900/20"
                    >
                      <Youtube className="w-3 h-3" />
                      Tutorials
                    </a>
                  )}
                  
                  {!task.isCompleted && !hasSubTasks && (
                     <button
                        onClick={() => onBreakDownTask(dayIndex, task.id, task.description)}
                        disabled={isBreakingDown}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-amber-500 w-fit px-2 py-1 bg-neutral-900/50 rounded-full hover:bg-neutral-900 transition-colors border border-neutral-800/50 opacity-100 sm:opacity-0 sm:group-hover/task:opacity-100 disabled:opacity-100 transition-opacity"
                        title="Break down into smaller steps"
                     >
                        {isBreakingDown ? (
                           <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                        ) : (
                           <Split className="w-3 h-3" />
                        )}
                        <span>{isBreakingDown ? "Thinking..." : "Break Down"}</span>
                     </button>
                  )}
                </div>
            </div>
         </div>

         {/* Nested Sub-Tasks */}
         {hasSubTasks && task.isExpanded && (
            <div className="pl-6 border-l border-neutral-800 ml-5 space-y-2 mt-2">
               {task.subTasks!.map(subTask => (
                  <TaskItem 
                     key={subTask.id}
                     task={subTask}
                     dayIndex={dayIndex}
                     onToggleTask={onToggleTask}
                     onBreakDownTask={onBreakDownTask}
                     onToggleExpanded={onToggleExpanded}
                     breakingDownTaskId={breakingDownTaskId}
                     level={level + 1}
                  />
               ))}
            </div>
         )}
      </div>
   );
});
