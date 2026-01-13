import { NextRequest, NextResponse } from 'next/server';
import { getReminders, createReminder, deleteReminder } from '@/lib/db';

// GET /api/reminders?task_id=xxx - Get all reminders for a task
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const taskId = searchParams.get('task_id');

        if (!taskId) {
            return NextResponse.json(
                { error: 'task_id is required' },
                { status: 400 }
            );
        }

        const reminders = await getReminders(taskId);
        return NextResponse.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reminders' },
            { status: 500 }
        );
    }
}

// POST /api/reminders - Create a new reminder
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { task_id, reminder_time } = body;

        if (!task_id || !reminder_time) {
            return NextResponse.json(
                { error: 'task_id and reminder_time are required' },
                { status: 400 }
            );
        }

        const reminder = await createReminder(task_id, new Date(reminder_time));
        return NextResponse.json(reminder, { status: 201 });
    } catch (error) {
        console.error('Error creating reminder:', error);
        return NextResponse.json(
            { error: 'Failed to create reminder' },
            { status: 500 }
        );
    }
}

// DELETE /api/reminders?id=xxx - Delete a reminder
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        await deleteReminder(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return NextResponse.json(
            { error: 'Failed to delete reminder' },
            { status: 500 }
        );
    }
}
