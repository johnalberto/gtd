'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';

export default function InboxPage() {
    const { tasks, updateTask, deleteTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const inboxTasks = tasks.filter(t => t.status === 'inbox' && !t.project_id);

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Inbox
                    </h1>
                    <Badge variant="default">{inboxTasks.length} tareas</Badge>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                    Procesa tus tareas del inbox y decide qué hacer con ellas.
                </p>

                <div className="space-y-2">
                    {inboxTasks.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                ¡Tu inbox está vacío! 🎉
                            </p>
                        </div>
                    ) : (
                        inboxTasks.map(task => (
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
            </div>
        </AppLayout>
    );
}
