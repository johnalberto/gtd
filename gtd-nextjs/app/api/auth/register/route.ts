import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.issues },
                { status: 400 }
            );
        }

        const { name, email, password } = result.data;

        const client = await db.connect();

        // Check if user exists
        const existingUser = await client.sql`
      SELECT id FROM users WHERE email = ${email}
    `;

        if (existingUser.rows.length > 0) {
            client.release();
            return NextResponse.json(
                { error: 'El usuario ya existe' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        try {
            await client.sql`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES (${name}, ${email}, ${hashedPassword}, 'user', true)
      `;
        } catch (error) {
            client.release();
            throw error;
        }

        client.release();

        return NextResponse.json(
            { success: true, message: 'Usuario registrado exitosamente' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
