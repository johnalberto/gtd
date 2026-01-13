import { NextRequest, NextResponse } from 'next/server';
import { getContexts, createContext } from '@/lib/db';

export async function GET() {
    try {
        const contexts = await getContexts();
        return NextResponse.json({ success: true, data: contexts });
    } catch (error) {
        console.error('Error fetching contexts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contexts' },
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

        const context = await createContext({
            name: body.name,
            icon: body.icon,
        });

        return NextResponse.json({ success: true, data: context }, { status: 201 });
    } catch (error) {
        console.error('Error creating context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create context' },
            { status: 500 }
        );
    }
}
