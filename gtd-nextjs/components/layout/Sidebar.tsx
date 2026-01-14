'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Inbox, Sun, CheckSquare, Layers,
    Tag, Archive, Clock, PlusCircle, Calendar, Users, Filter
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
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all duration-200",
                isActive
                    ? "bg-[#E6F6FF] text-[#0070BA] dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-semibold",
                    isActive
                        ? "bg-[#BFE8FF] text-[#005ea6] dark:bg-blue-800 dark:text-blue-200"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}>
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
        <aside className="w-72 bg-white dark:bg-gray-900 flex flex-col shadow-xl z-20 h-screen sticky top-0">
            <div className="flex items-center h-20 px-8">
                <span className="text-2xl font-bold text-[#003087] dark:text-white tracking-tight">FocusPro</span>
            </div>

            <nav className="p-4 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-8 px-2">
                    <button
                        onClick={onNewTask}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white bg-[#003087] hover:bg-[#00256b] rounded-full transition-all shadow-md hover:shadow-lg font-semibold text-sm transform active:scale-95"
                    >
                        <PlusCircle size={20} />
                        <span>Nueva Tarea</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <NavItem href="/inbox" icon={<Inbox size={20} />} label="Inbox" count={inboxCount} />
                    <NavItem href="/today" icon={<Sun size={20} className="text-yellow-500" />} label="Hoy" count={todayCount} />
                    <NavItem href="/upcoming" icon={<Calendar size={20} className="text-violet-500" />} label="Próximos" />
                    <NavItem href="/calendar" icon={<Calendar size={20} className="text-blue-500" />} label="Calendario" />
                    <NavItem href="/next-actions" icon={<CheckSquare size={20} className="text-green-500" />} label="Siguiente Acción" />
                    <NavItem href="/filters" icon={<Filter size={20} className="text-[#0070BA]" />} label="Filtros" />
                </div>

                <div className="pt-6 pb-2">
                    <div className="flex items-center justify-between px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Proyectos</span>
                        <Link href="/projects" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-[#0070BA]">
                            <PlusCircle size={16} />
                        </Link>
                    </div>
                    <div className="space-y-1">
                        {projects && projects.length > 0 ? (
                            projects.map(p => (
                                <NavItem key={p.id} href={`/project/${p.id}`} icon={<Layers size={18} />} label={p.name} />
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-400 italic">Sin proyectos</div>
                        )}
                    </div>
                </div>

                <div className="space-y-1 pt-4">
                    <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Etiquetas</div>
                    <NavItem href="/contexts" icon={<Tag size={18} />} label="Contextos" />
                    <NavItem href="/waiting" icon={<Clock size={18} />} label="En Espera" />
                    <NavItem href="/someday" icon={<Archive size={18} />} label="Algún día" />
                </div>

                {isAdmin && (
                    <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</div>
                        <NavItem href="/admin/users" icon={<Users size={18} />} label="Usuarios" />
                    </div>
                )}
            </nav>

            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => {
                        import('next-auth/react').then(({ signOut }) => signOut());
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 rounded-full transition-all w-full group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-600 transition-colors"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    <span className="flex-1 text-left">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
