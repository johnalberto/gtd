'use client';

import { useTasks } from '@/contexts/TaskContext';
import Link from 'next/link';
import TaskView from '@/components/tasks/TaskView';

export default function SomedayPage() {
    const { projects } = useTasks();
    const somedayProjects = projects.filter(p => p.status === 'someday');

    return (
        <TaskView
            title="Algún Día"
            description="Ideas, tareas y proyectos para el futuro"
            filterFn={(task) => task.status === 'someday'}
            emptyMessage="No hay tareas para algún día"
        >
            {somedayProjects.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Proyectos Algún Día</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {somedayProjects.map(project => (
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
