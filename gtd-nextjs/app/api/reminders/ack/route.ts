import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        const { ids, type } = await request.json(); // IDs to mark as notified, type: 'task_due' | 'reminder'

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ success: false, error: 'Ids array required' }, { status: 400 });
        }

        if (type === 'task_due') {
            for (const id of ids) {
                await sql`UPDATE tasks SET notified = TRUE WHERE id = ${id}`;
            }
        } else if (type === 'reminder') {
            for (const id of ids) {
                await sql`UPDATE reminders SET notified = TRUE WHERE id = ${id}`;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ack reminders error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
