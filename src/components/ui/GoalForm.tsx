import React, { useState } from 'react';
import { Duration } from '../../types';
import { ArrowRightIcon, SparklesIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface GoalFormProps {
  onGenerate: (goal: string, duration: Duration) => void;
  isLoading: boolean;
  onLoad: () => void;
  hasSavedPlan: boolean;
}

/**
 * Form component for goal input and plan generation
 */
export const GoalForm: React.FC<GoalFormProps> = ({ onGenerate, isLoading, onLoad, hasSavedPlan }) => {
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState<number>(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onGenerate(goal, `${days} Days`);
    }
  };

  const presetDays = [3, 7, 14, 30, 60];

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-black/40 rounded-2xl shadow-2xl shadow-amber-900/10 border border-neutral-800 p-6 sm:p-8 relative overflow-hidden backdrop-blur-sm">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Construct Your Legacy</h2>
          <p className="text-neutral-500">Input your ambition. Select your timeline. Execute the plan.</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div className="space-y-3">
            <label htmlFor="goal" className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">
              Primary Objective
            </label>
            <textarea
              id="goal"
              rows={3}
              className="w-full px-4 py-4 rounded-xl border border-neutral-800 bg-neutral-950 text-white focus:bg-black focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-neutral-700 shadow-inner"
              placeholder="e.g., Learn basic Spanish, Train for a 5k run, Launch a personal website..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
             <div className="flex items-end justify-between px-1">
                <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Timeline Duration
                </label>
                <div className="flex items-center gap-2 text-white font-mono font-bold text-xl bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800">
                   <ClockIcon className="w-4 h-4 text-amber-500" />
                   {days} <span className="text-sm text-neutral-500 font-sans font-normal pt-1">Days</span>
                </div>
             </div>
             
             <div className="px-1">
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  step="1"
                  value={days} 
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-3 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-neutral-800 hover:border-neutral-700 transition-colors"
                />
                <div className="flex justify-between text-[10px] text-neutral-600 font-mono mt-2 uppercase tracking-wider">
                   <span>1 Day</span>
                   <span>60 Days</span>
                </div>
             </div>

             <div className="grid grid-cols-5 gap-2">
                {presetDays.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 border ${
                       days === d 
                       ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                       : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-300'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!goal.trim() || isLoading}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-neutral-900 disabled:to-neutral-900 disabled:border disabled:border-neutral-800 disabled:text-neutral-700 disabled:cursor-not-allowed text-black rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 group transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <SparklesIcon className="w-5 h-5 animate-spin text-amber-500" />
                  <span className="text-amber-500">Architecting Plan...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 text-black/70" />
                  GENERATE BLUEPRINT
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {hasSavedPlan && !isLoading && (
               <button
                  type="button"
                  onClick={onLoad}
                  className="w-full py-3 bg-transparent border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
               >
                  <ArrowPathIcon className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-500" />
                  Load Previous Session
               </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
