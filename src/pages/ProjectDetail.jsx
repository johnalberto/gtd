import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/tasks/TaskList';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import { Layers, ArrowLeft, Plus } from 'lucide-react';
import Button from '../components/ui/Button';

export default function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { tasks, projects, moveTaskTo, deleteTask, addTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);

    const project = projects.find(p => p.id === projectId);

    const projectTasks = useMemo(() => {
        return tasks.filter(t => t.projectId === projectId);
    }, [tasks, projectId]);

    // TODO: Hierarchical view logic will be handled inside TaskList or here via recursion
    // For now, let's pass filtered tasks.

    const handleCreateTask = () => {
        addTask({
            title: 'Nueva Tarea',
            projectId: projectId,
            status: 'next',
            isActionable: true,
            priority: 'P4',
            createdAt: new Date().toISOString()
        });
    };

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Proyecto no encontrado</h2>
                <Button variant="ghost" className="mt-4" onClick={() => navigate('/projects')}>Volver a la lista</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button onClick={() => navigate(-1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                    <ArrowLeft size={20} />
                </button>
                <Layers className="text-blue-600" size={24} />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">{project.name}</h1>
                <Button onClick={handleCreateTask}>
                    <Plus size={20} className="mr-2" />
                    Añadir Tarea
                </Button>
            </div>

            <div className="mt-6">
                <TaskList
                    tasks={projectTasks}
                    onComplete={(id) => moveTaskTo(id, 'completed')}
                    onDelete={deleteTask}
                    onEdit={(task) => setSelectedTask(task)}
                    emptyMessage="Este proyecto no tiene tareas aún. ¡Empieza añadiendo una!"
                />
            </div>

            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />
        </div>
    );
}
