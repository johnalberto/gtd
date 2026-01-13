
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Add status column to projects table if it doesn't exist
        // Default to 'active'
        await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'someday', 'archived'));
    `;

        return NextResponse.json({ success: true, message: 'Projects table updated with status column' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
