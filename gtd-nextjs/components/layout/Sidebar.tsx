'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Inbox, Sun, CheckSquare, Layers,
    Tag, Archive, Clock, PlusCircle, Calendar, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    count?: number;
}

function NavItem({ href, icon, label, count }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {count !== undefined && count > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {count}
                </span>
            )}
        </Link>
    );
}

interface SidebarProps {
    onNewTask: () => void;
}

export default function Sidebar({ onNewTask }: SidebarProps) {
    const { tasks, projects } = useTasks();
    const { isAdmin } = useAuth();

    // Count inbox tasks
    const inboxCount = tasks.filter(t => t.status === 'inbox').length;
    const todayCount = tasks.filter(t => {
        if (!t.due_date) return false;
        const today = new Date().toDateString();
        const dueDate = new Date(t.due_date).toDateString();
        return today === dueDate;
    }).length;

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">FocusPro</span>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                <div className="mb-6">
                    <button
                        onClick={onNewTask}
                        className="w-full flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                    >
                        <PlusCircle size={20} />
                        <span>Nueva Tarea</span>
                    </button>
                </div>

                <NavItem href="/inbox" icon={<Inbox size={20} />} label="Inbox" count={inboxCount} />
                <NavItem href="/today" icon={<Sun size={20} className="text-yellow-500" />} label="Hoy" count={todayCount} />
                <NavItem href="/upcoming" icon={<Calendar size={20} className="text-violet-500" />} label="Próximos" />
                <NavItem href="/calendar" icon={<Calendar size={20} className="text-blue-500" />} label="Calendario" />
                <NavItem href="/next-actions" icon={<CheckSquare size={20} className="text-green-500" />} label="Siguiente Acción" />

                <div className="pt-4 pb-2">
                    <div className="flex items-center justify-between px-3 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Proyectos</span>
                        <Link href="/projects" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <PlusCircle size={14} />
                        </Link>
                    </div>
                    {projects && projects.length > 0 ? (
                        projects.map(p => (
                            <NavItem key={p.id} href={`/project/${p.id}`} icon={<Layers size={18} />} label={p.name} />
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-400 italic">Sin proyectos</div>
                    )}
                </div>

                <NavItem href="/contexts" icon={<Tag size={20} />} label="Contextos" />
                <NavItem href="/waiting" icon={<Clock size={20} />} label="En Espera" />
                <NavItem href="/someday" icon={<Archive size={20} />} label="Algún día" />

                {isAdmin && (
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Admin
                        </div>
                        <NavItem href="/admin/users" icon={<Users size={20} />} label="Usuarios" />
                    </div>
                )}

                <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            // Dynamic import to avoid SSR issues if needed, or just standard signout
                            import('next-auth/react').then(({ signOut }) => signOut());
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors w-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        <span className="flex-1 text-left">Cerrar Sesión</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
