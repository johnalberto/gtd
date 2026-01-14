'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';
import TaskModal from '@/components/modals/TaskModal';
import { clsx } from 'clsx';

export default function WaitingPage() {
    const { tasks, projects, updateTask, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('tasks');
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const waitingProjects = projects.filter(p => p.status === 'waiting');
    const waitingTasks = tasks.filter(t => t.status === 'waiting');

    const taskToEdit = selectedTask ? tasks.find(t => t.id === selectedTask) : null;

    const handleCompleteTask = async (taskId: string) => {
        await updateTask(taskId, {
            status: 'completed',
            completed_at: new Date(),
        });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            await deleteTask(taskId);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            En Espera
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Tareas y proyectos que están esperando por algo o alguien
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={clsx(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all',
                            activeTab === 'projects'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                    >
                        Proyectos
                        <Badge variant="secondary" className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                            {waitingProjects.length}
                        </Badge>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={clsx(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all',
                            activeTab === 'tasks'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                    >
                        Tareas
                        <Badge variant="secondary" className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                            {waitingTasks.length}
                        </Badge>
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            {waitingProjects.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">No hay proyectos en espera</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {waitingProjects.map(project => (
                                        <Link
                                            key={project.id}
                                            href={`/project/${project.id}`}
                                            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: project.color || '#3B82F6' }}
                                                />
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {project.name}
                                                </h3>
                                            </div>
                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {project.description}
                                                </p>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-2">
                            {waitingTasks.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">No hay tareas en espera</p>
                                </div>
                            ) : (
                                waitingTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {task.title}
                                                </h3>
                                                {task.notes && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {task.notes}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.due_date && (
                                                        <span className="text-xs text-gray-500">
                                                            Vence: {formatDate(task.due_date)}
                                                        </span>
                                                    )}
                                                    {task.project_id && (
                                                        <Badge variant="outline" className="text-xs">
                                                            📁 {projects.find(p => p.id === task.project_id)?.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleCompleteTask(task.id)}
                                                    title="Completar"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedTask(task.id)}
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedTask && (
                <TaskModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={taskToEdit}
                    mode="edit"
                />
            )}
        </AppLayout>
    );
}
