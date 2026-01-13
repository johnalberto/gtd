'use client';

import TaskView from '@/components/tasks/TaskView';

export default function SomedayPage() {
    return (
        <TaskView
            title="Algún Día"
            description="Ideas y tareas para el futuro"
            filterFn={(task) => task.status === 'someday'}
            emptyMessage="No hay tareas para algún día"
        />
    );
}
