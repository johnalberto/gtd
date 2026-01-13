'use client';

import TaskView from '@/components/tasks/TaskView';

export default function WaitingPage() {
    return (
        <TaskView
            title="En Espera"
            description="Tareas que están esperando por algo o alguien"
            filterFn={(task) => task.status === 'waiting'}
            emptyMessage="No hay tareas en espera"
        />
    );
}
