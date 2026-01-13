'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { PlusCircle, Trash2, Edit, Tag } from 'lucide-react';

export default function ContextsPage() {
    const { contexts, addContext, updateContext, deleteContext } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContext, setEditingContext] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', icon: '📍' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingContext) {
            await updateContext(editingContext.id, formData);
        } else {
            await addContext(formData);
        }
        setIsModalOpen(false);
        setEditingContext(null);
        setFormData({ name: '', icon: '📍' });
    };

    const handleEdit = (context: any) => {
        setEditingContext(context);
        setFormData({
            name: context.name,
            icon: context.icon || '📍'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este contexto?')) {
            await deleteContext(id);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Contextos
                    </h1>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusCircle size={18} className="mr-2" />
                        Nuevo Contexto
                    </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                    Define contextos para organizar tus tareas por ubicación, herramienta o situación
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contexts.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                No hay contextos aún. ¡Crea uno!
                            </p>
                        </div>
                    ) : (
                        contexts.map(context => (
                            <div
                                key={context.id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{context.icon || '📍'}</span>
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                            {context.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(context)}
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(context.id)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingContext(null);
                    setFormData({ name: '', icon: '📍' });
                }}
                title={editingContext ? 'Editar Contexto' : 'Nuevo Contexto'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ej: Oficina, Casa, Computadora"
                        required
                    />
                    <Input
                        label="Icono (emoji)"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="📍"
                        maxLength={2}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {editingContext ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
