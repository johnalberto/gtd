'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTasks } from '@/contexts/TaskContext';
import type { Task, TaskWithRelations } from '@/lib/types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: TaskWithRelations | null; // Task to edit (null/undefined = create mode)
    mode?: 'create' | 'edit';
    initialProjectId?: string;
    initialParentId?: string;
}

export default function TaskModal({ isOpen, onClose, task, mode = 'create', initialProjectId, initialParentId }: TaskModalProps) {
    const { tasks, projects, contexts, addTask, updateTask } = useTasks();
    const isEditMode = mode === 'edit' || !!task;
    const [formData, setFormData] = useState({
        title: '',
        notes: '',
        priority: 'P4',
        is_actionable: false,
        project_id: '',
        parent_task_id: '',
        context_ids: [] as string[],
        due_date: '',
        due_time: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reminders state
    const [reminders, setReminders] = useState<{ time: string; date: string }[]>([]);
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');

    // Subtasks state
    const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    // Get parent task name if applicable
    const parentTask = formData.parent_task_id
        ? tasks.find(t => t.id === formData.parent_task_id)
        : null;

    // Populate form when editing
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && task) {
                const dueDate = task.due_date ? new Date(task.due_date) : undefined;
                setFormData({
                    title: task.title,
                    notes: task.notes || '',
                    priority: task.priority || 'P4',
                    is_actionable: task.is_actionable ?? true,
                    project_id: task.project_id || '',
                    parent_task_id: task.parent_task_id || '',
                    due_date: dueDate ? dueDate.toISOString().split('T')[0] : '',
                    due_time: dueDate ? dueDate.toTimeString().slice(0, 5) : '',
                    context_ids: [],
                });
                setSubtasks([]);

                if (task.reminders && task.reminders.length > 0) {
                    setReminders(task.reminders.map((r: any) => {
                        const d = new Date(r.reminder_time);
                        return {
                            date: d.toISOString().split('T')[0],
                            time: d.toTimeString().slice(0, 5)
                        };
                    }));
                } else {
                    setReminders([]);
                }
            } else {
                // Create mode: reset form regardless of previous state
                setFormData({
                    title: '',
                    notes: '',
                    priority: 'P4',
                    is_actionable: true,
                    project_id: initialProjectId || '',
                    parent_task_id: initialParentId || '',
                    context_ids: [],
                    due_date: '',
                    due_time: '',
                });
                setSubtasks([]);
                setReminders([]);
            }
        }
    }, [isOpen, isEditMode, task, initialProjectId, initialParentId]);

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

            const remindersList = reminders.map(r => new Date(`${r.date}T${r.time}`).toISOString());

            const taskData = {
                title: formData.title,
                notes: formData.notes || undefined,
                priority: formData.priority,
                is_actionable: formData.is_actionable,
                project_id: formData.project_id || undefined,
                parent_task_id: formData.parent_task_id || undefined,
                context_ids: formData.context_ids.length > 0 ? formData.context_ids : undefined,
                due_date: dueDateTime,
                status: isEditMode ? undefined : (formData.is_actionable ? 'next-actions' : 'inbox'),
                reminders: remindersList
            };

            let result;
            if (isEditMode && task) {
                console.log('Updating task:', task.id, taskData);
                result = await updateTask(task.id, taskData);
                console.log('Task updated result:', result);
            } else {
                console.log('Creating new task:', taskData);
                result = await addTask(taskData);
                console.log('Task created result:', result);
            }

            if (result) {
                // Reset form
                setFormData({
                    title: '',
                    notes: '',
                    priority: 'P4',
                    is_actionable: false,
                    project_id: '',
                    parent_task_id: '',
                    context_ids: [],
                    due_date: '',
                    due_time: '',
                });

                onClose();
            } else {
                console.error(`Task ${isEditMode ? 'update' : 'creation'} returned null`);
                alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} la tarea. Verifica la consola para más detalles.`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
            alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} la tarea: ${error}`);
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

    const handleAddReminder = () => {
        if (reminderDate && reminderTime) {
            setReminders([...reminders, { date: reminderDate, time: reminderTime }]);
            setReminderDate('');
            setReminderTime('');
        }
    };

    const handleRemoveReminder = (index: number) => {
        setReminders(reminders.filter((_, i) => i !== index));
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleToggleSubtask = (index: number) => {
        setSubtasks(subtasks.map((st, i) =>
            i === index ? { ...st, completed: !st.completed } : st
        ));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Editar Tarea" : "Nueva Tarea"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {parentTask && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md text-sm mb-4 border border-blue-200 dark:border-blue-800">
                        ↳ Creando subtarea de: <strong>{parentTask.title}</strong>
                    </div>
                )}
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

                {/* Reminders Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recordatorios
                    </label>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                label=""
                                type="date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                placeholder="Fecha"
                            />
                            <Input
                                label=""
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                placeholder="Hora"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddReminder}
                            disabled={!reminderDate || !reminderTime}
                        >
                            + Agregar Recordatorio
                        </Button>
                        {reminders.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {reminders.map((reminder, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                    >
                                        <span className="text-sm">
                                            📅 {reminder.date} a las {reminder.time}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveReminder(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                        {isSubmitting ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Tarea' : 'Crear Tarea')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
