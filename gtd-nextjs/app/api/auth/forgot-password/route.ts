import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
        }

        const client = await db.connect();

        const user = await client.sql`SELECT id FROM users WHERE email = ${email}`;

        if (user.rows.length === 0) {
            // For security, don't reveal if user exists
            client.release();
            return NextResponse.json({ success: true, message: 'Si el email existe, se enviarán las instrucciones.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await client.sql`
            UPDATE users 
            SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry.toISOString()}
            WHERE email = ${email}
        `;

        client.release();

        // In a real app, send email here using Resend, SendGrid, etc.
        console.log(`[DEV ONLY] Reset Link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

        return NextResponse.json({ success: true, message: 'Si el email existe, se enviarán las instrucciones.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
