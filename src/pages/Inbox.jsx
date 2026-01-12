import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { getInboxTasks } from '../utils/taskHelpers';
import TaskList from '../components/tasks/TaskList';
import QuickCapture from '../components/tasks/QuickCapture';
import TaskDetailModal from '../components/modals/TaskDetailModal';

export default function Inbox() {
    const { tasks, updateTask, moveTaskTo, deleteTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);

    const inboxTasks = useMemo(() => getInboxTasks(tasks), [tasks]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inbox</h1>
                <span className="text-sm text-gray-500">{inboxTasks.length} tareas</span>
            </div>

            <QuickCapture />

            <div className="mt-6">
                <TaskList
                    tasks={inboxTasks}
                    onComplete={(id) => moveTaskTo(id, 'completed')}
                    onDelete={deleteTask}
                    onEdit={(task) => setSelectedTask(task)}
                    emptyMessage="Tu bandeja de entrada está vacía. ¡Gran trabajo!"
                />
            </div>

            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />
        </div>
    );
}
