'use client';

import React, { use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getPriorityColor } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { tasks, projects, updateTask, deleteTask } = useTasks();

    const project = projects.find(p => p.id === id);
    const projectTasks = tasks.filter(t => t.project_id === id);

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

    if (!project) {
        return (
            <AppLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Proyecto no encontrado</p>
                    <Link href="/projects">
                        <Button className="mt-4">Volver a Proyectos</Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <Link href="/projects">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={16} className="mr-2" />
                        Volver
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: project.color || '#3B82F6' }}
                            />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {project.name}
                            </h1>
                        </div>
                        {project.description && (
                            <p className="text-gray-600 dark:text-gray-400">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <Badge variant="default">{projectTasks.length} tareas</Badge>
                </div>

                <div className="space-y-2">
                    {projectTasks.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                No hay tareas en este proyecto
                            </p>
                        </div>
                    ) : (
                        projectTasks.map(task => (
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
            </div>
        </AppLayout>
    );
}
