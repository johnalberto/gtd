import { NextRequest, NextResponse } from 'next/server';
import { getContexts, createContext } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const contexts = await getContexts(session.user.id);
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
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

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
        }, session.user.id);

        return NextResponse.json({ success: true, data: context }, { status: 201 });
    } catch (error) {
        console.error('Error creating context:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create context' },
            { status: 500 }
        );
    }
}
