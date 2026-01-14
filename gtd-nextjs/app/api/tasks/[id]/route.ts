import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, getTaskWithRelations, updateTask, deleteTask } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const searchParams = request.nextUrl.searchParams;
    const includeRelations = searchParams.get('relations') === 'true';

    const task = includeRelations
      ? await getTaskWithRelations(id, session.user.id)
      : await getTaskById(id, session.user.id);

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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
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
    }, session.user.id);

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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    await deleteTask(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
