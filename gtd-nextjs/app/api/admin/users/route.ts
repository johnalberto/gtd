import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const { rows } = await sql`
            INSERT INTO users (email, name, role)
            VALUES (${body.email}, ${body.name || null}, ${body.role || 'user'})
            RETURNING *
        `;

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }
}
