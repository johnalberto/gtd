import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { SOUNDS } from '../../data/sounds';
import { Volume2, Play, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
    const { settings, updateSettings, playSound, stopSound, requestPermission, hasPermission } = useNotifications();

    const handleClose = () => {
        stopSound();
        onClose();
    };

    const handlePermissionRequest = async () => {
        const granted = await requestPermission();
        if (granted) {
            // Optional: Test notification
            new Notification('Notificaciones Activadas', { body: 'FocusPro te avisará cuando venza una tarea.' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuración de Notificaciones">
            <div className="space-y-6">

                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Volume2 className={settings.enabled ? "text-blue-500" : "text-gray-400"} />
                        <span className="font-medium">Sonido de Alarma</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.enabled}
                            onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Sound Selector */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tono de Alarma</label>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(SOUNDS).map(sound => (
                            <div
                                key={sound.id}
                                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${settings.soundId === sound.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                    }`}
                                onClick={() => {
                                    updateSettings({ soundId: sound.id });
                                    playSound(sound.id);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.soundId === sound.id ? 'border-blue-500' : 'border-gray-400'
                                        }`}>
                                        {settings.soundId === sound.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <span>{sound.name}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playSound(sound.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-500"
                                >
                                    <Play size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Browser Permissions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Notificaciones de Escritorio</span>
                        {hasPermission ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <Check size={14} /> Activadas
                            </span>
                        ) : (
                            <Button size="sm" variant="secondary" onClick={handlePermissionRequest}>
                                Activar Permisos
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleClose}>Listo</Button>
                </div>
            </div>
        </Modal>
    );
}
