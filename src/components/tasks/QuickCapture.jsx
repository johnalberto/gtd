import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export default function QuickCapture() {
    const [title, setTitle] = useState('');
    const { addTask } = useTasks();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            title,
            status: 'inbox',
            isActionable: null,
            createdAt: new Date().toISOString(),
            priority: 'P4'
        });
        setTitle('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Plus size={20} />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                    placeholder="Capturar tarea rápida... (Presiona Enter)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </form>
        </div>
    );
}
