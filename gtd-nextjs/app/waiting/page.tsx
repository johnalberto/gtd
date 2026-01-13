'use client';

import { useTasks } from '@/contexts/TaskContext';
import Link from 'next/link';
import TaskView from '@/components/tasks/TaskView';

export default function WaitingPage() {
    const { projects } = useTasks();
    const waitingProjects = projects.filter(p => p.status === 'waiting');

    return (
        <TaskView
            title="En Espera"
            description="Tareas y proyectos que están esperando por algo o alguien"
            filterFn={(task) => task.status === 'waiting'}
            emptyMessage="No hay tareas en espera"
        >
            {waitingProjects.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Proyectos en Espera</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {waitingProjects.map(project => (
                            <Link
                                key={project.id}
                                href={`/project/${project.id}`}
                                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow opacity-75 hover:opacity-100"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: project.color || '#3B82F6' }}
                                    />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {project.name}
                                    </h3>
                                </div>
                                {project.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {project.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </TaskView>
    );
}
