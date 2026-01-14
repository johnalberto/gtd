
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = 'inglizcano@gmail.com';
        const name = 'John Test';

        console.log('Checking if user exists...');
        const userResult = await sql`SELECT * FROM users WHERE email = ${email}`;

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            return NextResponse.json({
                msg: 'User found',
                user
            });
        }

        console.log('User NOT found. Attempting auto-registration...');

        // Attempt insert
        const insertResult = await sql`
            INSERT INTO users (name, email, role, is_active)
            VALUES (${name}, ${email}, 'user', true)
            RETURNING *
        `;

        return NextResponse.json({
            msg: 'Auto-registration SUCCESS',
            newUser: insertResult.rows[0]
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Failed',
            details: String(error)
        }, { status: 500 });
    }
}
