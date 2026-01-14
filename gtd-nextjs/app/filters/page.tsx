'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import { Context, TaskStatus } from '@/lib/types';
import TaskItem from '@/components/tasks/TaskItem';
import { Filter, X, Tag, ListTodo } from 'lucide-react';
import { clsx } from 'clsx';
import TaskModal from '@/components/modals/TaskModal';

type FilterTab = 'contexts' | 'status';

export default function FiltersPage() {
    const { tasks, contexts, updateTask, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState<FilterTab>('contexts');

    // Filter States
    const [selectedContexts, setSelectedContexts] = useState<Set<string>>(new Set());
    const [selectedStatuses, setSelectedStatuses] = useState<Set<TaskStatus>>(new Set(['next-actions']));

    // Task Action State
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Toggle Selection Helpers
    const toggleContext = (id: string) => {
        const next = new Set(selectedContexts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedContexts(next);
    };

    const toggleStatus = (status: TaskStatus) => {
        const next = new Set(selectedStatuses);
        if (next.has(status)) next.delete(status);
        else next.add(status);
        setSelectedStatuses(next);
    };

    const clearFilters = () => {
        setSelectedContexts(new Set());
        setSelectedStatuses(new Set());
    };

    // Derived Filtered Tasks
    const filteredTasks = useMemo(() => {
        // If no filters are active at all, decide default behavior.
        // User probably expects to see nothing or everything? 
        // Let's show everything if NO filters are updated, but usually filters start empty.
        // However, user wants to "build" a filter.
        // Let's assume if nothing selected in a category, that category is "All" (ignored), 
        // unless ALL categories are empty?
        // Let's make it strict: Show tasks matching selected criteria.

        // If NO contexts selected, do we show tasks with ANY context? Or ignore context filter?
        // Usually: Not selecting any context means "Ignore context filter".
        // Selecting one or more means "Must match one of these".

        const hasContextFilter = selectedContexts.size > 0;
        const hasStatusFilter = selectedStatuses.size > 0;

        if (!hasContextFilter && !hasStatusFilter) return []; // Start empty or show all? Let's show all for exploration? Or empty?
        // Let's show ALL active tasks by default if nothing selected, but maybe filter out completed/trash.
        // If user selects specific filters, we narrow down.

        return tasks.filter(task => {
            // Status Filter
            if (hasStatusFilter) {
                if (!selectedStatuses.has(task.status)) return false;
            } else {
                // Default: exclude trash/completed if no status filter?
                if (task.status === 'trash' || task.status === 'completed') return false;
            }

            // Context Filter
            if (hasContextFilter) {
                const taskWithContexts = task as any; // Cast to any or TaskWithRelations if imported
                const taskContextIds = taskWithContexts.contexts?.map((c: Context) => c.id) || [];
                // Check if task has ANY of the selected contexts (OR logic)
                // "Combinacion Home + Computer" -> OR? Or AND?
                // Standard UI facet is OR. Let's stick to OR.
                const hasMatch = taskContextIds.some((id: string) => selectedContexts.has(id));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [tasks, selectedContexts, selectedStatuses]);

    // Active Filters Display List
    const activeFilters = [
        ...Array.from(selectedStatuses).map(s => ({ type: 'status', id: s, label: getStatusLabel(s) })),
        ...Array.from(selectedContexts).map(id => {
            const ctx = contexts.find(c => c.id === id);
            return { type: 'context', id, label: ctx?.name || 'Unknown' };
        })
    ];

    const handleTaskClick = (taskId: string) => {
        setSelectedTask(taskId);
        setIsTaskModalOpen(true);
    };

    return (
        <AppLayout>
            <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
                <div className="flex items-center justify-between flex-none">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Filter className="text-blue-500" />
                        Filtros Avanzados
                    </h1>
                    {activeFilters.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                            Limpiar todo
                        </button>
                    )}
                </div>

                {/* Active Filters Bar */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex-none">
                        {activeFilters.map(filter => (
                            <div
                                key={`${filter.type}-${filter.id}`}
                                className={clsx(
                                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all",
                                    filter.type === 'context'
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                )}
                            >
                                {filter.type === 'context' ? <Tag size={12} /> : <ListTodo size={14} />}
                                <span>{filter.label}</span>
                                <button
                                    onClick={() => filter.type === 'context' ? toggleContext(filter.id) : toggleStatus(filter.id as TaskStatus)}
                                    className="hover:bg-white/20 rounded-full p-0.5"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter Tabs & Content */}
                <div className="flex-none bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('contexts')}
                            className={clsx(
                                "flex-1 px-4 py-3 text-sm font-medium text-center transition-colors border-b-2",
                                activeTab === 'contexts'
                                    ? "border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Tag size={16} />
                                Contextos
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('status')}
                            className={clsx(
                                "flex-1 px-4 py-3 text-sm font-medium text-center transition-colors border-b-2",
                                activeTab === 'status'
                                    ? "border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ListTodo size={16} />
                                Estados
                            </div>
                        </button>
                    </div>

                    <div className="p-4">
                        {activeTab === 'contexts' && (
                            <div className="flex flex-wrap gap-2">
                                {contexts.map(ctx => (
                                    <button
                                        key={ctx.id}
                                        onClick={() => toggleContext(ctx.id)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-md text-sm transition-all border",
                                            selectedContexts.has(ctx.id)
                                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
                                        )}
                                    >
                                        {ctx.icon} {ctx.name}
                                    </button>
                                ))}
                                {contexts.length === 0 && (
                                    <p className="text-gray-500 text-sm italic">No hay contextos creados.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'status' && (
                            <div className="flex flex-wrap gap-2">
                                {['inbox', 'next-actions', 'waiting', 'someday', 'completed', 'trash'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => toggleStatus(status as TaskStatus)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-md text-sm transition-all border capitalize",
                                            selectedStatuses.has(status as TaskStatus)
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
                                        )}
                                    >
                                        {getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
                            Resultados ({filteredTasks.length})
                        </h2>
                    </div>
                    <div className="p-2">
                        {filteredTasks.length > 0 ? (
                            <div className="space-y-1">
                                {filteredTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onStatusChange={(id: string, status: string) => updateTask(id, { status: status as any })}
                                        onDelete={deleteTask}
                                        onClick={() => handleTaskClick(task.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Filter size={48} className="mb-4 opacity-20" />
                                <p>No se encontraron tareas con estos filtros</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isTaskModalOpen && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setSelectedTask(null);
                    }}
                    task={selectedTask ? tasks.find(t => t.id === selectedTask) as any : null}
                    mode={selectedTask ? "edit" : "create"}
                />
            )}
        </AppLayout>
    );
}

function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        'inbox': 'Inbox',
        'next-actions': 'Siguiente Acción',
        'waiting': 'En Espera',
        'someday': 'Algún día',
        'completed': 'Completado',
        'trash': 'Papelera'
    };
    return map[status] || status;
}
