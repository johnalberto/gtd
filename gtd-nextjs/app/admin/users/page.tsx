'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { User } from '@/lib/types';
import { Trash2, UserPlus, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', name: '', role: 'user' });

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/');
            return;
        }

        if (isAdmin) {
            fetchUsers();
        }
    }, [isLoading, isAdmin, router]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                setUsers(prev => [result.data, ...prev]);
                setIsAddModalOpen(false);
                setFormData({ email: '', name: '', role: 'user' });
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (id === user?.id) {
            alert("You cannot delete yourself.");
            return;
        }
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/admin/users/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setUsers(prev => prev.filter(u => u.id !== id));
                }
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    if (isLoading || loadingUsers) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center p-8">
                    <p>Loading...</p>
                </div>
            </AppLayout>
        );
    }

    if (!isAdmin) return null;

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Gestión de Usuarios
                    </h1>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <UserPlus size={18} className="mr-2" />
                        Agregar Usuario
                    </Button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name || 'Sin nombre'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {u.role === 'admin' ? (
                                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                <Shield size={12} className="mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-gray-600">
                                                <UserIcon size={12} className="mr-1" /> User
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                            disabled={u.id === user?.id}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add User Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4">Agregar Nuevo Usuario</h2>
                            <form onSubmit={handleCreateUser}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Rol</label>
                                        <select
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Guardar</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
