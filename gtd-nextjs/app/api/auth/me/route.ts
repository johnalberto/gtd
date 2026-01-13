import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Default user ID for development (matches lib/db.ts)
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const { rows } = await sql`
      SELECT * FROM users WHERE id = ${DEFAULT_USER_ID}
    `;

        if (rows.length === 0) {
            return NextResponse.json({ user: null }, { status: 404 });
        }

        return NextResponse.json({ user: rows[0] });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
