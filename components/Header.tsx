import React from 'react';
import { Target, Crown, History } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  return (
    <header className="w-full py-6 px-4 sm:px-8 flex items-center justify-between bg-black border-b border-neutral-900 sticky top-0 z-50 bg-opacity-95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-2 rounded-lg shadow-lg shadow-amber-900/20">
          <Target className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">GoalArchitect</h1>
          <p className="text-xs text-amber-500 font-medium uppercase tracking-widest">Elite Planning AI</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={onOpenHistory}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">HISTORY</span>
        </button>

        {/* Pro Badge - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-amber-500 bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-900/30">
          <Crown className="w-4 h-4" />
          <span>PRO MEMBER</span>
        </div>
      </div>
    </header>
  );
};