import { NextRequest, NextResponse } from 'next/server';
import { getContextById, updateContext, deleteContext } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const context = await getContextById(id);

        if (!context) {
            return NextResponse.json(
                { success: false, error: 'Context not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: context });
    } catch (error) {
        console.error('Error fetching context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch context' },
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

        const context = await updateContext(id, {
            name: body.name,
            icon: body.icon,
        });

        return NextResponse.json({ success: true, data: context });
    } catch (error) {
        console.error('Error updating context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update context' },
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
        await deleteContext(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete context' },
            { status: 500 }
        );
    }
}
