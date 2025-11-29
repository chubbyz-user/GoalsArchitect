import React, { useState, useEffect } from 'react';
import { PlanState } from '../../types';
import { 
  CheckCircleIcon, ArrowPathIcon, ArrowDownTrayIcon, 
  ClockIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, DocumentIcon, ListBulletIcon, CalendarIcon, MagnifyingGlassIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';
import { ListView } from './ListView';
import { GridView } from './GridView';
import { calculateProgress, formatPlanAsMarkdown, downloadFile, countTasks } from '../../utils';

interface PlanViewProps {
  plan: PlanState;
  isLoading: boolean;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onToggleExpanded: (dayIndex: number, taskId: string) => void;
  onReset: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onBreakDownTask: (dayIndex: number, taskId: string, description: string) => void;
  breakingDownTaskId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  canRegenerate: boolean;
}

/**
 * Main plan view component combining header, toolbar, and content views
 */
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const progress = calculateProgress(plan.days);
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
    const markdown = formatPlanAsMarkdown(plan, progress);
    downloadFile(markdown, 'GoalArchitect-Plan.md', 'text/markdown');
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
                <ClockIcon className="w-4 h-4" />
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
               <DocumentIcon className="w-5 h-5" />
            </button>
            <button onClick={handleDownloadPlan} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors" title="Download Plan">
               <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            <button onClick={onUndo} disabled={!canUndo} className="p-2 disabled:opacity-30 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
               <ArrowUturnLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 disabled:opacity-30 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
               <ArrowUturnRightIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
               <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  title="List View"
               >
                  <ListBulletIcon className="w-4 h-4" />
               </button>
               <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  title="Calendar View"
               >
                  <CalendarIcon className="w-4 h-4" />
               </button>
            </div>
            <div className="w-px h-6 bg-neutral-800 mx-1"></div>
            
            {/* Search Input */}
            <div className="relative group w-48 sm:w-64">
               <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-3.5 w-3.5 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
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
                     <XMarkIcon className="h-3.5 w-3.5" />
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
               <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
               {isLoading ? "Regenerating..." : "Regenerate"}
            </button>
            <button onClick={onReset} disabled={isLoading} className="px-3 py-1.5 text-xs font-bold bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-900/30 transition-all disabled:opacity-50">
               Exit
            </button>
         </div>
      </div>

      {/* Content Views */}
      {viewMode === 'grid' ? (
        <GridView 
          plan={plan}
          onToggleTask={onToggleTask}
          onToggleExpanded={onToggleExpanded}
          onBreakDownTask={onBreakDownTask}
          breakingDownTaskId={breakingDownTaskId}
          searchQuery={searchQuery}
        />
      ) : (
        <ListView 
          plan={plan}
          onToggleTask={onToggleTask}
          onToggleExpanded={onToggleExpanded}
          onBreakDownTask={onBreakDownTask}
          breakingDownTaskId={breakingDownTaskId}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
};
