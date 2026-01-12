import React, { useState } from 'react';
import { formatRelativeDate } from '../../utils/dateHelpers';
import { PRIORITY_COLORS } from '../../utils/taskHelpers';
import { CheckCircle, Circle, Calendar, Tag, Layers, Edit2, Trash2, GripVertical, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTasks } from '../../context/TaskContext';

export default function TaskList({ tasks, onComplete, onDelete, onEdit, emptyMessage = "No hay tareas aquí." }) {
    const { updateTask, addTask } = useTasks();
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Layers className="w-12 h-12 mb-3 opacity-20" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    // Handles Drop: Make dragged task a child of target task
    const handleDrop = (e, targetTaskId) => {
        e.preventDefault();
        setDragOverId(null);
        if (!draggedTaskId || draggedTaskId === targetTaskId) return;

        // Update parentId to make it a child
        updateTask(draggedTaskId, { parentId: targetTaskId });
    };

    const handleCreateSubtask = (parentId) => {
        const parent = tasks.find(t => t.id === parentId);
        addTask({
            title: '',
            status: 'next',
            isActionable: true,
            projectId: parent?.projectId,
            parentId: parentId,
            createdAt: new Date().toISOString()
        });
        // Note: Ideally we would open it for editing, but for now this creates it. 
        // User can then edit it. 
        // Improvement: In next iteration, auto-focus.
    };

    // Recursive Tree Builder
    const taskMap = {};
    // Clone and init children
    tasks.forEach(t => taskMap[t.id] = { ...t, children: [] });

    // Using a Map for easier lookup if needed, but object is fine.
    // We only care about tasks that are IN the current list 'tasks'.
    // If a parent is NOT in 'tasks', the child should probably be shown at root level for this view 
    // (e.g. filtered view), BUT for Project view they should all be there.
    // Let's stick to simple logic: if parent is present in map, attach to it. Else root.

    const rootTasks = [];
    tasks.forEach(t => {
        if (t.parentId && taskMap[t.parentId]) {
            taskMap[t.parentId].children.push(taskMap[t.id]);
        } else {
            rootTasks.push(taskMap[t.id]);
        }
    });

    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => (
            <React.Fragment key={node.id}>
                <div
                    style={{ paddingLeft: `${level * 24}px` }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedTaskId !== node.id) setDragOverId(node.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => handleDrop(e, node.id)}
                    className={cn(
                        "transition-all duration-200 rounded-lg",
                        dragOverId === node.id && "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400"
                    )}
                >
                    <TaskItem
                        task={node}
                        onComplete={() => onComplete(node.id)}
                        onDelete={() => onDelete(node.id)}
                        onEdit={() => onEdit(node)}
                        onDragStart={() => setDraggedTaskId(node.id)}
                        onAddSubtask={() => handleCreateSubtask(node.id)}
                    />
                </div>
                {node.children.length > 0 && renderTree(node.children, level + 1)}
            </React.Fragment>
        ));
    };

    return (
        <div className="space-y-2 select-none">
            {renderTree(rootTasks)}
        </div>
    );
}

function TaskItem({ task, onComplete, onDelete, onEdit, onDragStart, onAddSubtask }) {
    const isCompleted = task.status === 'completed';
    // Handle array or single string for context
    const contextIds = Array.isArray(task.context) ? task.context : (task.context ? [task.context] : []);

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={cn(
                "group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
                isCompleted && "opacity-60"
            )}
        >
            <div className="text-gray-300 group-hover:text-gray-500 cursor-grab">
                <GripVertical size={16} />
            </div>

            <button
                onClick={onComplete}
                className="text-gray-400 hover:text-green-500 transition-colors"
            >
                {isCompleted ? <CheckCircle className="text-green-500" /> : <Circle />}
            </button>

            <div className="flex-1 min-w-0" onClick={() => onEdit && onEdit(task)}>
                <h3 className={cn("font-medium text-gray-900 dark:text-gray-100 truncate", isCompleted && "line-through")}>
                    {task.title || <span className="text-gray-400 italic">Nueva tarea...</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                    {task.projectId && (
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">
                            <Layers size={12} /> {task.projectId}
                        </span>
                    )}

                    {contextIds.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {contextIds.map(ctx => (
                                <span key={ctx} className="flex items-center gap-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                    <Tag size={12} /> {ctx}
                                </span>
                            ))}
                        </div>
                    )}

                    {task.dueDate && (
                        <span className={cn("flex items-center gap-1", task.dueDate && "text-orange-600 ml-auto")}>
                            <Calendar size={12} /> {formatRelativeDate(task.dueDate)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onAddSubtask(); }}
                    className="p-1 text-gray-400 hover:text-green-600"
                    title="Añadir Subtarea"
                >
                    <Plus size={18} />
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <span className={cn("px-2 py-0.5 text-xs font-bold rounded", PRIORITY_COLORS[task.priority])}>
                    {task.priority || 'P4'}
                </span>
                <button onClick={() => onEdit && onEdit(task)} className="p-1 text-gray-400 hover:text-blue-500">
                    <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
