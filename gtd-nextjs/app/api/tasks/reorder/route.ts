
import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { z } from 'zod';

const reorderSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        position: z.number(),
        parent_task_id: z.string().nullable().optional()
    }))
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = reorderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: result.error.errors },
                { status: 400 }
            );
        }

        const client = await db.connect();

        // Use a transaction for batch updates
        try {
            await client.sql`BEGIN`;

            for (const item of result.data.items) {
                await client.sql`
          UPDATE tasks 
          SET position = ${item.position}, 
              parent_task_id = ${item.parent_task_id ?? null}
          WHERE id = ${item.id}
        `;
            }

            await client.sql`COMMIT`;
            return NextResponse.json({ success: true });
        } catch (error) {
            await client.sql`ROLLBACK`;
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error reordering tasks:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
