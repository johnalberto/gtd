'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskModal from '@/components/modals/TaskModal';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="flex h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onNewTask={() => setIsTaskModalOpen(true)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                    onSettingsClick={() => router.push('/settings')}
                />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
            />
        </div>
    );
}
