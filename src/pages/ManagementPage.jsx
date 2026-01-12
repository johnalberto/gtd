import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ManagementPage({ title, items, onAdd, onDelete, placeholder }) {
    const [newItemName, setNewItemName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        onAdd(newItemName);
        setNewItemName('');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                <span className="text-sm text-gray-500">{items.length} elementos</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Añadir Nuevo</h2>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        placeholder={placeholder}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">
                        <Plus size={20} className="mr-2" />
                        Añadir
                    </Button>
                </form>
            </div>

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay elementos creados aún.</p>
                )}
            </div>
        </div>
    );
}
