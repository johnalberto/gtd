'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Bell, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface NotificationItem {
    id: string;
    title: string;
    time: string;
    type: 'task_due' | 'reminder';
    task_id?: string;
}

export default function ReminderMonitor() {
    const { notificationsEnabled, playNotification } = useSettings();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [activeNotifications, setActiveNotifications] = useState<NotificationItem[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const checkReminders = async () => {
        if (!notificationsEnabled) return;

        try {
            const res = await fetch('/api/reminders/check');
            const data = await res.json();

            if (data.success && data.notifications && data.notifications.length > 0) {
                const notifications: NotificationItem[] = data.notifications;

                // Add to active notifications if not already there
                setActiveNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNotifs = notifications.filter(n => !existingIds.has(n.id));

                    if (newNotifs.length > 0) {
                        playNotification();

                        // Trigger browser notification as fallback/companion
                        if (Notification.permission === 'granted') {
                            newNotifs.forEach(n => {
                                const text = n.type === 'task_due' ? `Tarea Vencida: ${n.title}` : `Recordatorio: ${n.title}`;
                                new Notification("FocusPro", { body: text });
                            });
                        }
                    }
                    return [...prev, ...newNotifs];
                });
            }
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    };

    const dismissNotification = async (id: string, type: 'task_due' | 'reminder') => {
        // Mark as acked in DB immediately so it doesn't pop up again
        await fetch('/api/reminders/ack', {
            method: 'POST',
            body: JSON.stringify({ ids: [id], type })
        });

        // Remove from UI
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        checkReminders();
        intervalRef.current = setInterval(checkReminders, 30000); // 30s
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [notificationsEnabled]);

    if (!isClient || activeNotifications.length === 0) return null;

    // Render Portal to body
    return createPortal(
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {activeNotifications.map(n => (
                <div key={n.id} className="pointer-events-auto bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-2xl rounded-r-lg p-4 animate-in slide-in-from-right duration-300 flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-300 shrink-0">
                        <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {n.type === 'task_due' ? 'Tarea Vencida' : 'Recordatorio'}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 truncate">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <button
                        onClick={() => dismissNotification(n.id, n.type)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={() => dismissNotification(n.id, n.type)}
                        className="p-1 hover:bg-green-100 text-green-500 rounded transition-colors shrink-0"
                        title="Entendido"
                    >
                        <Check size={18} />
                    </button>
                </div>
            ))}
        </div>,
        document.body
    );
}
