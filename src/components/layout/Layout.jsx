import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Inbox, Sun, Calendar, CheckSquare, Layers,
    Tag, Archive, Clock, Menu, PlusCircle, Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTasks } from '../../context/TaskContext';
import { getInboxTasks } from '../../utils/taskHelpers';
import TaskDetailModal from '../modals/TaskDetailModal';
import SettingsModal from '../modals/SettingsModal';

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const { tasks, projects, addTask } = useTasks();

    // Counters
    const inboxCount = getInboxTasks(tasks).length;

    const handleCreateTask = () => {
        addTask({
            title: 'Nueva Tarea',
            status: 'inbox',
            isActionable: null, // Trigger clarification
            createdAt: new Date().toISOString()
        });
        // We actually want to open the modal for a NEW task, not just add it. 
        // But TaskDetailModal takes a 'task' prop. 
        // So we might need to Create it first then edit, OR make modal support "new".
        // Current pattern: Create stub then edit.
    };

    // Better UX: Open modal with empty state (or stub)
    // Let's use the pattern: Add temp task, open modal? 
    // Or just pass null to modal and let it handle "Create"?
    // TaskDetailModal seems to depend on 'task' existing.
    // Let's create a "draft" task in memory or context.

    // Simplest for now: Create a stub task in context and open it.
    const handleNewTaskClick = () => {
        const newTask = addTask({
            title: '',
            status: 'inbox',
            isActionable: null,
            priority: 'P4',
        });
        setEditingTask(newTask);
        setIsNewTaskModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">

            {isSettingsOpen && (
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            )}
            {isNewTaskModalOpen && editingTask && (
                <TaskDetailModal
                    isOpen={isNewTaskModalOpen}
                    onClose={() => {
                        setIsNewTaskModalOpen(false);
                        setEditingTask(null); // Clear editing task when modal closes
                    }}
                    task={editingTask}
                />
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">FocusPro</span>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="mb-6">
                        <button
                            onClick={handleNewTaskClick}
                            className="w-full flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium">
                            <PlusCircle size={20} />
                            <span>Nueva Tarea</span>
                        </button>
                    </div>

                    <NavItem to="/" icon={<Inbox size={20} />} label="Inbox" count={inboxCount} />
                    <NavItem to="/today" icon={<Sun size={20} className="text-yellow-500" />} label="Hoy" count={0} />
                    <NavItem to="/next-actions" icon={<CheckSquare size={20} className="text-green-500" />} label="Siguiente Acción" />

                    <div className="pt-4 pb-2">
                        <div className="flex items-center justify-between px-3 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <span>Proyectos</span>
                            <Link to="/projects" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><PlusCircle size={14} /></Link>
                        </div>
                        {projects && projects.length > 0 ? (
                            projects.map(p => (
                                <NavItem key={p.id} to={`/project/${p.id}`} icon={<Layers size={18} />} label={p.name} />
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-400 italic">Sin proyectos</div>
                        )}
                    </div>

                    <NavItem to="/contexts" icon={<Tag size={20} />} label="Contextos" />
                    <NavItem to="/waiting" icon={<Clock size={20} />} label="En Espera" />
                    <NavItem to="/someday" icon={<Archive size={20} />} label="Algún día" />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:px-6">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
                            JS
                        </div>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            title="Configuración"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, count }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
        >
            {icon}
            <span className="flex-1">{label}</span>
            {count && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {count}
                </span>
            )}
        </Link>
    );
}

// Helper component to handle new task creation flow
function NewTaskHandler({ isOpen, onClose }) {
    // Only access context when rendered
    const { addTask } = useTasks();
    const [tempTask, setTempTask] = useState(null);

    React.useEffect(() => {
        if (isOpen && !tempTask) {
            // Create a new task immediately? Or just mock it? 
            // To reuse TaskDetailModal we usually need a real task (for ID).
            // But let's see if we can trick it. 
            // Actually, the cleanest is to CREATE the task with title "Nueva Tarea" and then edit it.
            const newTask = {
                title: '', // Empty title
                status: 'inbox',
                isActionable: null,
                priority: 'P4',
                createdAt: new Date().toISOString()
            };
            // Since addTask doesn't return ID (void), we must create ID here if we want to track it,
            // or modify addTask. 
            // Let's modify addTask in next step if needed. 
            // For now, I will implement a simpler "Quick Add" modal or Input directly?
            // User probably wants the full modal.

            // Allow me to Add Task with specific ID so I can track it?
            // Or better: Just render a Modal that onSave calls addTask.
            // TaskDetailModal calls updateTask(id, ...).
            // It is tightly coupled to editing existing tasks.

            // Quick Fix: Create a wrapper that acts as "New Task Modal".
        }
    }, [isOpen]);

    // For now, let's just use QuickCapture logic or custom modal?
    // Let's make a "CreateTaskModal" that reuses the form?
    // Too much work to refactor TaskDetailModal now.

    // Quickest user-friendly solution:
    // When "New Task" is clicked -> Add a blank task to Inbox -> Open it in Edit Mode.
    // I need to be able to get the reference. 

    return null; // Placeholder until I fix TaskContext
}
