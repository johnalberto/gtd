import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db';

export async function GET() {
    try {
        const projects = await getProjects();
        return NextResponse.json({ success: true, data: projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        const project = await createProject({
            name: body.name,
            description: body.description,
            color: body.color,
        });

        return NextResponse.json({ success: true, data: project }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
