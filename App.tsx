import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { GoalForm } from './components/GoalForm';
import { PlanView } from './components/PlanView';
import { HistoryModal } from './components/HistoryModal';
import { generatePlan, breakDownTask } from './services/geminiService';
import { Duration, PlanState, Task, GeneratedPlan, HistoryItem, GeneratedTask } from './types';

// Helper to generate simple unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [plan, setPlan] = useState<PlanState | null>(null);
  
  // History stacks for Undo/Redo
  const [undoStack, setUndoStack] = useState<PlanState[]>([]);
  const [redoStack, setRedoStack] = useState<PlanState[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Store context for regeneration
  const [lastRequest, setLastRequest] = useState<{goal: string, duration: Duration} | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null); // To track if we are editing a saved plan
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Load history from local storage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('goalArchitectHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('goalArchitectHistory', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (goal: string, duration: Duration) => {
    setIsLoading(true);
    setError(null);
    setLastRequest({ goal, duration });
    setUndoStack([]);
    setRedoStack([]);
    // Reset current history ID because this is a fresh plan
    setCurrentHistoryId(null);

    try {
      const generatedData: GeneratedPlan = await generatePlan(goal, duration);
      
      // Transform API data to include local state (isCompleted, IDs)
      const statefulPlan: PlanState = {
        ...generatedData,
        startDate: new Date().toISOString(), // Set start date to today
        days: generatedData.days.map(day => ({
          ...day,
          tasks: day.tasks.map(taskObj => ({
            id: generateId(),
            description: taskObj.description,
            isCompleted: false,
            videoLink: taskObj.videoLink
          }))
        }))
      };

      setPlan(statefulPlan);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating your plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = useCallback(() => {
    if (lastRequest) {
      handleGenerate(lastRequest.goal, lastRequest.duration);
    }
  }, [lastRequest]);

  const handleSave = useCallback(() => {
    if (!plan) return;

    setHistory(prev => {
      let newHistory;
      const timestamp = Date.now();

      if (currentHistoryId) {
        // Update existing history item
        newHistory = prev.map(item => 
          item.id === currentHistoryId 
            ? { ...item, plan, timestamp } // Update plan and timestamp
            : item
        );
      } else {
        // Create new history item
        const newId = generateId();
        const newItem: HistoryItem = {
          id: newId,
          name: plan.planTitle,
          timestamp,
          plan
        };
        newHistory = [newItem, ...prev];
        setCurrentHistoryId(newId);
      }
      return newHistory;
    });

    // Optional: Visual feedback could be added here (toast)
  }, [plan, currentHistoryId]);

  const handleLoadFromHistory = useCallback((item: HistoryItem) => {
    setPlan(item.plan);
    setCurrentHistoryId(item.id);
    setUndoStack([]);
    setRedoStack([]);
    // We cannot regenerate a plan loaded from history because we don't have the original goal/duration string
    // preserved in the history item currently.
    setLastRequest(null); 
    setIsHistoryOpen(false);
    setError(null);
  }, []);

  const handleRenameHistoryItem = useCallback((id: string, newName: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, name: newName } : item
    ));
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentHistoryId === id) {
      setCurrentHistoryId(null); // Detach current session if deleted
    }
  }, [currentHistoryId]);

  // Handle "Load Last Session" from GoalForm
  const handleLoadLastSession = useCallback(() => {
    if (history.length > 0) {
      // Find the most recent one based on timestamp
      const mostRecent = [...history].sort((a, b) => b.timestamp - a.timestamp)[0];
      handleLoadFromHistory(mostRecent);
    }
  }, [history, handleLoadFromHistory]);


  // --- UNDO / REDO SYSTEM ---

  const commitAction = (newPlan: PlanState) => {
    if (!plan) return;
    setUndoStack(prev => [...prev, plan]);
    setRedoStack([]);
    setPlan(newPlan);
  };

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !plan) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    
    setRedoStack(prev => [plan, ...prev]);
    setUndoStack(newUndo);
    setPlan(previous);
  }, [undoStack, plan]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !plan) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    
    setUndoStack(prev => [...prev, plan]);
    setRedoStack(newRedo);
    setPlan(next);
  }, [redoStack, plan]);

  // --- HANDLERS (Refactored to use commitAction) ---

  const handleToggleTask = useCallback((dayIndex: number, taskId: string) => {
    if (!plan) return;
    
    const newDays = [...plan.days];
    const day = { ...newDays[dayIndex] };
    
    // Recursive helper to find and toggle task
    const toggleTaskRecursive = (tasks: Task[]): Task[] => {
      return tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, isCompleted: !t.isCompleted };
        }
        if (t.subTasks) {
          return { ...t, subTasks: toggleTaskRecursive(t.subTasks) };
        }
        return t;
      });
    };
    
    day.tasks = toggleTaskRecursive(day.tasks);
    newDays[dayIndex] = day;

    commitAction({ ...plan, days: newDays });
  }, [plan]);

  const handleToggleExpanded = useCallback((dayIndex: number, taskId: string) => {
    if (!plan) return;

    const newDays = [...plan.days];
    const day = { ...newDays[dayIndex] };

    const toggleExpandedRecursive = (tasks: Task[]): Task[] => {
      return tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, isExpanded: !t.isExpanded };
        }
        if (t.subTasks) {
          return { ...t, subTasks: toggleExpandedRecursive(t.subTasks) };
        }
        return t;
      });
    };

    day.tasks = toggleExpandedRecursive(day.tasks);
    newDays[dayIndex] = day;
    
    // We don't necessarily need to commit this to undo stack as it's purely UI state, 
    // but consistent behavior suggests we might want to preserve "view state" or just update state without commit.
    // For now, let's just update state to avoid cluttering undo history with "expand/collapse".
    setPlan({ ...plan, days: newDays });
  }, [plan]);

  const handleBulkStatusChange = useCallback((taskIds: string[], isCompleted: boolean) => {
    if (!plan) return;

    // Helper for recursion
    const updateTasksRecursive = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
            let updatedTask = task;
            if (taskIds.includes(task.id)) {
                updatedTask = { ...task, isCompleted };
            }
            if (updatedTask.subTasks) {
                updatedTask = { ...updatedTask, subTasks: updateTasksRecursive(updatedTask.subTasks) };
            }
            return updatedTask;
        });
    };

    const newDays = plan.days.map(day => ({
      ...day,
      tasks: updateTasksRecursive(day.tasks)
    }));

    commitAction({ ...plan, days: newDays });
  }, [plan]);

  const handleSetReminder = useCallback((dayIndex: number, taskId: string, dateStr?: string) => {
    if (!plan) return;

    const newDays = [...plan.days];
    const day = { ...newDays[dayIndex] };
    
    const updateReminderRecursive = (tasks: Task[]): Task[] => {
        return tasks.map(t => {
            if (t.id === taskId) return { ...t, reminder: dateStr };
            if (t.subTasks) return { ...t, subTasks: updateReminderRecursive(t.subTasks) };
            return t;
        });
    };

    day.tasks = updateReminderRecursive(day.tasks);
    newDays[dayIndex] = day;

    commitAction({ ...plan, days: newDays });
  }, [plan]);

  const handleMoveTask = useCallback((fromDayIndex: number, toDayIndex: number, taskId: string, newIndex?: number) => {
    if (!plan) return;
    
    // Note: Moving tasks with subtasks is complex. 
    // This simple implementation only supports moving top-level tasks for now.
    // Nested drag-and-drop requires a more robust library or logic.
    
    const newDays = [...plan.days];

    // Deep copy source day
    const sourceDay = { ...newDays[fromDayIndex] };
    sourceDay.tasks = [...sourceDay.tasks];
    
    const taskIndex = sourceDay.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return; // Only support top level move for now

    // Remove from source
    const [taskToMove] = sourceDay.tasks.splice(taskIndex, 1);
    newDays[fromDayIndex] = sourceDay;

    // Prepare destination
    let destDay: typeof sourceDay;
    if (fromDayIndex === toDayIndex) {
      destDay = sourceDay; // Same reference
    } else {
      destDay = { ...newDays[toDayIndex] };
      destDay.tasks = [...destDay.tasks];
    }

    // Insert at new position
    if (typeof newIndex === 'number') {
      let insertAt = newIndex;
      if (fromDayIndex === toDayIndex && taskIndex < newIndex) {
        insertAt -= 1;
      }
      if (insertAt < 0) insertAt = 0;
      if (insertAt > destDay.tasks.length) insertAt = destDay.tasks.length;

      destDay.tasks.splice(insertAt, 0, taskToMove);
    } else {
      destDay.tasks.push(taskToMove);
    }

    newDays[toDayIndex] = destDay;

    commitAction({ ...plan, days: newDays });
  }, [plan]);

  const handleBreakDownTask = useCallback(async (dayIndex: number, taskId: string, taskDescription: string) => {
    if (!plan) return;
    
    setBreakingDownTaskId(taskId);
    setError(null);
    
    try {
      const subTasks: GeneratedTask[] = await breakDownTask(taskDescription);
      
      const newSubTasks: Task[] = subTasks.map(st => ({
        id: generateId(),
        description: st.description,
        isCompleted: false,
        videoLink: st.videoLink
      }));

      const newDays = [...plan.days];
      const day = { ...newDays[dayIndex] };
      
      // Recursive update to find parent and add subtasks
      const addSubTasksRecursive = (tasks: Task[]): Task[] => {
        return tasks.map(t => {
            if (t.id === taskId) {
                return { 
                    ...t, 
                    subTasks: newSubTasks, 
                    isExpanded: true // Auto expand to show new tasks
                };
            }
            if (t.subTasks) {
                return { ...t, subTasks: addSubTasksRecursive(t.subTasks) };
            }
            return t;
        });
      };
      
      day.tasks = addSubTasksRecursive(day.tasks);
      newDays[dayIndex] = day;
      
      commitAction({ ...plan, days: newDays });
      
    } catch (err) {
      console.error("Failed to break down task", err);
      setError("Failed to break down task. Please try again.");
    } finally {
      setBreakingDownTaskId(null);
    }
  }, [plan]);

  const handleReset = () => {
    setShowExitConfirmation(true);
  };

  const confirmExit = () => {
    setPlan(null);
    setUndoStack([]);
    setRedoStack([]);
    setError(null);
    setLastRequest(null);
    setCurrentHistoryId(null);
    setShowExitConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />
      
      <main className="pb-12">
        {!plan && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GoalForm 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              onLoad={handleLoadLastSession}
              hasSavedPlan={history.length > 0}
            />
            
            {/* Features / Social Proof Section (only visible when no plan) */}
            {!isLoading && (
               <div className="max-w-4xl mx-auto mt-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="p-4 group">
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-amber-500/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <h3 className="font-bold text-white mb-2">Precision Scheduling</h3>
                    <p className="text-neutral-500 text-sm">AI analyzes your goal complexity and allocates time efficiently.</p>
                  </div>
                  <div className="p-4 group">
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-amber-500/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 className="font-bold text-white mb-2">Direct Action</h3>
                    <p className="text-neutral-500 text-sm">No vague advice. Get concrete steps to check off every day.</p>
                  </div>
                  <div className="p-4 group">
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-amber-500/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                    <h3 className="font-bold text-white mb-2">Custom Blueprint</h3>
                    <p className="text-neutral-500 text-sm">Whether it's fitness, coding, or finance, we build the map.</p>
                  </div>
               </div>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in">
            <div className="bg-red-900/20 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-sm font-bold hover:text-red-300">Dismiss</button>
          </div>
        )}

        {plan && (
          <PlanView 
            plan={plan} 
            isLoading={isLoading}
            onToggleTask={handleToggleTask}
            onToggleExpanded={handleToggleExpanded}
            onReset={handleReset}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            onBulkStatusChange={handleBulkStatusChange}
            onMoveTask={handleMoveTask}
            onSetReminder={handleSetReminder}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onBreakDownTask={handleBreakDownTask}
            breakingDownTaskId={breakingDownTaskId}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            canRegenerate={!!lastRequest}
          />
        )}
      </main>

      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={handleLoadFromHistory}
        onRename={handleRenameHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl ring-1 ring-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Discard Plan?</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to discard this plan? Any unsaved progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowExitConfirmation(false)}
                className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmExit}
                className="px-4 py-2 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 hover:border-red-800 transition-all text-sm font-bold"
              >
                Discard Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;