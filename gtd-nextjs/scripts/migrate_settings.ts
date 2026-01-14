
import { db } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateSettings() {
    try {
        const client = await db.connect();
        console.log('Connected to DB');

        // Check if column exists
        const { rows: columns } = await client.sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'settings';
        `;

        if (columns.length === 0) {
            console.log('Settings column is MISSING. Adding...');
            await client.sql`ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{}';`;
            console.log('Column added successfully.');
        } else {
            console.log('Settings column already exists.');
        }

        client.release();
    } catch (error) {
        console.error('Error migrating DB:', error);
    }
}

migrateSettings();
