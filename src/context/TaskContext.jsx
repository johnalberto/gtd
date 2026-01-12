import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SAMPLE_TASKS, INITIAL_PROJECTS, INITIAL_CONTEXTS } from '../data/sampleData';
import { v4 as uuidv4 } from 'uuid';

const TaskContext = createContext();

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useLocalStorage('gtd-tasks', SAMPLE_TASKS);
    const [projects, setProjects] = useLocalStorage('gtd-projects', INITIAL_PROJECTS);
    const [contexts, setContexts] = useLocalStorage('gtd-contexts', INITIAL_CONTEXTS);

    // CRUD Operations
    const addTask = (task) => {
        const newTask = { ...task, id: uuidv4(), createdAt: new Date().toISOString() };
        setTasks(prev => [...prev, newTask]);
        return newTask;
    };

    const updateTask = (id, updates) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // Project CRUD
    const addProject = (name) => {
        const newProject = { id: uuidv4(), name };
        setProjects(prev => [...prev, newProject]);
        return newProject;
    };

    const deleteProject = (id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        // Optionally remove projectId from tasks, or leave as is (orphaned)
    };

    // Context CRUD
    const addContext = (name) => {
        const newContext = { id: uuidv4(), name, icon: 'tag' };
        setContexts(prev => [...prev, newContext]);
        return newContext;
    };

    const deleteContext = (id) => {
        setContexts(prev => prev.filter(c => c.id !== id));
    };

    // GTD Specific Helper Methods
    const moveTaskTo = (taskId, status) => {
        updateTask(taskId, { status });
    };

    const processInboxTask = (taskId, data) => {
        // Defines full processing logic (clarify step)
        updateTask(taskId, {
            ...data,
            isActionable: true,
            status: data.status || 'next'
        });
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            projects,
            contexts,
            addTask,
            updateTask,
            deleteTask,
            deleteTask,
            moveTaskTo,
            processInboxTask,
            addProject,
            deleteProject,
            addContext,
            deleteContext
        }}>
            {children}
        </TaskContext.Provider>
    );
}
