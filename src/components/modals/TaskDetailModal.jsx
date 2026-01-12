import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useTasks } from '../../context/TaskContext';
import { cn } from '../../utils/cn';
import { Bell, Plus, X } from 'lucide-react';

export default function TaskDetailModal({ task, isOpen, onClose }) {
    const { updateTask, projects, contexts, deleteTask } = useTasks();
    const [formData, setFormData] = useState({});
    const [step, setStep] = useState('edit'); // edit | clarify-ask

    useEffect(() => {
        if (task) {
            setFormData(task);
            // If it's a raw inbox task, start clarify wizard
            if (task.status === 'inbox' && task.isActionable === null) {
                setStep('clarify-ask');
            } else {
                setStep('edit');
            }
        }
    }, [task]);

    if (!task) return null;

    const handleSave = () => {
        updateTask(task.id, {
            ...formData,
            isActionable: true // Implicitly actionable if saved through here
        });
        onClose();
    };

    const handleNotActionable = (type) => {
        // type: trash, someday, reference
        const statusMap = {
            trash: null, // delete
            someday: 'someday',
            reference: 'reference'
        };

        if (type === 'trash') {
            deleteTask(task.id);
        } else {
            updateTask(task.id, {
                title: formData.title, // Persist title edit
                status: statusMap[type],
                isActionable: false
            });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 'clarify-ask' ? 'Clarificar Tarea' : 'Detalles de la Tarea'}>
            {step === 'clarify-ask' ? (
                <div className="space-y-6 text-center">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="¿Qué es esta tarea?"
                            className="w-full text-center text-xl font-medium border-b-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 bg-transparent outline-none px-2 py-1 placeholder-gray-400"
                            autoFocus
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">¿Es esto accionable? (¿Puedes hacer algo al respecto ahora?)</p>

                    <div className="flex justify-center gap-4">
                        <Button variant="danger" onClick={() => handleNotActionable('trash')}>No, Eliminar</Button>
                        <Button variant="secondary" onClick={() => handleNotActionable('someday')}>Algún día / Tal vez</Button>
                        <Button variant="secondary" onClick={() => handleNotActionable('reference')}>Solo Referencia</Button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button variant="primary" size="lg" className="w-full" onClick={() => setStep('edit')}>Sí, es accionable</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <Input
                        label="Título"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                    <Input
                        label="Notas"
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700"
                                value={formData.projectId || ''}
                                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                            >
                                <option value="">Sin proyecto (Acción suelta)</option>
                                {projects?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contextos</label>
                            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50 min-h-[42px]">
                                {contexts?.map(c => {
                                    const currentContexts = Array.isArray(formData.context)
                                        ? formData.context
                                        : (formData.context ? [formData.context] : []);

                                    const isSelected = currentContexts.includes(c.id);

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                const newContexts = isSelected
                                                    ? currentContexts.filter(id => id !== c.id)
                                                    : [...currentContexts, c.id];
                                                setFormData({ ...formData, context: newContexts });
                                            }}
                                            className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium border transition-all",
                                                isSelected
                                                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                                            )}
                                        >
                                            {c.name}
                                        </button>
                                    );
                                })}
                                {contexts?.length === 0 && <span className="text-xs text-gray-400 p-1">No hay contextos creados</span>}
                            </div>
                        </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700"
                                value={formData.status || 'next'}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="inbox">Inbox (Sin procesar)</option>
                                <option value="next">Siguiente Acción</option>
                                <option value="waiting">En Espera</option>
                                <option value="someday">Algún día</option>
                                <option value="completed">Completado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                            <div className="flex gap-2">
                                {['P1', 'P2', 'P3', 'P4'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={cn(
                                            "px-3 py-2 rounded text-sm font-bold border transition-colors",
                                            formData.priority === p
                                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                                onChange={e => {
                                    const dateStr = e.target.value;
                                    const timeStr = formData.dueDate ? new Date(formData.dueDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '00:00';
                                    if (dateStr) {
                                        const newDate = new Date(`${dateStr}T${timeStr}`);
                                        setFormData({ ...formData, dueDate: newDate.toISOString() });
                                    } else {
                                        setFormData({ ...formData, dueDate: null });
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora (Opcional)</label>
                            <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={formData.dueDate ? new Date(formData.dueDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                                onChange={e => {
                                    const timeStr = e.target.value;
                                    if (formData.dueDate) {
                                        const dateStr = formData.dueDate.split('T')[0];
                                        const newDate = new Date(`${dateStr}T${timeStr || '00:00'}`);
                                        setFormData({ ...formData, dueDate: newDate.toISOString() });
                                    } else {
                                        // If no date is selected but time is picks, select today
                                        const dateStr = new Date().toISOString().split('T')[0];
                                        const newDate = new Date(`${dateStr}T${timeStr || '00:00'}`);
                                        setFormData({ ...formData, dueDate: newDate.toISOString() });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Reminders Section */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recordatorios</label>

                        {/* List Existing Reminders */}
                        <div className="space-y-2 mb-3">
                            {formData.reminders && formData.reminders.map((reminder, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Bell size={14} className="text-blue-500" />
                                        <span>
                                            {new Date(reminder.time).toLocaleDateString()} at {new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {reminder.notified && <span className="text-xs text-green-500">(Ya notificado)</span>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newReminders = formData.reminders.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, reminders: newReminders });
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Reminder Input */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    id="new-reminder-input"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    const input = document.getElementById('new-reminder-input');
                                    if (input && input.value) {
                                        const newTime = new Date(input.value).toISOString();
                                        const newReminder = {
                                            id: crypto.randomUUID(),
                                            time: newTime,
                                            notified: false
                                        };
                                        const currentReminders = formData.reminders || [];
                                        setFormData({
                                            ...formData,
                                            reminders: [...currentReminders, newReminder]
                                        });
                                        input.value = ''; // Reset input
                                    }
                                }}
                            >
                                <Plus size={16} className="mr-1" /> Añadir
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
