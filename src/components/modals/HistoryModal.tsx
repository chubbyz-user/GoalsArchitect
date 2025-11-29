import React, { useState } from 'react';
import { HistoryItem } from '../../types';
import { X, Calendar, Edit2, Trash2, Check, Play, Clock, Search, Archive } from 'lucide-react';
import { formatDate } from '../../utils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Modal component for displaying and managing plan history
 */
export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoad, 
  onRename, 
  onDelete 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const filteredHistory = history
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl ring-1 ring-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
             <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
                <Archive className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white">Plan Archive</h3>
                <p className="text-xs text-neutral-500">Access and manage your legacy blueprints</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-800 bg-black/20">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                 type="text" 
                 placeholder="Search history..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 placeholder:text-neutral-700"
              />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {history.length === 0 ? (
              <div className="text-center py-12 text-neutral-600">
                 <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p className="text-sm">No saved plans found.</p>
                 <p className="text-xs mt-1 text-neutral-700">Plans you save will appear here.</p>
              </div>
           ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-neutral-600 text-sm">
                 No matching plans found.
              </div>
           ) : (
              filteredHistory.map((item) => (
                 <div 
                    key={item.id}
                    className="group bg-neutral-900/50 border border-neutral-800 hover:border-amber-900/30 rounded-xl p-4 transition-all hover:bg-neutral-800/50"
                 >
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex-1 min-w-0">
                          {editingId === item.id ? (
                             <div className="flex items-center gap-2 mb-1">
                                <input 
                                   autoFocus
                                   type="text" 
                                   value={editName}
                                   onChange={(e) => setEditName(e.target.value)}
                                   onKeyDown={(e) => handleKeyDown(e, item.id)}
                                   onBlur={() => handleSaveEdit(item.id)}
                                   className="bg-black border border-amber-500/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full max-w-[200px]"
                                />
                                <button onMouseDown={() => handleSaveEdit(item.id)} className="text-green-500 hover:text-green-400">
                                   <Check className="w-4 h-4" />
                                </button>
                             </div>
                          ) : (
                             <div className="flex items-center gap-2 mb-1 group/title">
                                <h4 className="font-bold text-white truncate">{item.name}</h4>
                                <button 
                                   onClick={(e) => { e.stopPropagation(); handleStartEdit(item); }}
                                   className="opacity-0 group-hover/title:opacity-100 text-neutral-500 hover:text-amber-500 transition-opacity"
                                >
                                   <Edit2 className="w-3 h-3" />
                                </button>
                             </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                             <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.timestamp)}
                             </span>
                             <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.plan.days.length} Days
                             </span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={() => onLoad(item)}
                             className="p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20 flex items-center gap-2 font-bold text-xs"
                          >
                             <Play className="w-3 h-3 fill-current" />
                             LOAD
                          </button>
                          <button 
                             onClick={() => onDelete(item.id)}
                             className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                             title="Delete"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
};
