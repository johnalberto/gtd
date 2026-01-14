import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetSchema = z.object({
    token: z.string(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = resetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const { token, password } = result.data;
        const client = await db.connect();

        // Check token validity
        const user = await client.sql`
            SELECT id FROM users 
            WHERE reset_token = ${token} 
            AND reset_token_expiry > NOW()
        `;

        if (user.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
        }

        const userId = user.rows[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear token
        await client.sql`
            UPDATE users 
            SET password = ${hashedPassword}, 
                reset_token = NULL, 
                reset_token_expiry = NULL 
            WHERE id = ${userId}
        `;

        client.release();
        return NextResponse.json({ success: true, message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
