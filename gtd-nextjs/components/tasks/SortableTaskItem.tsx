'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Edit, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps {
    task: Task;
    depth: number;
    onComplete: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    hasChildren: boolean;
    onSelect?: () => void;
    isSelected?: boolean;
}

export function SortableTaskItem({
    task,
    depth,
    onComplete,
    onEdit,
    onDelete,
    isExpanded,
    onToggleExpand,
    hasChildren,
    onSelect,
    isSelected
}: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver
    } = useSortable({ id: task.id, data: { task, depth } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 24}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                // Prevent selection when clicking buttons
                if ((e.target as HTMLElement).closest('button')) return;
                onSelect?.();
            }}
            className={cn(
                "group flex items-center gap-2 py-2 px-3 rounded-lg border transition-shadow mb-2 cursor-pointer",
                isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm",
                isDragging && "shadow-lg ring-2 ring-blue-500 z-50",
                isOver && !isDragging && !isSelected && "bg-blue-50 dark:bg-blue-900/40 border-blue-500 ring-1 ring-blue-500"
            )}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical size={16} />
            </div>

            <div className="flex-none w-6 flex items-center justify-center">
                {hasChildren ? (
                    <button onClick={() => onToggleExpand(task.id)} className="text-gray-500 hover:text-gray-700">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : <div className="w-4" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.title}
                    </h3>
                    {task.priority !== 'P4' && (
                        <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                        </Badge>
                    )}
                </div>
                {(task.notes || task.due_date) && (
                    <div className="text-xs text-gray-500 flex gap-3 mt-1">
                        {task.due_date && <span>📅 {formatDate(task.due_date)}</span>}
                        {task.notes && <span className="truncate max-w-[200px]">{task.notes}</span>}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onComplete(task.id)}
                    title="Completar"
                >
                    <CheckCircle2 size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(task)}
                    title="Editar"
                >
                    <Edit size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(task.id)}
                    title="Eliminar"
                >
                    <Trash2 size={16} className="text-red-500" />
                </Button>
            </div>
        </div>
    );
}
