
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';

export async function GET() {
    try {
        const client = await db.connect();

        // Check if column exists
        const { rows: columns } = await client.sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'position';
    `;

        let status = '';

        if (columns.length === 0) {
            await client.sql`ALTER TABLE tasks ADD COLUMN position DOUBLE PRECISION DEFAULT 0;`;
            status += 'Position column added. ';
        } else {
            status += 'Position column already exists. ';
        }

        // Check data
        const { rows: tasks } = await client.sql`SELECT id, position FROM tasks ORDER BY created_at DESC`;
        const needsUpdate = tasks.some(t => t.position === 0 || t.position === null);

        if (needsUpdate) {
            let pos = 1000;
            for (const task of tasks) {
                await client.sql`UPDATE tasks SET position = ${pos} WHERE id = ${task.id}`;
                pos += 1000;
            }
            status += `Initialized positions for ${tasks.length} tasks.`;
        } else {
            status += 'Positions already initialized.';
        }

        // Add notified column to tasks
        try {
            await client.sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE`;
            status += ' Checked tasks.notified.';
        } catch (e) {
            console.error('Error ensuring tasks.notified:', e);
        }

        // Add notified column to reminders
        try {
            await client.sql`ALTER TABLE reminders ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE`;
            status += ' Checked reminders.notified.';
        } catch (e) {
            console.error('Error ensuring reminders.notified:', e);
        }

        client.release();
        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
