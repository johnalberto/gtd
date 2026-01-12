import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import ManagementPage from './ManagementPage';
import GenericTaskPage from './GenericTaskPage';

export function ProjectsList() {
    const { projects, addProject, deleteProject } = useTasks();
    return (
        <ManagementPage
            title="Gestión de Proyectos"
            items={projects}
            onAdd={addProject}
            onDelete={deleteProject}
            placeholder="Nombre del nuevo proyecto..."
        />
    );
}

export function ContextsList() {
    const { contexts, addContext, deleteContext } = useTasks();
    return (
        <ManagementPage
            title="Gestión de Contextos"
            items={contexts}
            onAdd={addContext}
            onDelete={deleteContext}
            placeholder="Nombre del nuevo contexto..."
        />
    );
}

export function ProjectTasks({ projectId }) {
    // This component would display tasks for a specific project. 
    // Implementing dynamic routes /projects/:id requires more routing setup.
    // For now, let's just stick to the management list requested.
    return null;
}
