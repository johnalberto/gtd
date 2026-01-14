'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export type SoundType =
    | 'beep' | 'chime' | 'crystal' | 'rise' | 'drop'
    | 'phone' | 'siren' | 'pluck' | 'laser' | 'success' | 'warning'
    | 'modern-1' | 'modern-2' | 'galaxy' | 'happy' | 'arcade'
    | 'none';

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
    const { data: session } = useSession();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSound, setNotificationSound] = useState<SoundType>('beep');
    const [volume, setVolume] = useState(0.5);
    const [notificationDuration, setNotificationDuration] = useState(5); // Seconds

    // Use refs to track if initial load happened to avoid overwriting remote with local defaults
    const isLoaded = useRef(false);

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            // Try load from API if logged in
            if (session?.user) {
                try {
                    const res = await fetch('/api/settings');
                    if (res.ok) {
                        const data = await res.json();
                        const s = data.settings;
                        if (s) {
                            if (s.notificationsEnabled !== undefined) setNotificationsEnabled(s.notificationsEnabled);
                            if (s.notificationSound) setNotificationSound(s.notificationSound);
                            if (s.volume !== undefined) setVolume(s.volume);
                            if (s.notificationDuration !== undefined) setNotificationDuration(s.notificationDuration);
                            isLoaded.current = true;
                            return; // Success, skip localStorage
                        }
                    }
                } catch (e) {
                    console.error('Error loading settings from API', e);
                }
            }

            // Fallback to localStorage
            const storedEnabled = localStorage.getItem('gtd_notifications_enabled');
            const storedSound = localStorage.getItem('gtd_notification_sound');
            const storedVolume = localStorage.getItem('gtd_notification_volume');
            const storedDuration = localStorage.getItem('gtd_notification_duration');

            if (storedEnabled !== null) setNotificationsEnabled(storedEnabled === 'true');
            if (storedSound) setNotificationSound(storedSound as SoundType);
            if (storedVolume) setVolume(parseFloat(storedVolume));
            if (storedDuration) setNotificationDuration(parseInt(storedDuration));
            isLoaded.current = true;
        };

        loadSettings();
    }, [session]);

    // Save settings (Debounce could be better but direct for now)
    const saveSettings = useCallback(async (newSettings: any) => {
        // Always save to localStorage
        if (newSettings.notificationsEnabled !== undefined) localStorage.setItem('gtd_notifications_enabled', String(newSettings.notificationsEnabled));
        if (newSettings.notificationSound) localStorage.setItem('gtd_notification_sound', newSettings.notificationSound);
        if (newSettings.volume !== undefined) localStorage.setItem('gtd_notification_volume', String(newSettings.volume));
        if (newSettings.notificationDuration !== undefined) localStorage.setItem('gtd_notification_duration', String(newSettings.notificationDuration));

        // Save to API if logged in and loaded
        if (session?.user && isLoaded.current) {
            try {
                await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSettings),
                });
            } catch (e) {
                console.error('Error saving settings to API', e);
            }
        }
    }, [session]);

    // Effect to trigger save when state changes
    useEffect(() => {
        if (!isLoaded.current) return;
        saveSettings({ notificationsEnabled });
    }, [notificationsEnabled, saveSettings]);

    useEffect(() => {
        if (!isLoaded.current) return;
        saveSettings({ notificationSound });
    }, [notificationSound, saveSettings]);

    useEffect(() => {
        if (!isLoaded.current) return;
        saveSettings({ volume });
    }, [volume, saveSettings]);

    useEffect(() => {
        if (!isLoaded.current) return;
        saveSettings({ notificationDuration });
    }, [notificationDuration, saveSettings]);

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
                const osc2 = ctx.createOscillator();
                const osc3 = ctx.createOscillator();

                osc.connect(gainNode);

                switch (notificationSound) {
                    case 'beep':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(800, time);
                        osc.frequency.exponentialRampToValueAtTime(400, time + 0.1);
                        osc.start(time);
                        osc.stop(time + 0.15);
                        if (time + 0.5 < endTime) setTimeout(() => playSound(time + 0.5), (time + 0.5 - ctx.currentTime) * 1000);
                        break;
                    case 'modern-1':
                        // Soft synth pluck
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(440, time);
                        osc.frequency.linearRampToValueAtTime(880, time + 0.05);
                        gainNode.gain.setValueAtTime(volume * 0.8, time);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
                        osc.start(time);
                        osc.stop(time + 0.3);

                        // Harmony
                        osc2.connect(gainNode);
                        osc2.type = 'sine';
                        osc2.frequency.setValueAtTime(554.37, time); // C#
                        osc2.start(time);
                        osc2.stop(time + 0.3);

                        if (time + 1 < endTime) setTimeout(() => playSound(time + 1), (time + 1 - ctx.currentTime) * 1000);
                        break;
                    case 'modern-2':
                        // Sci-fi sweep
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(200, time);
                        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.2);
                        osc.frequency.exponentialRampToValueAtTime(200, time + 0.4);
                        osc.start(time);
                        osc.stop(time + 0.4);
                        if (time + 1.5 < endTime) setTimeout(() => playSound(time + 1.5), (time + 1.5 - ctx.currentTime) * 1000);
                        break;
                    case 'galaxy':
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(800, time);
                        osc.frequency.linearRampToValueAtTime(1200, time + 0.1);
                        // Very fast tremolo
                        const lfo = ctx.createOscillator();
                        lfo.frequency.value = 20;
                        const lfoGain = ctx.createGain();
                        lfoGain.gain.value = 500;
                        lfo.connect(lfoGain);
                        lfoGain.connect(osc.frequency);
                        lfo.start(time);
                        lfo.stop(time + 1.0);
                        osc.start(time);
                        osc.stop(time + 1.0);
                        if (time + 2 < endTime) setTimeout(() => playSound(time + 2), (time + 2 - ctx.currentTime) * 1000);
                        break;
                    case 'happy':
                        // Major Triad Arpeggio (Fast)
                        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
                        notes.forEach((freq, i) => {
                            const o = ctx.createOscillator();
                            const g = ctx.createGain();
                            o.connect(g);
                            g.connect(ctx.destination);
                            o.type = 'sine';
                            o.frequency.value = freq;
                            g.gain.setValueAtTime(volume * 0.5, time + i * 0.08);
                            g.gain.exponentialRampToValueAtTime(0.01, time + i * 0.08 + 0.3);
                            o.start(time + i * 0.08);
                            o.stop(time + i * 0.08 + 0.3);
                        });
                        if (time + 2 < endTime) setTimeout(() => playSound(time + 2), (time + 2 - ctx.currentTime) * 1000);
                        break;
                    case 'arcade':
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(220, time);
                        osc.frequency.setValueAtTime(440, time + 0.1);
                        osc.frequency.setValueAtTime(880, time + 0.2);
                        osc.start(time);
                        osc.stop(time + 0.3);
                        if (time + 0.5 < endTime) setTimeout(() => playSound(time + 0.5), (time + 0.5 - ctx.currentTime) * 1000);
                        break;
                    // ... existing cases ...
                    case 'chime':
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(600, time);
                        osc.frequency.linearRampToValueAtTime(1000, time + 0.2);
                        osc.start(time);
                        osc.stop(time + 1.0);
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
                        osc.frequency.setValueAtTime(350, time);
                        osc2.connect(gainNode);
                        osc2.frequency.setValueAtTime(440, time);
                        osc.start(time);
                        osc2.start(time);
                        osc.stop(time + 1);
                        osc2.stop(time + 1);
                        if (time + 2 < endTime) setTimeout(() => playSound(time + 2), (time + 2 - ctx.currentTime) * 1000);
                        break;
                    case 'siren':
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
                        osc2.frequency.setValueAtTime(205, time);
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

