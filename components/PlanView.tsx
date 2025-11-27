import React, { useState, useEffect, useMemo } from 'react';
import { PlanState, Task } from '../types';
import { 
  CheckCircle2, RefreshCw, ChevronRight, Download, 
  Clock, Undo2, Redo2, Save, List, Calendar, Youtube, Search, X, Split, Loader2, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanViewProps {
  plan: PlanState;
  isLoading: boolean;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  onReset: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  onBulkStatusChange: (taskIds: string[], isCompleted: boolean) => void;
  onMoveTask: (fromDayIndex: number, toDayIndex: number, taskId: string, newIndex?: number) => void;
  onSetReminder: (dayIndex: number, taskId: string, dateStr?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  breakingDownTaskId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  canRegenerate: boolean;
}

interface TaskItemProps {
  task: Task;
  dayIndex: number;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  breakingDownTaskId: string | null;
  level?: number;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ 
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
                        // Improved visibility for mobile: visible by default on small screens, hover-only on larger screens
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

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  isLoading,
  onToggleTask,
  onToggleExpanded,
  onReset,
  onRegenerate,
  onSave,
  onUndo,
  onRedo,
  onBreakDownTask,
  breakingDownTaskId,
  canUndo,
  canRedo,
  canRegenerate
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (plan.days.length > 0) {
      setExpandedDays(prev => ({...prev, 0: true}));
    }
  }, [plan.days.length]);

  const toggleDay = (index: number) => {
    setExpandedDays(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Helper to count tasks recursively
  const countTasks = (tasks: Task[]): { total: number, completed: number } => {
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

  // Filter tasks based on search query while preserving day structure
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return plan.days;
    
    // Recursive search filter
    const filterTasks = (tasks: Task[]): Task[] => {
      return tasks.filter(task => {
         const matches = task.description.toLowerCase().includes(searchQuery.toLowerCase());
         const subTaskMatches = task.subTasks ? filterTasks(task.subTasks) : [];
         
         // Keep task if it matches OR if any of its subtasks match
         if (matches || subTaskMatches.length > 0) {
             // If we are keeping it because of subtasks, we might want to attach filtered subtasks?
             // For simplicity, if parent matches, show all. If only child matches, show parent + filtered child?
             // Let's keep it simple: if search query matches, return true.
             // But we need to return a new object structure if we filter subtasks.
             return true; 
         }
         return false;
      });
    };

    return plan.days.map(day => ({
      ...day,
      tasks: filterTasks(day.tasks)
    }));
  }, [plan.days, searchQuery]);

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    
    plan.days.forEach(day => {
       const res = countTasks(day.tasks);
       total += res.total;
       completed += res.completed;
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();
  const totalStats = plan.days.reduce((acc, day) => {
      const res = countTasks(day.tasks);
      return { total: acc.total + res.total, completed: acc.completed + res.completed };
  }, { total: 0, completed: 0 });


  useEffect(() => {
    if (progress === 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [progress]);

  const handleDownloadPlan = () => {
    // Create a nicely formatted Markdown string
    let content = `# ${plan.planTitle}\n\n`;
    content += `**Overview**: ${plan.overview}\n\n`;
    content += `**Total Progress**: ${progress}%\n\n`;
    content += `---\n\n`;

    const formatTasksRecursive = (tasks: Task[], indent = 0) => {
        let taskContent = '';
        tasks.forEach(task => {
            const checkbox = task.isCompleted ? '[x]' : '[ ]';
            const spaces = '  '.repeat(indent);
            taskContent += `${spaces}- ${checkbox} ${task.description}\n`;
            if (task.videoLink) {
                taskContent += `${spaces}  - Tutorial: ${task.videoLink}\n`;
            }
            if (task.subTasks) {
                taskContent += formatTasksRecursive(task.subTasks, indent + 1);
            }
        });
        return taskContent;
    };

    plan.days.forEach(day => {
      content += `## Day ${day.dayNumber}: ${day.dayLabel}\n`;
      content += `**Focus**: ${day.theme}\n\n`;
      content += formatTasksRecursive(day.tasks);
      content += `\n---\n\n`;
    });

    // Create a Blob and trigger download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GoalArchitect-Plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderGrid = () => {
    const planStartDate = new Date(plan.startDate || new Date());
    planStartDate.setHours(0, 0, 0, 0);

    return filteredDays.map((day, dayIndex) => {
      // Use original index logic for date calculation
      const date = new Date(planStartDate);
      date.setDate(planStartDate.getDate() + (day.dayNumber - 1));
      
      const stats = countTasks(day.tasks);

      // In search mode, if a day has no tasks matching, we can choose to hide it or show empty.
      // Hiding it reduces clutter.
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
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Plan Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{plan.planTitle}</h2>
            <p className="text-neutral-400 leading-relaxed">{plan.overview}</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
             <div className="flex items-center gap-2 text-amber-500 bg-amber-950/30 px-3 py-1 rounded-full border border-amber-900/50">
                <Clock className="w-4 h-4" />
                <span>{plan.days.length} Days</span>
             </div>
             <div className="text-neutral-500">
                {totalStats.total} Tasks
             </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <div className="relative h-32 w-32 mx-auto">
             <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-amber-500 transition-all duration-1000 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{progress}%</span>
                <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Complete</span>
             </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-20 z-40 bg-black/80 p-4 rounded-xl border border-neutral-800 backdrop-blur-md shadow-xl shadow-black/50">
         <div className="flex flex-wrap items-center gap-2">
            <button onClick={onSave} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors" title="Save">
               <Save className="w-5 h-5" />
            </button>
            <button onClick={handleDownloadPlan} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors" title="Download Plan">
               <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            <button onClick={onUndo} disabled={!canUndo} className="p-2 disabled:opacity-30 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
               <Undo2 className="w-5 h-5" />
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 disabled:opacity-30 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
               <Redo2 className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
               <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  title="List View"
               >
                  <List className="w-4 h-4" />
               </button>
               <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  title="Calendar View"
               >
                  <Calendar className="w-4 h-4" />
               </button>
            </div>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            
            {/* Search Input */}
            <div className="relative group w-48 sm:w-64">
               <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
               </div>
               <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 block w-full pl-8 pr-8 py-2 placeholder-neutral-600 transition-all outline-none"
               />
               {searchQuery && (
                  <button 
                     onClick={() => setSearchQuery('')}
                     className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer text-neutral-500 hover:text-white"
                  >
                     <X className="h-3.5 w-3.5" />
                  </button>
               )}
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={onRegenerate} 
              disabled={isLoading || !canRegenerate}
              title={!canRegenerate ? "Cannot regenerate plan loaded from history" : "Regenerate Plan"}
              className="px-3 py-1.5 text-xs font-bold bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg hover:border-amber-900/50 hover:text-amber-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
               {isLoading ? "Regenerating..." : "Regenerate"}
            </button>
            <button onClick={onReset} disabled={isLoading} className="px-3 py-1.5 text-xs font-bold bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-900/30 transition-all disabled:opacity-50">
               Exit
            </button>
         </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {renderGrid()}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDays.map((day, dayIndex) => {
            const isExpanded = expandedDays[dayIndex];
            const stats = countTasks(day.tasks);
            
            const dayProgress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

            // Hide day if searching and no tasks match
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
      )}
    </div>
  );
};