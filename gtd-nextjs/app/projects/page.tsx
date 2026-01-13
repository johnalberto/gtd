'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { PlusCircle, Trash2, Edit, Layers } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
    const { projects, addProject, updateProject, deleteProject } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', color: '#3B82F6' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            await updateProject(editingProject.id, formData);
        } else {
            await addProject(formData);
        }
        setIsModalOpen(false);
        setEditingProject(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
    };

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            color: project.color || '#3B82F6'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este proyecto?')) {
            await deleteProject(id);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Proyectos
                    </h1>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusCircle size={18} className="mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                    Organiza tus tareas en proyectos
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                No hay proyectos aún. ¡Crea uno!
                            </p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
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
                                    </div>

                                    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(project)}
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(project.id)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} className="text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', color: '#3B82F6' });
                }}
                title={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Color
                        </label>
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="h-10 w-full rounded-md border border-slate-300"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingProject ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
