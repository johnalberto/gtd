'use client';

import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface HeaderProps {
    onMenuClick: () => void;
    onSettingsClick: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
    const { data: session } = useSession();

    // Calculate initials
    const name = session?.user?.name || '';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';

    return (
        <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:px-6">
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300 overflow-hidden">
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <button
                    onClick={onSettingsClick}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title="Configuración"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
}
