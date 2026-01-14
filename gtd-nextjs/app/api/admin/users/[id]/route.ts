import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { auth } from '@/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await auth();

        // Check auth and admin role
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { role, is_active } = body;

        // Prevent self-modification of critical fields if needed, 
        // usually admins shouldn't disable themselves, but frontend blocks delete.
        if (id === session.user.id && (is_active === false || role === 'user')) {
            return NextResponse.json({ error: 'No puedes modificar tu propio rol o estado' }, { status: 400 });
        }

        const client = await db.connect();

        let query = 'UPDATE users SET ';
        const values: any[] = [];
        const updates: string[] = [];

        if (role !== undefined) {
            updates.push(`role = $${values.length + 1}`);
            values.push(role);
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${values.length + 1}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            client.release();
            return NextResponse.json({ success: true, message: 'Nada que actualizar' });
        }

        query += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);

        const result = await client.query(query, values);

        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await auth();

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        if (id === session.user.id) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
        }

        const client = await db.connect();
        await client.sql`DELETE FROM users WHERE id = ${id}`;
        client.release();

        return NextResponse.json({ success: true, message: 'Usuario eliminado' });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
