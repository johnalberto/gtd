'use client';

import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMessage('');

        try {
            // We use next-auth/react signIn for credentials to avoid full page reload or complex server action handling for now, 
            // OR we can use the server action approach.
            // Let's use the client side signIn which calls the API route.
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setErrorMessage("Credenciales inválidas.");
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setErrorMessage("Ocurrió un error.");
        } finally {
            setIsPending(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <main className="flex items-center justify-center md:h-screen bg-gray-50 dark:bg-gray-900">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex h-20 w-full items-end rounded-lg bg-blue-600 p-3 md:h-36">
                    <div className="text-white w-full">
                        <h1 className="text-3xl font-bold">FocusPro</h1>
                        <p className="text-blue-100">Inicia sesión para continuar</p>
                    </div>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-3 bg-white dark:bg-gray-800 px-6 pb-4 pt-8 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
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
                                placeholder="Ingresa tu contraseña"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end relative z-10">
                        <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>

                    <Button className="w-full mt-4" disabled={isPending}>
                        {isPending ? 'Ingresando...' : 'Ingresar'}
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">O continua con</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={handleGoogleLogin}
                    >
                        Google
                    </Button>
                    <div className="mt-4 text-center">
                        <Link href="/register" className="text-sm text-blue-500 hover:text-blue-600">
                            ¿No tienes cuenta? Regístrate
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
