
import { db } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    try {
        const client = await db.connect();
        console.log('Adding position column to tasks table...');
        await client.sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position DOUBLE PRECISION DEFAULT 0;`;

        console.log('Populating initial positions...');
        // Initialize position based on created_at (older tasks first = lower position, or whatever matches desire)
        // Actually, getTasks uses created_at DESC (newest first). 
        // To maintain this, we can give newer tasks lower position numbers if we sort ASC.
        // Let's just use epoch time negated, so newer (larger epoch) has lower (more negative) position?
        // Or just simple index.

        const { rows: tasks } = await client.sql`SELECT id FROM tasks ORDER BY created_at DESC`;

        let pos = 1000;
        for (const task of tasks) {
            await client.sql`UPDATE tasks SET position = ${pos} WHERE id = ${task.id}`;
            pos += 1000;
        }

        console.log('Migration successful');
        client.release();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
