import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Add password column
        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `;

        // Allow nulls initially for OAuth users, but Credentials users need it.

        return NextResponse.json({ success: true, message: 'Auth migration successful' });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { success: false, error: 'Migration failed' },
            { status: 500 }
        );
    }
}
