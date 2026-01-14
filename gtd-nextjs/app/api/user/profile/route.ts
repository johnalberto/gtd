
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
    name: z.string().min(2).max(100),
    image: z.string().optional().nullable(), // Base64 string or null
});

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = profileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
        }

        const { name, image } = parsed.data;

        await sql`
            UPDATE users
            SET name = ${name}, image = ${image}
            WHERE email = ${session.user.email}
        `;

        return NextResponse.json({ success: true, user: { name, image } });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
