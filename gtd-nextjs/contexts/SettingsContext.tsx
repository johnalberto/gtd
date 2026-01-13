'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SoundType = 'beep' | 'chime' | 'crystal' | 'rise' | 'drop' | 'phone' | 'siren' | 'pluck' | 'laser' | 'success' | 'warning' | 'none';

interface SettingsContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    notificationSound: SoundType;
    setNotificationSound: (sound: SoundType) => void;
    volume: number;
    setVolume: (volume: number) => void;
    notificationDuration: number;
    setNotificationDuration: (duration: number) => void;
    playNotification: () => void;
    requestPermission: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSound, setNotificationSound] = useState<SoundType>('beep');
    const [volume, setVolume] = useState(0.5);
    const [notificationDuration, setNotificationDuration] = useState(5); // Seconds

    // Load settings from localStorage
    useEffect(() => {
        const storedEnabled = localStorage.getItem('gtd_notifications_enabled');
        const storedSound = localStorage.getItem('gtd_notification_sound');
        const storedVolume = localStorage.getItem('gtd_notification_volume');
        const storedDuration = localStorage.getItem('gtd_notification_duration');

        if (storedEnabled !== null) setNotificationsEnabled(storedEnabled === 'true');
        if (storedSound) setNotificationSound(storedSound as SoundType);
        if (storedVolume) setVolume(parseFloat(storedVolume));
        if (storedDuration) setNotificationDuration(parseInt(storedDuration));
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem('gtd_notifications_enabled', String(notificationsEnabled));
    }, [notificationsEnabled]);

    useEffect(() => {
        localStorage.setItem('gtd_notification_sound', notificationSound);
    }, [notificationSound]);

    useEffect(() => {
        localStorage.setItem('gtd_notification_volume', String(volume));
    }, [volume]);

    useEffect(() => {
        localStorage.setItem('gtd_notification_duration', String(notificationDuration));
    }, [notificationDuration]);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    }, []);

    const playNotification = useCallback(() => {
        if (notificationSound === 'none' || !notificationsEnabled) return;

        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(ctx.destination);

            const endTime = ctx.currentTime + notificationDuration;

            const playSound = (time: number) => {
                if (time >= endTime) return;

                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator(); // For complex sounds

                osc.connect(gainNode);

                switch (notificationSound) {
                    case 'beep':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(800, time);
                        osc.frequency.exponentialRampToValueAtTime(400, time + 0.1);
                        osc.start(time);
                        osc.stop(time + 0.15);
                        // Loop every 0.5s
                        if (time + 0.5 < endTime) setTimeout(() => playSound(time + 0.5), (time + 0.5 - ctx.currentTime) * 1000);
                        break;
                    case 'chime':
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(600, time);
                        osc.frequency.linearRampToValueAtTime(1000, time + 0.2);
                        osc.start(time);
                        osc.stop(time + 1.0);
                        // Loop every 2s
                        if (time + 2 < endTime) setTimeout(() => playSound(time + 2), (time + 2 - ctx.currentTime) * 1000);
                        break;
                    case 'crystal':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(1200, time);
                        osc.frequency.exponentialRampToValueAtTime(800, time + 0.5);

                        osc2.connect(gainNode);
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(1800, time);
                        osc2.frequency.exponentialRampToValueAtTime(1200, time + 0.5);

                        osc.start(time);
                        osc2.start(time);
                        osc.stop(time + 0.5);
                        osc2.stop(time + 0.5);
                        // Loop every 1s
                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'rise':
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(200, time);
                        osc.frequency.exponentialRampToValueAtTime(800, time + 0.5);
                        gainNode.gain.setValueAtTime(volume, time);
                        gainNode.gain.linearRampToValueAtTime(0, time + 0.5);
                        osc.start(time);
                        osc.stop(time + 0.5);
                        // Loop every 1s
                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'drop':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(800, time);
                        osc.frequency.exponentialRampToValueAtTime(100, time + 0.4);
                        osc.start(time);
                        osc.stop(time + 0.4);
                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'phone':
                        // Dual tone 350 + 440 (Standard dial tone approx)
                        osc.frequency.setValueAtTime(350, time);
                        osc2.connect(gainNode);
                        osc2.frequency.setValueAtTime(440, time);
                        osc.start(time);
                        osc2.start(time);
                        // Ring-Ring pattern? Just continuous tone for phone usually, or pulse
                        // Let's do pulse: 0.4s on, 0.2s off, 0.4s on, 2s off
                        // Complex Pattern not easily done with simple recursion.
                        // Let's just do a 1s ring
                        osc.stop(time + 1);
                        osc2.stop(time + 1);
                        if (time + 2 < endTime) setTimeout(() => playSound(time + 2), (time + 2 - ctx.currentTime) * 1000);
                        break;
                    case 'siren':
                        // LFO effect manually
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(600, time);
                        osc.frequency.linearRampToValueAtTime(800, time + 0.5);
                        osc.frequency.linearRampToValueAtTime(600, time + 1.0);
                        osc.start(time);
                        osc.stop(time + 1.0);
                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'pluck':
                        osc.type = 'sawtooth';
                        // Low pass filter would be nice but expensive to setup. Just quick decay.
                        osc.frequency.setValueAtTime(440, time);
                        gainNode.gain.setValueAtTime(volume, time);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
                        osc.start(time);
                        osc.stop(time + 0.5);
                        if (time + 0.6 < endTime) setTimeout(() => playSound(time + 0.6), (time + 0.6 - ctx.currentTime) * 1000);
                        break;
                    case 'laser':
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(800, time);
                        osc.frequency.exponentialRampToValueAtTime(100, time + 0.2);
                        osc.start(time);
                        osc.stop(time + 0.2);
                        if (time + 0.3 < endTime) setTimeout(() => playSound(time + 0.3), (time + 0.3 - ctx.currentTime) * 1000);
                        break;
                    case 'success':
                        // Arpeggio C-E-G
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(523.25, time); // C5
                        osc.frequency.setValueAtTime(659.25, time + 0.1); // E5
                        osc.frequency.setValueAtTime(783.99, time + 0.2); // G5
                        osc.start(time);
                        osc.stop(time + 0.4);
                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'warning':
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(200, time);
                        osc2.connect(gainNode);
                        osc2.type = 'sawtooth';
                        osc2.frequency.setValueAtTime(205, time); // Detuned
                        osc.start(time);
                        osc2.start(time);
                        osc.stop(time + 0.5);
                        osc2.stop(time + 0.5);
                        if (time + 0.5 < endTime) setTimeout(() => playSound(time + 0.5), (time + 0.5 - ctx.currentTime) * 1000);
                        break;
                }
            };

            playSound(ctx.currentTime);

        } catch (e) {
            console.error('Audio playback failed', e);
        }
    }, [notificationSound, notificationsEnabled, volume, notificationDuration]);

    return (
        <SettingsContext.Provider value={{
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
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
