'use client';

import Button from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || 'Error al registrarse');
            } else {
                // Redirect to login on success
                router.push('/login?registered=true');
            }
        } catch (error) {
            setErrorMessage('Error de conexión');
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
                        <p className="text-blue-100">Crea tu cuenta</p>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3 bg-white dark:bg-gray-800 px-6 pb-4 pt-8 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100" htmlFor="name">
                            Nombre
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Tu nombre completo"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
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
                    <div>
                        <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Crea una contraseña segura"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>

                    <Button className="w-full mt-4" disabled={isPending}>
                        {isPending ? 'Registrando...' : 'Registrarse'}
                    </Button>

                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-sm text-blue-500 hover:text-blue-600">
                            ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
