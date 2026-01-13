import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const project_id = searchParams.get('project_id') || undefined;
    const due_date = searchParams.get('due_date')
      ? new Date(searchParams.get('due_date')!)
      : undefined;

    const filters = { status, project_id, due_date };
    const tasks = await getTasks(undefined, filters);

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      title: body.title,
      notes: body.notes,
      status: body.status,
      priority: body.priority,
      is_actionable: body.is_actionable,
      project_id: body.project_id,
      parent_task_id: body.parent_task_id,
      due_date: body.due_date ? new Date(body.due_date) : undefined,
      context_ids: body.context_ids,
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
