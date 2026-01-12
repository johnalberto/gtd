import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useTasks } from './TaskContext';
import { Howl } from 'howler';
import toast, { Toaster } from 'react-hot-toast';
import { SOUNDS, DEFAULT_SOUND_ID } from '../data/sounds';

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { tasks, updateTask } = useTasks();
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('gtd-notification-settings');
        return saved ? JSON.parse(saved) : {
            enabled: true,
            soundId: DEFAULT_SOUND_ID,
            volume: 0.5
        };
    });

    const [hasPermission, setHasPermission] = useState(Notification.permission === 'granted');
    const processedRef = useRef(new Set()); // Keep track of tasks processed in this session to avoid double loops if data changes

    // Save settings
    useEffect(() => {
        localStorage.setItem('gtd-notification-settings', JSON.stringify(settings));
    }, [settings]);

    // Request permission helper
    const requestPermission = async () => {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
        return permission === 'granted';
    };

    const currentSoundRef = useRef({ sound: null, stopTimeout: null });

    // Stop Sound Helper
    const stopSound = () => {
        if (currentSoundRef.current.sound) {
            currentSoundRef.current.sound.stop();
            clearTimeout(currentSoundRef.current.stopTimeout);
            currentSoundRef.current = { sound: null, stopTimeout: null };
        }
    };

    // Play Sound Helper
    const playSound = (soundId = settings.soundId) => {
        if (!settings.enabled) return;

        // Stop current if exists
        if (currentSoundRef.current.sound) {
            currentSoundRef.current.sound.stop();
            clearTimeout(currentSoundRef.current.stopTimeout);
        }

        const soundDef = SOUNDS[soundId] || SOUNDS[DEFAULT_SOUND_ID];
        const sound = new Howl({
            src: [soundDef.src],
            volume: settings.volume,
            html5: true, // Force HTML5 Audio to stream widely used formats
        });

        const id = sound.play();

        // Auto-stop after 20 seconds
        const stopTimeout = setTimeout(() => {
            if (sound.playing(id)) {
                sound.fade(settings.volume, 0, 1000, id);
                setTimeout(() => sound.stop(id), 1000);
            }
        }, 20000);

        // Store active reference
        currentSoundRef.current = { sound, stopTimeout };
    };

    // Check loop
    useEffect(() => {
        if (!settings.enabled) return;

        const checkInterval = setInterval(() => {
            const now = new Date();

            tasks.forEach(task => {
                // 1. ORIGINAL DUE DATE LOGIC
                if (task.dueDate && task.status !== 'completed' && !task.notified) {
                    const due = new Date(task.dueDate);
                    if (due <= now) {
                        playSound();
                        toast((t) => (
                            <div className="flex items-center gap-2" onClick={() => toast.dismiss(t.id)}>
                                <span>⏰ <b>{task.title}</b> ha vencido!</span>
                            </div>
                        ), { duration: 5000, position: 'top-right', icon: '🔔' });

                        if (hasPermission) {
                            new Notification('Tarea Vencida', {
                                body: `La tarea "${task.title}" ha vencido.`,
                                icon: '/pwa-512x512.png'
                            });
                        }
                        updateTask(task.id, { notified: true });
                    }
                }

                // 2. NEW REMINDERS ARRAY LOGIC
                if (task.reminders && Array.isArray(task.reminders) && task.status !== 'completed') {
                    let remindersChanged = false;
                    const updatedReminders = task.reminders.map(reminder => {
                        if (!reminder.notified && reminder.time) {
                            const reminderTime = new Date(reminder.time);
                            if (reminderTime <= now) {
                                // Trigger Alarm
                                playSound();

                                // Show specific toast for reminder
                                toast((t) => (
                                    <div className="flex items-center gap-2" onClick={() => toast.dismiss(t.id)}>
                                        <span>🔔 Recordatorio: <b>{task.title}</b></span>
                                    </div>
                                ), { duration: 5000, position: 'top-right', icon: '⏰' });

                                if (hasPermission) {
                                    new Notification('Recordatorio', {
                                        body: `Recordatorio para: "${task.title}"`,
                                        icon: '/pwa-512x512.png'
                                    });
                                }

                                remindersChanged = true;
                                return { ...reminder, notified: true };
                            }
                        }
                        return reminder;
                    });

                    if (remindersChanged) {
                        updateTask(task.id, { reminders: updatedReminders });
                    }
                }
            });

        }, 15000); // Check every 15 seconds (more frequent for reminders)

        return () => clearInterval(checkInterval);
    }, [tasks, settings, hasPermission, updateTask]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <NotificationContext.Provider value={{
            settings,
            updateSettings,
            playSound,
            stopSound,
            requestPermission,
            hasPermission
        }}>
            {children}
            <Toaster />
        </NotificationContext.Provider>
    );
}
