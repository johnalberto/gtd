
import { db } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyAndFix() {
    try {
        const client = await db.connect();
        console.log('Connected to DB');

        // Check if column exists
        const { rows: columns } = await client.sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'position';
        `;

        if (columns.length === 0) {
            console.log('Position column is MISSING. Fixing...');
            await client.sql`ALTER TABLE tasks ADD COLUMN position DOUBLE PRECISION DEFAULT 0;`;
            console.log('Column added.');
        } else {
            console.log('Position column exists.');
        }

        // Check if positions are all 0 or null
        const { rows: tasks } = await client.sql`SELECT id, position, created_at FROM tasks ORDER BY created_at DESC`;

        let needsUpdate = tasks.some(t => t.position === 0 || t.position === null);

        if (needsUpdate) {
            console.log('Updating initial positions...');
            let pos = 1000;
            // Iterate in created_at DESC order (newest first).
            // If we want newest to be at top, created_at DESC.
            // My SortableTree sorts by position ASC.
            // So if I want newest at top (index 0), then newest should have lowest position.

            // Current tasks: Newest (index 0) ... Oldest (index N)
            // I assign pos 1000 to Newest, 2000 to next, etc.
            // Sort ASC: 1000, 2000, 3000...
            // So Newest will be first.

            for (const task of tasks) {
                await client.sql`UPDATE tasks SET position = ${pos} WHERE id = ${task.id}`;
                pos += 1000;
            }
            console.log('Positions updated.');
        } else {
            console.log('Positions seem initialized.');
        }

        console.log('Verification complete.');
        client.release();
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyAndFix();
