'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
    Modifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/lib/types';
import { SortableTaskItem } from './SortableTaskItem';
import { createPortal } from 'react-dom';

interface TaskTreeProps {
    tasks: Task[];
    onUpdateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
    onDeleteTask: (id: string) => Promise<void>;
    onEditTask: (task: Task) => void;
    onSelectTask?: (taskId: string | null) => void;
    selectedTaskId?: string | null;
}

interface FlattenedItem {
    id: string;
    parentId: string | null;
    depth: number;
    index: number;
    task: Task;
}

export default function TaskTree({ tasks, onUpdateTask, onDeleteTask, onEditTask, onSelectTask, selectedTaskId }: TaskTreeProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    // Derived state: Tree structure handling
    const items = useMemo(() => {
        const flatten = (
            items: Task[],
            parentId: string | null = null,
            depth = 0
        ): FlattenedItem[] => {
            return items
                .filter(item => item.parent_task_id === parentId || (!parentId && !item.parent_task_id))
                .sort((a, b) => (a.position || 0) - (b.position || 0)) // Sort by position
                .reduce<FlattenedItem[]>((acc, task, index) => {
                    const flattenedItem: FlattenedItem = {
                        id: task.id,
                        parentId,
                        depth,
                        index,
                        task
                    };
                    return [
                        ...acc,
                        flattenedItem,
                        ...(expandedIds.includes(task.id) ? flatten(items, task.id, depth + 1) : [])
                    ];
                }, []);
        };
        return flatten(tasks);
    }, [tasks, expandedIds]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [dragState, setDragState] = useState<{ type: 'reorder' | 'nest', targetId: string | null }>({ type: 'reorder', targetId: null });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setDragState({ type: 'reorder', targetId: null });
    };

    const handleDragMove = (event: DragOverEvent) => {
        const { active, over, delta } = event;
        if (!over || active.id === over.id) {
            setDragState({ type: 'reorder', targetId: null });
            return;
        }

        const isIndenting = delta.x > 40;

        // If indenting, we are nesting INTO the 'over' task
        if (isIndenting) {
            setDragState({ type: 'nest', targetId: over.id as string });
        } else {
            // If not indenting, we are reordering relative to 'over' (sibling)
            setDragState({ type: 'reorder', targetId: over.id as string });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveId(null);
        setDragState({ type: 'reorder', targetId: null });

        if (!over) return;
        if (active.id === over.id) return;

        const activeItem = items.find(i => i.id === active.id);
        const overItem = items.find(i => i.id === over.id);

        if (!activeItem || !overItem) return;

        const isIndenting = delta.x > 40;

        // MODE: NESTING
        if (isIndenting) {
            // Nest active into over
            // Prevent cycles
            let current = overItem;
            let isCycle = false;
            while (current.parentId) {
                if (current.parentId === active.id) {
                    isCycle = true;
                    break;
                }
                const parent = items.find(i => i.id === current.parentId);
                if (!parent) break;
                current = parent;
            }
            if (isCycle) return;

            // Logic: active becomes child of over
            if (activeItem.task.parent_task_id !== overItem.id) {
                await onUpdateTask(active.id as string, { parent_task_id: overItem.id });
                if (!expandedIds.includes(overItem.id)) {
                    setExpandedIds(prev => [...prev, overItem.id]);
                }
            }
            return;
        }

        // MODE: REORDERING (Sibling or Reparenting to sibling)
        // If not indenting, we move 'active' to be a sibling of 'over'
        // This might involve changing parentId to match over.parentId

        const newParentId = overItem.parentId;

        // If parent changes (moving to different list but same level)
        if (activeItem.task.parent_task_id !== newParentId) {
            await onUpdateTask(active.id as string, { parent_task_id: newParentId || null });
            // We can't easily calc position perfectly in one go if we also change parent, 
            // but let's try to infer position from the sortable context.
            // Actually, arrayMove won't work directly if lists update async.
            // But usually dnd-kit handles immediate visual update if we use local state... 
            // creating a comprehensive optimism is hard. 
            // Let's just update parent. Position might be messy until subsequent reorder.
            // Ideally we update Position AND Parent.

            // ... Logic to find new position in target list ...
            const siblings = tasks.filter(t => t.parent_task_id === newParentId)
                .sort((a, b) => (a.position || 0) - (b.position || 0));

            // We want to insert 'near' over. 
            // finding 'over' index in siblings
            const overIndex = siblings.findIndex(t => t.id === over.id);
            let newPos;
            // If we drop ON over, we enter AFTER it usually?
            // Heuristic: same pos as over + 10 ?
            const refPos = siblings[overIndex]?.position || 0;
            newPos = refPos + 500; // Insert after

            await onUpdateTask(active.id as string, { parent_task_id: newParentId || null, position: newPos });
            return;
        }

        // Standard Sibling Reordering
        const siblingTasks = tasks.filter(t => t.parent_task_id === activeItem.task.parent_task_id)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

        const oldIndex = siblingTasks.findIndex(t => t.id === active.id);
        const newIndex = siblingTasks.findIndex(t => t.id === over.id);

        if (oldIndex !== newIndex) {
            const newOrdered = arrayMove(siblingTasks, oldIndex, newIndex);

            // Calculate new position
            let newPos = 0;
            if (newIndex === 0) {
                const nextPos = newOrdered[1]?.position || 0;
                newPos = nextPos - 1000;
            } else if (newIndex === newOrdered.length - 1) {
                const prevPos = newOrdered[newOrdered.length - 2]?.position || 0;
                newPos = prevPos + 1000;
            } else {
                const prevPos = newOrdered[newIndex - 1].position || 0;
                const nextPos = newOrdered[newIndex + 1].position || 0;
                newPos = (prevPos + nextPos) / 2;
            }

            try {
                await onUpdateTask(active.id as string, { position: newPos });
            } catch (error) {
                console.error("Failed to reorder task:", error);
            }
        }
    };

    const getDragOverlayContent = () => {
        if (!activeId) return null;

        let message = "Moviendo tarea...";
        let subMessage = "";

        if (dragState.targetId) {
            const targetTask = items.find(i => i.id === dragState.targetId)?.task;
            if (targetTask) {
                if (dragState.type === 'nest') {
                    message = "Anidando en:";
                    subMessage = targetTask.title;
                } else {
                    message = "Ordenando junto a:";
                    subMessage = targetTask.title;
                }
            }
        }

        return (
            <div className={`p-3 rounded shadow-xl border cursor-grabbing flex flex-col ${dragState.type === 'nest' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}>
                <span className="font-medium text-sm">{message}</span>
                {subMessage && <span className="text-xs opacity-75">{subMessage}</span>}
            </div>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No hay tareas visibles.</div>
                    ) : (
                        items.map(item => (
                            <SortableTaskItem
                                key={item.id}
                                task={item.task}
                                depth={item.depth}
                                onComplete={() => onUpdateTask(item.id, { status: 'completed', completed_at: new Date() })}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                isExpanded={expandedIds.includes(item.id)}
                                onToggleExpand={(id) => setExpandedIds(prev =>
                                    prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
                                )}
                                hasChildren={tasks.some(t => t.parent_task_id === item.id)}
                                onSelect={() => onSelectTask?.(selectedTaskId === item.id ? null : item.id)}
                                isSelected={selectedTaskId === item.id}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
            <DragOverlay>
                {getDragOverlayContent()}
            </DragOverlay>
        </DndContext>
    );
}
