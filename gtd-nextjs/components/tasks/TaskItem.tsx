'use client';

import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';
import { clsx } from 'clsx';

interface TaskItemProps {
    task: Task;
    onStatusChange?: (id: string, status: string) => void;
    onDelete?: (id: string) => void;
    onClick?: () => void;
    className?: string;
}

export default function TaskItem({
    task,
    onStatusChange,
    onDelete,
    onClick,
    className
}: TaskItemProps) {

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onStatusChange?.(task.id, 'completed');
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            onDelete?.(task.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.();
    };

    return (
        <div
            onClick={onClick}
            className={clsx(
                "group bg-white dark:bg-gray-800 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden",
                className
            )}
        >
            {/* Left accent bar for priority */}
            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", getPriorityColorBar(task.priority))}></div>

            <div className="flex items-start justify-between gap-4 pl-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {task.due_date && (
                            <span className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                isOverdue(task.due_date) ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
                            )}>
                                {formatDate(task.due_date)}
                            </span>
                        )}
                        <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300")}>
                            {task.status}
                        </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        {task.title}
                    </h3>

                    {task.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {task.notes}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'completed' && (
                        <button
                            onClick={handleComplete}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Completar"
                        >
                            <CheckCircle2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={handleEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function getPriorityColorBar(priority: string) {
    switch (priority) {
        case 'P1': return 'bg-red-500';
        case 'P2': return 'bg-orange-500';
        case 'P3': return 'bg-blue-500';
        default: return 'bg-gray-200';
    }
}

function isOverdue(date: Date) {
    return new Date(date) < new Date() && new Date(date).getDate() !== new Date().getDate();
}
