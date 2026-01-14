'use client';

import React, { useState } from 'react';
import { useSettings, SoundType } from '@/contexts/SettingsContext';
import { ArrowLeft, Volume2, Bell, Play, Lock, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        notificationSound,
        setNotificationSound,
        volume,
        setVolume,
        notificationDuration,
        setNotificationDuration,
        playNotification,
        requestPermission
    } = useSettings();
    const router = useRouter();

    const handleTestSound = () => {
        playNotification();
    };

    const handleEnableChange = async (enabled: boolean) => {
        setNotificationsEnabled(enabled);
        if (enabled) {
            await requestPermission();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Configuración</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">

                {/* Section: Notifications (Always visible) */}
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Bell size={20} className="text-blue-500" />
                        Notificaciones
                    </h2>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-700">Habilitar notificaciones y sonidos</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notificationsEnabled}
                                onChange={(e) => handleEnableChange(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section: Sound */}
                <div className={notificationsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                    <SettingsSection
                        title="Sonido"
                        icon={<Volume2 size={20} className="text-green-500" />}
                    >
                        <div className="grid gap-6 max-w-md pt-4">
                            {/* Sound Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tono de notificación</label>
                                <div className="flex gap-2">
                                    <select
                                        value={notificationSound}
                                        onChange={(e) => {
                                            setNotificationSound(e.target.value as SoundType);
                                        }}
                                        className="block w-full rounded-md border border-gray-300 bg-white dark:bg-slate-900 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <optgroup label="Simple">
                                            <option value="beep">Beep</option>
                                            <option value="chime">Timbre</option>
                                            <option value="phone">Teléfono</option>
                                        </optgroup>
                                        <optgroup label="Moderno">
                                            <option value="modern-1">Moderno Suave</option>
                                            <option value="modern-2">Futurista</option>
                                            <option value="crystal">Cristal</option>
                                            <option value="drop">Gota</option>
                                            <option value="pluck">Cuerda</option>
                                            <option value="success">Éxito</option>
                                        </optgroup>
                                        <optgroup label="Divertido">
                                            <option value="galaxy">Galaxia</option>
                                            <option value="happy">Feliz</option>
                                            <option value="arcade">Arcade</option>
                                        </optgroup>
                                        <optgroup label="Alertas">
                                            <option value="rise">Ascenso</option>
                                            <option value="siren">Sirena</option>
                                            <option value="laser">Láser</option>
                                            <option value="warning">Advertencia</option>
                                        </optgroup>
                                        <option value="none">Silencio</option>
                                    </select>
                                    <button
                                        onClick={handleTestSound}
                                        className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                        title="Probar sonido"
                                    >
                                        <Play size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Volume Slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Volumen: {Math.round(volume * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>

                            {/* Duration Slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duración: {notificationDuration} segundos
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="60"
                                        step="1"
                                        value={notificationDuration}
                                        onChange={(e) => setNotificationDuration(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <span className="text-sm text-gray-500 w-12">{notificationDuration}s</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    El sonido se repetirá o mantendrá durante este tiempo.
                                </p>
                            </div>
                        </div>
                    </SettingsSection>
                </div>

                <hr className="border-gray-100" />

                {/* Section: Profile */}
                <SettingsSection
                    title="Perfil"
                    icon={<UserIcon size={20} className="text-blue-600" />}
                >
                    <div className="pt-4">
                        <UserProfileForm />
                    </div>
                </SettingsSection>

                <hr className="border-gray-100" />

                {/* Section: Change Password */}
                <SettingsSection
                    title="Seguridad"
                    icon={<Lock size={20} className="text-purple-500" />}
                >
                    <div className="pt-4">
                        <ChangePasswordForm />
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
}

function UserProfileForm() {
    const { data: session, update } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [imagePreview, setImagePreview] = useState<string | null>(session?.user?.image || null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                setStatus('error');
                setMessage('La imagen no debe superar 1MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setImageBase64(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    image: imageBase64 !== null ? imageBase64 : session?.user?.image // Send new base64 or undefined to not update? API expects full update or check logic?
                    // actually if imageBase64 is null, we might not want to clear it if user didn't touch it.
                    // But if user wants to change name only?
                    // API implementation: SET name = ${name}, image = ${image}
                    // If I send existing image url (which might be base64), it works.
                    // If I send null, it clears it.
                    // Let's ensure we send something valid.
                    // If imageBase64 is null, it means USER DID NOT CHANGE IMAGE.
                    // So we should send valid existing image, OR make API handle partials.
                    // My API implementation overwrites both.
                    // So pass existing image if imageBase64 is null.
                }),
            });

            if (!res.ok) throw new Error('Error al actualizar perfil');

            // Trigger session update to fetch latest data from DB (handled in auth.ts jwt callback)
            await update();

            setStatus('success');
            setMessage('Perfil actualizado correctamente');
        } catch (error) {
            setStatus('error');
            setMessage('No se pudo actualizar el perfil');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            {message && (
                <div className={`p-3 rounded-md text-sm ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="flex items-center gap-6">
                <div className="relative group mx-auto sm:mx-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <UserIcon size={32} />
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                        <span className="text-xs font-medium">Cambiar</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Haz clic en la imagen para cambiar tu foto.</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex w-full rounded-xl border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-[#0070BA] focus:outline-none"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#003087] text-white px-6 py-2 rounded-full font-medium hover:bg-[#00256b] transition-colors disabled:opacity-50"
            >
                {status === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </form>
    );
}

function SettingsSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out">
                    {children}
                </div>
            )}
        </div>
    );
}

function ChangePasswordForm() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setStatus('loading');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus('error');
            setMessage('Las nuevas contraseñas no coinciden');
            return;
        }

        if (formData.newPassword.length < 6) {
            setStatus('error');
            setMessage('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al actualizar contraseña');
            }

            setStatus('success');
            setMessage('Contraseña actualizada correctamente');
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            {message && (
                <div className={`p-3 rounded-md text-sm ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña actual
                </label>
                <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nueva contraseña
                </label>
                <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar nueva contraseña
                </label>
                <input
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status === 'loading' ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
        </form>
    );
}
