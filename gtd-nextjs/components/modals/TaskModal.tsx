'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTasks } from '@/contexts/TaskContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskModal({ isOpen, onClose }: TaskModalProps) {
    const { addTask, projects, contexts } = useTasks();
    const [formData, setFormData] = useState({
        title: '',
        notes: '',
        priority: 'P4',
        is_actionable: false,
        project_id: '',
        context_ids: [] as string[],
        due_date: '',
        due_time: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', formData);

        if (!formData.title.trim()) {
            console.log('Title is empty, aborting');
            return;
        }

        if (isSubmitting) {
            console.log('Already submitting, aborting');
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine date and time if both are provided
            let dueDateTime = undefined;
            if (formData.due_date) {
                if (formData.due_time) {
                    dueDateTime = new Date(`${formData.due_date}T${formData.due_time}`);
                } else {
                    dueDateTime = new Date(formData.due_date);
                }
            }

            const taskData = {
                title: formData.title,
                notes: formData.notes || undefined,
                priority: formData.priority,
                is_actionable: formData.is_actionable,
                project_id: formData.project_id || undefined,
                context_ids: formData.context_ids.length > 0 ? formData.context_ids : undefined,
                due_date: dueDateTime,
                status: 'inbox',
            };

            console.log('Sending task data to API:', taskData);
            const result = await addTask(taskData);
            console.log('Task created result:', result);

            if (result) {
                // Reset form
                setFormData({
                    title: '',
                    notes: '',
                    priority: 'P4',
                    is_actionable: false,
                    project_id: '',
                    context_ids: [],
                    due_date: '',
                    due_time: '',
                });

                onClose();
            } else {
                console.error('Task creation returned null');
                alert('Error al crear la tarea. Verifica la consola para más detalles.');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert(`Error al crear la tarea: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContextToggle = (contextId: string) => {
        setFormData(prev => ({
            ...prev,
            context_ids: prev.context_ids.includes(contextId)
                ? prev.context_ids.filter(id => id !== contextId)
                : [...prev.context_ids, contextId]
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nueva Tarea">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Título"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="¿Qué necesitas hacer?"
                    required
                    autoFocus
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas
                    </label>
                    <textarea
                        className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Detalles adicionales..."
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prioridad
                        </label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="P1">P1 - Urgente</option>
                            <option value="P2">P2 - Alta</option>
                            <option value="P3">P3 - Media</option>
                            <option value="P4">P4 - Baja</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Proyecto
                        </label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                        >
                            <option value="">Sin proyecto</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        {projects.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No hay proyectos. Créalos en la sección Proyectos.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Fecha de vencimiento"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />

                    <Input
                        label="Hora"
                        type="time"
                        value={formData.due_time}
                        onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                        disabled={!formData.due_date}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_actionable}
                            onChange={(e) => setFormData({ ...formData, is_actionable: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Es una siguiente acción (tarea accionable)
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                        Marca esto si es una tarea que puedes hacer inmediatamente
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contextos
                    </label>
                    {contexts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {contexts.map(context => (
                                <button
                                    key={context.id}
                                    type="button"
                                    onClick={() => handleContextToggle(context.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.context_ids.includes(context.id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {context.icon} {context.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No hay contextos. Créalos en la sección Contextos.</p>
                    )}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                        {isSubmitting ? 'Creando...' : 'Crear Tarea'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
