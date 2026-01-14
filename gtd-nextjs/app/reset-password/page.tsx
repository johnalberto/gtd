'use client';

import Button from '@/components/ui/Button';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            setIsError(true);
            return;
        }

        if (!token) {
            setMessage('Token no válido');
            setIsError(true);
            return;
        }

        setIsPending(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage('Contraseña actualizada! Redirigiendo...');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setMessage(data.error);
                setIsError(true);
            }
        } catch (error) {
            setMessage('Error de conexión');
            setIsError(true);
        } finally {
            setIsPending(false);
        }
    };

    if (!token) {
        return <p className="text-red-500">Token no proporcionado.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-gray-800 px-6 pb-4 pt-8 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
                <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100" htmlFor="password">
                    Nueva Contraseña
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100" htmlFor="confirm">
                    Confirmar Contraseña
                </label>
                <div className="relative">
                    <input
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        id="confirm"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex be items-end space-x-1 pt-2" aria-live="polite" aria-atomic="true">
                {message && (
                    <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
                )}
            </div>

            <Button className="w-full mt-4" disabled={isPending}>
                {isPending ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="flex items-center justify-center md:h-screen bg-gray-50 dark:bg-gray-900">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex h-20 w-full items-end rounded-lg bg-blue-600 p-3 md:h-36">
                    <div className="text-white w-full">
                        <h1 className="text-3xl font-bold">FocusPro</h1>
                        <p className="text-blue-100">Restablecer Contraseña</p>
                    </div>
                </div>

                <Suspense fallback={<p>Cargando...</p>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-blue-500 hover:text-blue-600">
                        Volver al login
                    </Link>
                </div>
            </div>
        </main>
    );
}
