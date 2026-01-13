'use client';

import TaskView from '@/components/tasks/TaskView';

export default function TodayPage() {
    return (
        <TaskView
            title="Hoy"
            description="Tareas programadas para hoy"
            filterFn={(task) => {
                if (!task.due_date || task.status === 'completed') return false;
                const today = new Date().toDateString();
                const dueDate = new Date(task.due_date).toDateString();
                return today === dueDate;
            }}
            emptyMessage="¡No tienes tareas para hoy! 🎉"
        />
    );
}
