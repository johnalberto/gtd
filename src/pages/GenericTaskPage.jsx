import React, { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/tasks/TaskList';
import TaskDetailModal from '../components/modals/TaskDetailModal';

export default function GenericTaskPage({ title, filterFn, emptyMessage }) {
    const { tasks, moveTaskTo, deleteTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);

    const filteredTasks = useMemo(() => {
        return filterFn ? filterFn(tasks) : tasks;
    }, [tasks, filterFn]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                <span className="text-sm text-gray-500">{filteredTasks.length} tareas</span>
            </div>

            <div className="mt-6">
                <TaskList
                    tasks={filteredTasks}
                    onComplete={(id) => moveTaskTo(id, 'completed')}
                    onDelete={deleteTask}
                    onEdit={(task) => setSelectedTask(task)}
                    emptyMessage={emptyMessage}
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
