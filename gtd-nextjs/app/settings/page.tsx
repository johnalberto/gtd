'use client';

import React from 'react';
import { useSettings, SoundType } from '@/contexts/SettingsContext';
import { ArrowLeft, Volume2, Bell, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">

                {/* Section: Notifications */}
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
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Volume2 size={20} className="text-green-500" />
                        Sonido
                    </h2>

                    <div className="grid gap-6 max-w-md">
                        {/* Sound Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tono de notificación</label>
                            <div className="flex gap-2">
                                <select
                                    value={notificationSound}
                                    onChange={(e) => {
                                        setNotificationSound(e.target.value as SoundType);
                                        // Play sound immediately to preview? Optional.
                                    }}
                                    className="block w-full rounded-md border border-gray-300 bg-white dark:bg-slate-900 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <optgroup label="Simple">
                                        <option value="beep">Beep</option>
                                        <option value="chime">Chime</option>
                                        <option value="phone">Phone</option>
                                    </optgroup>
                                    <optgroup label="Moderno">
                                        <option value="crystal">Crystal</option>
                                        <option value="drop">Drop</option>
                                        <option value="pluck">Pluck</option>
                                        <option value="success">Success</option>
                                    </optgroup>
                                    <optgroup label="Alertas">
                                        <option value="rise">Rise</option>
                                        <option value="siren">Siren</option>
                                        <option value="laser">Laser</option>
                                        <option value="warning">Warning</option>
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
                </div>

            </div>
        </div>
    );
}
