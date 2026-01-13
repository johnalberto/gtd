import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE email = 'demo@focuspro.com';
    `;

        return NextResponse.json({ success: true, message: 'Password set to password123' });
    } catch (error) {
        console.error('Error setting password:', error);
        return NextResponse.json(
            { success: false, error: 'Failed' },
            { status: 500 }
        );
    }
}
