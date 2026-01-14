'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, Project, Context as ContextType, TaskWithRelations } from '@/lib/types';

interface TaskContextType {
    tasks: Task[];
    projects: Project[];
    contexts: ContextType[];
    loading: boolean;
    fetchTasks: (filters?: any) => Promise<void>;
    fetchProjects: () => Promise<void>;
    fetchContexts: () => Promise<void>;
    addTask: (data: any) => Promise<Task | null>;
    updateTask: (id: string, data: any) => Promise<Task | null>;
    deleteTask: (id: string) => Promise<void>;
    addProject: (data: any) => Promise<Project | null>;
    updateProject: (id: string, data: any) => Promise<Project | null>;
    deleteProject: (id: string) => Promise<void>;
    addContext: (data: any) => Promise<ContextType | null>;
    updateContext: (id: string, data: any) => Promise<ContextType | null>;

    deleteContext: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [contexts, setContexts] = useState<ContextType[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch tasks
    const fetchTasks = useCallback(async (filters?: any) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.project_id) params.append('project_id', filters.project_id);
            if (filters?.due_date) params.append('due_date', filters.due_date);

            const response = await fetch(`/api/tasks?${params.toString()}`);
            const result = await response.json();
            if (result.success) {
                setTasks(result.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch projects
    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch('/api/projects');
            const result = await response.json();
            if (result.success) {
                setProjects(result.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }, []);

    // Fetch contexts
    const fetchContexts = useCallback(async () => {
        try {
            const response = await fetch('/api/contexts');
            const result = await response.json();
            if (result.success) {
                setContexts(result.data);
            }
        } catch (error) {
            console.error('Error fetching contexts:', error);
        }
    }, []);

    // Add task
    const addTask = useCallback(async (data: any) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setTasks(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error adding task:', error);
            return null;
        }
    }, []);

    // Update task with Optimistic UI
    const updateTask = useCallback(async (id: string, data: any) => {
        // 1. Snapshot previous state
        const previousTasks = [...tasks];

        // 2. Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                // 3. Confirm with server data (in case of sanitized fields)
                // We merge carefully to avoid overwriting newer local changes if any (though race conditions are possible here, basic optimistic is usually fine for this scale)
                setTasks(prev => prev.map(t => t.id === id ? result.data : t));
                return result.data;
            } else {
                // Revert on server error
                throw new Error('Server returned unsuccessful response');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            // 4. Revert on failure
            setTasks(previousTasks);
            return null;
        }
    }, [tasks]);

    // Delete task with Optimistic UI
    const deleteTask = useCallback(async (id: string) => {
        // 1. Snapshot previous state
        const previousTasks = [...tasks];

        // 2. Optimistic update
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error('Server returned unsuccessful response');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            // 3. Revert on failure
            setTasks(previousTasks);
        }
    }, [tasks]);

    // Add project
    const addProject = useCallback(async (data: any) => {
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setProjects(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error adding project:', error);
            return null;
        }
    }, []);

    // Update project
    const updateProject = useCallback(async (id: string, data: any) => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setProjects(prev => prev.map(p => p.id === id ? result.data : p));
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating project:', error);
            return null;
        }
    }, []);

    // Delete project
    const deleteProject = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                setProjects(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }, []);

    // Add context
    const addContext = useCallback(async (data: any) => {
        try {
            const response = await fetch('/api/contexts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setContexts(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error adding context:', error);
            return null;
        }
    }, []);

    // Update context
    const updateContext = useCallback(async (id: string, data: any) => {
        try {
            const response = await fetch(`/api/contexts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setContexts(prev => prev.map(c => c.id === id ? result.data : c));
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating context:', error);
            return null;
        }
    }, []);

    // Delete context
    const deleteContext = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/contexts/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                setContexts(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Error deleting context:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchContexts();
    }, [fetchTasks, fetchProjects, fetchContexts]);

    const value = {
        tasks,
        projects,
        contexts,
        loading,
        fetchTasks,
        fetchProjects,
        fetchContexts,
        addTask,
        updateTask,
        deleteTask,
        addProject,
        updateProject,
        deleteProject,
        addContext,
        updateContext,
        deleteContext,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
