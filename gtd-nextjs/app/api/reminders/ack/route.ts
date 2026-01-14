import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { ids, type } = await request.json(); // IDs to mark as notified, type: 'task_due' | 'reminder'

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ success: false, error: 'Ids array required' }, { status: 400 });
        }

        if (type === 'task_due') {
            for (const id of ids) {
                await sql`
                    UPDATE tasks 
                    SET notified = TRUE 
                    WHERE id = ${id} AND user_id = ${session.user.id}
                `;
            }
        } else if (type === 'reminder') {
            for (const id of ids) {
                await sql`
                    UPDATE reminders 
                    SET notified = TRUE 
                    WHERE id = ${id} 
                    AND task_id IN (SELECT id FROM tasks WHERE user_id = ${session.user.id})
                `;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ack reminders error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
