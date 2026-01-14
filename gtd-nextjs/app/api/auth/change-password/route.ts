import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const validation = ChangePasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validation.data;

        // Fetch user to get current password hash
        const userResult = await sql`
            SELECT id, password FROM users WHERE email = ${session.user.email}
        `;

        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const user = userResult.rows[0];

        // If user has no password (e.g. Google auth only), they can't "change" it via this method usually, 
        // unless we allow setting a password for the first time. 
        // But the request implies "users registered with user and key".
        if (!user.password) {
            return NextResponse.json(
                { error: 'Este usuario no tiene contraseña configurada (quizás usas Google Login).' },
                { status: 400 }
            );
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await sql`
            UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}
        `;

        return NextResponse.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
