import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, getTaskWithRelations, updateTask, deleteTask } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeRelations = searchParams.get('relations') === 'true';

    const task = includeRelations
      ? await getTaskWithRelations(id)
      : await getTaskById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const task = await updateTask(id, {
      title: body.title,
      notes: body.notes,
      status: body.status,
      priority: body.priority,
      is_actionable: body.is_actionable,
      project_id: body.project_id,
      parent_task_id: body.parent_task_id,
      due_date: body.due_date ? new Date(body.due_date) : undefined,
      completed_at: body.completed_at ? new Date(body.completed_at) : undefined,
      context_ids: body.context_ids,
      position: body.position,
      reminders: body.reminders ? body.reminders.map((r: string) => new Date(r)) : undefined,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTask(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
