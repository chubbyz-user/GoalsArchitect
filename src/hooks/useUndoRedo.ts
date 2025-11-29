import { useState, useCallback } from 'react';
import { PlanState } from '../types';

/**
 * Custom hook for managing undo/redo functionality
 * @param initialState - Initial state value
 * @returns Object with state, handlers, and stack information
 */
export const useUndoRedo = (initialState: PlanState | null) => {
  const [state, setState] = useState<PlanState | null>(initialState);
  const [undoStack, setUndoStack] = useState<PlanState[]>([]);
  const [redoStack, setRedoStack] = useState<PlanState[]>([]);

  const commit = useCallback((newState: PlanState) => {
    if (!state) return;
    setUndoStack(prev => [...prev, state]);
    setRedoStack([]);
    setState(newState);
  }, [state]);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || !state) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    
    setRedoStack(prev => [state, ...prev]);
    setUndoStack(newUndo);
    setState(previous);
  }, [undoStack, state]);

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !state) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    
    setUndoStack(prev => [...prev, state]);
    setRedoStack(newRedo);
    setState(next);
  }, [redoStack, state]);

  const reset = useCallback(() => {
    setState(null);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    state,
    setState,
    commit,
    undo,
    redo,
    reset,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoStack,
    redoStack
  };
};
