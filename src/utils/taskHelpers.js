import { isOverdue } from './dateHelpers';

export const filterTasksByStatus = (tasks, status) => {
    return tasks.filter(task => task.status === status);
};

export const getInboxTasks = (tasks) => tasks.filter(t => t.status === 'inbox');

export const getTodayTasks = (tasks) => {
    // Logic to filter tasks due today or previously overdue
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'someday' || t.status === 'reference') return false;
        if (!t.dueDate) return false;
        return t.dueDate.startsWith(todayStr) || isOverdue(t.dueDate);
    });
};

export const PROJECTS_MAP = {}; // Will be populated in runtime or context if needed, usually we pass simple IDs.

export const PRIORITY_COLORS = {
    P1: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300',
    P2: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300',
    P3: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300',
    P4: 'text-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400',
};
