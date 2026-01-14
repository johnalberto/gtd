
const { sql, db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function debugAuth() {
    console.log('Starting debug auth for inglizcano@gmail.com');
    const email = 'inglizcano@gmail.com';
    const name = 'John Test';

    const client = await db.connect();

    try {
        console.log('Checking if user exists...');
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const existingUser = userResult.rows[0];

        if (existingUser) {
            console.log('User found:', existingUser);
            if (!existingUser.is_active) {
                console.log('User is INACTIVE. This would cause login failure.');
            } else {
                console.log('User is ACTIVE. Login should succeed.');
            }
        } else {
            console.log('User NOT found. Attempting auto-registration...');
            try {
                // Determine if gen_random_uuid() works
                const uuidCheck = await client.query('SELECT gen_random_uuid()');
                console.log('UUID Generation works:', uuidCheck.rows[0]);

                const insertResult = await client.query(`
                    INSERT INTO users (name, email, role, is_active)
                    VALUES ($1, $2, 'user', true)
                    RETURNING *
                `, [name, email]);
                console.log('Auto-registration SUCCESS:', insertResult.rows[0]);
            } catch (insertError) {
                console.error('Auto-registration FAILED:', insertError);
            }
        }

    } catch (error) {
        console.error('General Error:', error);
    } finally {
        client.release();
    }
}

debugAuth();
