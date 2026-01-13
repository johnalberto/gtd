'use client';

import TaskView from '@/components/tasks/TaskView';

export default function NextActionsPage() {
    return (
        <TaskView
            title="Próximas Acciones"
            description="Tareas accionables que puedes hacer ahora"
            filterFn={(task) => task.status === 'next-actions' && task.is_actionable === true}
            emptyMessage="No hay próximas acciones definidas"
        />
    );
}
