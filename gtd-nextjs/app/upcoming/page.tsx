'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';
import type { Task } from '@/lib/types';
import TaskModal from '@/components/modals/TaskModal';

export default function UpcomingPage() {
    const { tasks, updateTask, deleteTask } = useTasks();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Date calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Filter Overdue Tasks
    const overdueTasks = tasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    // Filter Upcoming (Next 7 days) Tasks
    const upcomingTasks = tasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= nextWeek;
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    const handleCompleteTask = async (taskId: string) => {
        await updateTask(taskId, {
            status: 'completed',
            completed_at: new Date(),
        });
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTask(null);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            await deleteTask(taskId);
        }
    };

    const TaskList = ({ tasks }: { tasks: Task[] }) => (
        <div className="space-y-2">
            {tasks.map(task => (
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
                                    <span className={`text-xs ${new Date(task.due_date) < today && task.status !== 'completed'
                                            ? 'text-red-500 font-semibold'
                                            : 'text-gray-500'
                                        }`}>
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
                                onClick={() => handleEditTask(task)}
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
            ))}
        </div>
    );

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Próximos
                    </h1>
                </div>

                {/* Overdue Section */}
                {overdueTasks.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                            Vencidas
                            <Badge variant="destructive">{overdueTasks.length}</Badge>
                        </h2>
                        <TaskList tasks={overdueTasks} />
                    </section>
                )}

                {/* Upcoming Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        Próximos 7 Días
                        <Badge variant="default">{upcomingTasks.length}</Badge>
                    </h2>
                    {upcomingTasks.length === 0 ? (
                        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                No hay tareas próximas para esta semana.
                            </p>
                        </div>
                    ) : (
                        <TaskList tasks={upcomingTasks} />
                    )}
                </section>
            </div>

            {/* Edit Task Modal */}
            <TaskModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                task={selectedTask}
                mode="edit"
            />
        </AppLayout>
    );
}
