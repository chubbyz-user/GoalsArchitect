import { PlanState } from '../types';

/**
 * Loads history from localStorage
 * @returns Parsed history array or empty array if not found
 */
export const loadHistoryFromStorage = () => {
  try {
    const savedHistory = localStorage.getItem('goalArchitectHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

/**
 * Saves history to localStorage
 * @param history - History array to save
 */
export const saveHistoryToStorage = (history: any[]): void => {
  try {
    localStorage.setItem('goalArchitectHistory', JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

/**
 * Formats a timestamp as a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
