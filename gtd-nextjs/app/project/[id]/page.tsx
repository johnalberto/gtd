'use client';

import React, { use, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Trash2, Edit, CheckCircle2, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getPriorityColor } from '@/lib/utils';
import TaskModal from '@/components/modals/TaskModal';
import TaskTree from '@/components/tasks/TaskTree';
import type { Task } from '@/lib/types';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { tasks, projects, updateTask, deleteTask } = useTasks();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

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

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setModalMode('edit');
        setIsEditModalOpen(true);
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setModalMode('create');
        // Initial parent ID is the currently selected task in the tree, if any

        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
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
                            <Button className="mt-4" onClick={handleCreateTask}>
                                Crear primera tarea
                            </Button>
                        </div>
                    ) : (
                        <>
                            <TaskTree
                                tasks={projectTasks}
                                onUpdateTask={updateTask}
                                onDeleteTask={deleteTask}
                                onEditTask={handleEditTask}
                                onSelectTask={setSelectedParentId}
                                selectedTaskId={selectedParentId}
                            />
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mt-2"
                                onClick={handleCreateTask}
                            >
                                <Plus size={18} className="mr-2" />
                                {selectedParentId ? "Añadir subtarea" : "Añadir tarea"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                task={selectedTask}
                mode={modalMode}
                initialProjectId={project.id}
                initialParentId={selectedParentId || undefined}
            />
        </AppLayout>
    );
}
