import { sql } from '@vercel/postgres';
import type { Task, Project, Context, TaskWithRelations } from './types';

// Default user ID for development (matches schema.sql)
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';

// ============================================================================
// TASKS
// ============================================================================

export async function getTasks(userId: string = DEFAULT_USER_ID, filters?: {
    status?: string;
    project_id?: string;
    due_date?: Date;
}) {
    let query = `
        SELECT tasks.*, 
        COALESCE(
            (SELECT json_agg(r ORDER BY r.reminder_time ASC) 
             FROM reminders r 
             WHERE r.task_id = tasks.id), 
            '[]'
        ) as reminders
        FROM tasks 
        WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
    }

    if (filters?.project_id) {
        query += ` AND project_id = $${paramIndex}`;
        params.push(filters.project_id);
        paramIndex++;
    }

    if (filters?.due_date) {
        query += ` AND due_date::date = $${paramIndex}::date`;
        params.push(filters.due_date.toISOString().split('T')[0]); // Convert to YYYY-MM-DD
        paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await sql.query(query, params);
    return rows as Task[];
}

export async function getTaskById(id: string, userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    SELECT * FROM tasks 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return rows[0] as Task | undefined;
}

export async function getTaskWithRelations(id: string, userId: string = DEFAULT_USER_ID) {
    const task = await getTaskById(id, userId);
    if (!task) return undefined;

    // Get project
    let project = undefined;
    if (task.project_id) {
        const { rows: projectRows } = await sql`
      SELECT * FROM projects WHERE id = ${task.project_id}
    `;
        project = projectRows[0] as Project;
    }

    // Get contexts
    const { rows: contextRows } = await sql`
    SELECT c.* FROM contexts c
    INNER JOIN task_contexts tc ON c.id = tc.context_id
    WHERE tc.task_id = ${id}
  `;
    const contexts = contextRows as Context[];

    // Get subtasks
    const { rows: subtaskRows } = await sql`
    SELECT * FROM tasks 
    WHERE parent_task_id = ${id} AND user_id = ${userId}
    ORDER BY created_at ASC
  `;
    const subtasks = subtaskRows as Task[];

    // Get reminders
    const { rows: reminderRows } = await sql`
    SELECT * FROM reminders WHERE task_id = ${id} ORDER BY reminder_time ASC
    `;
    const reminders = reminderRows as import('./types').Reminder[];

    return {
        ...task,
        project,
        contexts,
        subtasks,
        reminders,
    } as TaskWithRelations;
}

export async function createTask(data: {
    title: string;
    notes?: string;
    status?: string;
    priority?: string;
    is_actionable?: boolean;
    project_id?: string;
    parent_task_id?: string;
    due_date?: Date;
    context_ids?: string[];
    reminders?: Date[];
}, userId: string = DEFAULT_USER_ID) {
    // ... (existing position logic) ...
    // Convert Date to ISO string if provided
    const dueDateValue = data.due_date ? data.due_date.toISOString() : null;

    // Calculate new position (append to end of list)
    let positionResult;
    if (data.parent_task_id) {
        positionResult = await sql`
            SELECT COALESCE(MAX(position), 0) + 1000 as new_pos 
            FROM tasks 
            WHERE parent_task_id = ${data.parent_task_id}
              AND user_id = ${userId}
        `;
    } else {
        positionResult = await sql`
            SELECT COALESCE(MAX(position), 0) + 1000 as new_pos 
            FROM tasks 
            WHERE parent_task_id IS NULL
              AND user_id = ${userId}
        `;
    }
    const newPosition = positionResult.rows[0].new_pos;

    const { rows } = await sql`
    INSERT INTO tasks (
      user_id, title, notes, status, priority, is_actionable, 
      project_id, parent_task_id, due_date, position
    ) VALUES (
      ${userId}, 
      ${data.title}, 
      ${data.notes || null}, 
      ${data.status || 'inbox'}, 
      ${data.priority || 'P4'}, 
      ${data.is_actionable ?? null},
      ${data.project_id || null}, 
      ${data.parent_task_id || null}, 
      ${dueDateValue},
      ${newPosition}
    )
    RETURNING *
  `;

    const task = rows[0] as Task;

    // Add contexts if provided
    if (data.context_ids && data.context_ids.length > 0) {
        for (const contextId of data.context_ids) {
            await sql`
        INSERT INTO task_contexts (task_id, context_id)
        VALUES (${task.id}, ${contextId})
      `;
        }
    }

    // Add reminders if provided
    if (data.reminders && data.reminders.length > 0) {
        for (const reminderTime of data.reminders) {
            await sql`
                INSERT INTO reminders (task_id, reminder_time)
                VALUES (${task.id}, ${reminderTime.toISOString()})
            `;
        }
    }

    return (await getTaskWithRelations(task.id, userId)) as TaskWithRelations;
}


export async function updateTask(id: string, data: Partial<{
    title: string;
    notes: string;
    status: string;
    priority: string;
    is_actionable: boolean;
    project_id: string;
    parent_task_id: string;
    position: number;
    due_date: Date;
    completed_at: Date;
    context_ids: string[];
    reminders: Date[];
}>, userId: string = DEFAULT_USER_ID) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // ... (existing update logic) ...
    if (data.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(data.title);
        paramIndex++;
    }
    if (data.notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        values.push(data.notes);
        paramIndex++;
    }
    if (data.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(data.status);
        paramIndex++;
    }
    if (data.priority !== undefined) {
        updates.push(`priority = $${paramIndex}`);
        values.push(data.priority);
        paramIndex++;
    }
    if (data.is_actionable !== undefined) {
        updates.push(`is_actionable = $${paramIndex}`);
        values.push(data.is_actionable);
        paramIndex++;
    }
    if (data.project_id !== undefined) {
        updates.push(`project_id = $${paramIndex}`);
        values.push(data.project_id);
        paramIndex++;
    }
    if (data.parent_task_id !== undefined) {
        updates.push(`parent_task_id = $${paramIndex}`);
        values.push(data.parent_task_id);
        paramIndex++;
    }
    if (data.due_date !== undefined) {
        updates.push(`due_date = $${paramIndex}`);
        values.push(data.due_date ? data.due_date.toISOString() : null);
        paramIndex++;
    }
    if (data.completed_at !== undefined) {
        updates.push(`completed_at = $${paramIndex}`);
        values.push(data.completed_at ? data.completed_at.toISOString() : null);
        paramIndex++;
    }
    if (data.position !== undefined) {
        updates.push(`position = $${paramIndex}`);
        values.push(data.position);
        paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    const query = `
    UPDATE tasks 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;
    values.push(id, userId);

    const { rows } = await sql.query(query, values);

    // Update contexts if provided
    if (data.context_ids !== undefined) {
        await sql`DELETE FROM task_contexts WHERE task_id = ${id}`;
        for (const contextId of data.context_ids) {
            await sql`
        INSERT INTO task_contexts (task_id, context_id)
        VALUES (${id}, ${contextId})
      `;
        }
    }

    // Update reminders if provided (Replace all)
    if (data.reminders !== undefined) {
        await sql`DELETE FROM reminders WHERE task_id = ${id}`;
        for (const reminderTime of data.reminders) {
            await sql`
                INSERT INTO reminders (task_id, reminder_time)
                VALUES (${id}, ${reminderTime.toISOString()})
            `;
        }
    }

    return (await getTaskWithRelations(rows[0].id, userId)) as TaskWithRelations;
}

export async function deleteTask(id: string, userId: string = DEFAULT_USER_ID) {
    await sql`
    DELETE FROM tasks 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return { success: true };
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects(userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    SELECT * FROM projects 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
    return rows as Project[];
}

export async function getProjectById(id: string, userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    SELECT * FROM projects 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return rows[0] as Project | undefined;
}

export async function createProject(data: {
    name: string;
    description?: string;
    color?: string;
    status?: string;
}, userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    INSERT INTO projects (user_id, name, description, color, status)
    VALUES (${userId}, ${data.name}, ${data.description || null}, ${data.color || null}, ${data.status || 'active'})
    RETURNING *
  `;
    return rows[0] as Project;
}

export async function updateProject(id: string, data: Partial<{
    name: string;
    description: string;
    color: string;
    status: string;
}>, userId: string = DEFAULT_USER_ID) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(data.name);
        paramIndex++;
    }
    if (data.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(data.description);
        paramIndex++;
    }
    if (data.color !== undefined) {
        updates.push(`color = $${paramIndex}`);
        values.push(data.color);
        paramIndex++;
    }
    if (data.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(data.status);
        paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    const query = `
    UPDATE projects 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;
    values.push(id, userId);

    const { rows } = await sql.query(query, values);
    return rows[0] as Project;
}

export async function deleteProject(id: string, userId: string = DEFAULT_USER_ID) {
    await sql`
    DELETE FROM projects 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return { success: true };
}

// ============================================================================
// CONTEXTS
// ============================================================================

export async function getContexts(userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    SELECT * FROM contexts 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
    return rows as Context[];
}

export async function getContextById(id: string, userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    SELECT * FROM contexts 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return rows[0] as Context | undefined;
}

export async function createContext(data: {
    name: string;
    icon?: string;
}, userId: string = DEFAULT_USER_ID) {
    const { rows } = await sql`
    INSERT INTO contexts (user_id, name, icon)
    VALUES (${userId}, ${data.name}, ${data.icon || null})
    RETURNING *
  `;
    return rows[0] as Context;
}

export async function updateContext(id: string, data: Partial<{
    name: string;
    icon: string;
}>, userId: string = DEFAULT_USER_ID) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(data.name);
        paramIndex++;
    }
    if (data.icon !== undefined) {
        updates.push(`icon = $${paramIndex}`);
        values.push(data.icon);
        paramIndex++;
    }

    const query = `
    UPDATE contexts 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;
    values.push(id, userId);

    const { rows } = await sql.query(query, values);
    return rows[0] as Context;
}

export async function deleteContext(id: string, userId: string = DEFAULT_USER_ID) {
    await sql`
    DELETE FROM contexts 
    WHERE id = ${id} AND user_id = ${userId}
  `;
    return { success: true };
}

// ============================================================================
// REMINDERS
// ============================================================================

export async function getReminders(taskId: string) {
    const { rows } = await sql`
    SELECT * FROM reminders 
    WHERE task_id = ${taskId}
    ORDER BY reminder_time ASC
  `;
    return rows as import('./types').Reminder[];
}

export async function createReminder(taskId: string, reminderTime: Date) {
    const { rows } = await sql`
    INSERT INTO reminders (task_id, reminder_time)
    VALUES (${taskId}, ${reminderTime.toISOString()})
    RETURNING *
  `;
    return rows[0] as import('./types').Reminder;
}

export async function deleteReminder(id: string) {
    await sql`
    DELETE FROM reminders 
    WHERE id = ${id}
  `;
    return { success: true };
}
