import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Add role column if it doesn't exist
        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
    `;

        // Ensure the demo user is an admin
        await sql`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'demo@focuspro.com';
    `;

        return NextResponse.json({ success: true, message: 'Users table migrated successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { success: false, error: 'Migration failed' },
            { status: 500 }
        );
    }
}
