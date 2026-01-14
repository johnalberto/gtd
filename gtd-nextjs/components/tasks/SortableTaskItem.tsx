'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Edit, Trash2, GripVertical, ChevronDown, ChevronRight, MoreVertical, ArrowUp, ArrowDown, Indent, Outdent } from 'lucide-react';
import { formatDate, getPriorityColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
    onManualMove?: (action: 'up' | 'down' | 'indent' | 'outdent') => void;
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
    isSelected,
    onManualMove
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

    const [showMenu, setShowMenu] = useState(false);

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
                "group flex items-center gap-2 py-2 px-3 rounded-lg border transition-shadow mb-2 cursor-pointer relative",
                isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm",
                isDragging && "shadow-lg ring-2 ring-blue-500 z-50",
                isOver && !isDragging && !isSelected && "bg-blue-50 dark:bg-blue-900/40 border-blue-500 ring-1 ring-blue-500"
            )}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-1 -ml-1 touch-none">
                <GripVertical size={20} />
            </div>

            <div className="flex-none w-6 flex items-center justify-center">
                {hasChildren ? (
                    <button onClick={() => onToggleExpand(task.id)} className="text-gray-500 hover:text-gray-700 p-1">
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

            {/* Actions Section */}
            <div className="flex items-center gap-1 ml-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                {/* Mobile Actions Menu Trigger */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 lg:hidden" // Visible only on mobile/tablet via loop? Actually group-hover works on mobile with tap. 
                        // But let's make it always visible on small screens? No, stick to consistent UI.
                        // Ideally we want a button that is always accessible on mobile.
                        // On mobile, hover doesn't exist, so this entire block might be hidden unless tapped?
                        // 'group-hover' on mobile is sticky on tap.
                        onClick={() => setShowMenu(!showMenu)}
                        title="Opciones"
                    >
                        <MoreVertical size={16} />
                    </Button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-1 flex flex-col min-w-[140px]">
                                <span className="px-2 py-1 text-xs font-semibold text-gray-500">Mover</span>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left"
                                    onClick={() => { onManualMove?.('up'); setShowMenu(false); }}>
                                    <ArrowUp size={14} /> Subir
                                </button>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left"
                                    onClick={() => { onManualMove?.('down'); setShowMenu(false); }}>
                                    <ArrowDown size={14} /> Bajar
                                </button>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left"
                                    onClick={() => { onManualMove?.('indent'); setShowMenu(false); }}>
                                    <Indent size={14} /> Anidar
                                </button>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left"
                                    onClick={() => { onManualMove?.('outdent'); setShowMenu(false); }}>
                                    <Outdent size={14} /> Desanidar
                                </button>

                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                <span className="px-2 py-1 text-xs font-semibold text-gray-500">Acciones</span>

                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left text-green-600 dark:text-green-400"
                                    onClick={() => { onComplete(task.id); setShowMenu(false); }}>
                                    <CheckCircle2 size={14} /> Completar
                                </button>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left"
                                    onClick={() => { onEdit(task); setShowMenu(false); }}>
                                    <Edit size={14} /> Editar
                                </button>
                                <button className="flex items-center gap-2 px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-left text-red-600 dark:text-red-400"
                                    onClick={() => { onDelete(task.id); setShowMenu(false); }}>
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hidden lg:inline-flex"
                    onClick={() => onComplete(task.id)}
                    title="Completar"
                >
                    <CheckCircle2 size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hidden lg:inline-flex"
                    onClick={() => onEdit(task)}
                    title="Editar"
                >
                    <Edit size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hidden lg:inline-flex"
                    onClick={() => onDelete(task.id)}
                    title="Eliminar"
                >
                    <Trash2 size={16} className="text-red-500" />
                </Button>
            </div>
        </div>
    );
}
