'use client';

import Button from '@/components/ui/Button';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setMessage(data.message || data.error);
        } catch (error) {
            setMessage('Error de conexión');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <main className="flex items-center justify-center md:h-screen bg-gray-50 dark:bg-gray-900">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex h-20 w-full items-end rounded-lg bg-blue-600 p-3 md:h-36">
                    <div className="text-white w-full">
                        <h1 className="text-3xl font-bold">FocusPro</h1>
                        <p className="text-blue-100">Recuperar Contraseña</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-gray-800 px-6 pb-4 pt-8 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="usuario@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                        {message && (
                            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
                        )}
                    </div>

                    <Button className="w-full mt-4" disabled={isPending}>
                        {isPending ? 'Enviando...' : 'Enviar instrucciones'}
                    </Button>

                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-sm text-blue-500 hover:text-blue-600">
                            Volver al login
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
