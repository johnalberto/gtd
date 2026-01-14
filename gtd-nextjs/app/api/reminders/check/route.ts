import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date().toISOString();
        console.log(`[Check Reminders] Checking at UTC: ${now} for user ${session.user.id}`);

        // 1. Check Due Tasks
        const { rows: dueTasks } = await sql`
            SELECT id, title, due_date as time, 'task_due' as type 
            FROM tasks 
            WHERE due_date <= ${now} 
              AND status != 'completed' 
              AND (notified IS NULL OR notified = FALSE)
              AND user_id = ${session.user.id}
        `;

        // 2. Check Reminders
        const { rows: reminders } = await sql`
            SELECT r.id, t.title, r.reminder_time as time, 'reminder' as type, r.task_id 
            FROM reminders r
            JOIN tasks t ON r.task_id = t.id
            WHERE r.reminder_time <= ${now} 
              AND (r.notified IS NULL OR r.notified = FALSE)
              AND t.user_id = ${session.user.id}
        `;

        console.log(`[Check Reminders] Found ${dueTasks.length} tasks and ${reminders.length} reminders`);

        return NextResponse.json({
            success: true,
            notifications: [...dueTasks, ...reminders]
        });
    } catch (error) {
        console.error('Check reminders error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
