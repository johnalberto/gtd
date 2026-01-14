import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
            SELECT settings FROM users WHERE id = ${session.user.id}
        `;

        if (result.rowCount === 0) {
            return NextResponse.json({ settings: {} });
        }

        return NextResponse.json({ settings: result.rows[0].settings || {} });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // We do a deep merge or just replace? 
        // For simplicity, we can trust the client to send the full settings object or we merge via SQL if user JSONB features are robust.
        // Postgres `||` operator merges JSONB.

        const settingsJson = JSON.stringify(body);

        await sql`
            UPDATE users 
            SET settings = settings || ${settingsJson}::jsonb 
            WHERE id = ${session.user.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
