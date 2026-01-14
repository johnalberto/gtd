import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/types';

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    callbacks: {
        authorized: authConfig.callbacks?.authorized,
        session: authConfig.callbacks?.session,
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                if (!user.email) return false;
                try {
                    const existingUser = await getUser(user.email);
                    if (!existingUser) {
                        // Auto-register user
                        await sql`
                            INSERT INTO users (name, email, role, is_active)
                            VALUES (${user.name}, ${user.email}, 'user', true)
                        `;
                    } else if (!existingUser.is_active) {
                        return false; // Block inactive users
                    }
                } catch (error) {
                    console.error('Error in Google signIn callback:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Initial sign in or update
            if (user) {
                // When signing in with Google, 'user' has the Google ID. 
                // We need to swap it for our Database UUID so relations work.
                if (user.email) {
                    try {
                        const dbUser = await getUser(user.email);
                        if (dbUser) {
                            token.sub = dbUser.id; // USE DB UUID
                            // @ts-ignore
                            token.role = dbUser.role;

                            if (dbUser.image && dbUser.image.startsWith('data:')) {
                                token.picture = `/api/avatar/${dbUser.id}`;
                            } else {
                                token.picture = dbUser.image;
                            }

                            token.name = dbUser.name;
                        }
                    } catch (e) {
                        console.error('Error fetching user in JWT:', e);
                    }
                }
            }

            // On session update (e.g. client side update())
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            // Verify user still exists in DB on every request to prevent zombie sessions
            if (token.sub) {
                try {
                    // Now token.sub should be a UUID.
                    // We query to ensure user wasn't deleted and is active.
                    const result = await sql`SELECT id, role, is_active, name, image FROM users WHERE id=${token.sub}`;

                    if (result.rowCount === 0) {
                        return null; // User deleted -> Invalidate session
                    }

                    const dbUser = result.rows[0];
                    if (!dbUser.is_active) {
                        return null; // User banned/inactive -> Invalidate session
                    }

                    // Sync role just in case it changed
                    // @ts-ignore
                    // Sync role just in case it changed
                    // @ts-ignore
                    token.role = dbUser.role;

                    // Fix: Don't put base64 image in token (cookie limit). Use API URL.
                    if (dbUser.image && dbUser.image.startsWith('data:')) {
                        token.picture = `/api/avatar/${dbUser.id}`;
                    } else {
                        token.picture = dbUser.image;
                    }

                    token.name = dbUser.name;
                } catch (e) {
                    // If error (e.g. invalid UUID format from old cookie), invalidate
                    console.error('Error validating user in JWT:', e);
                    return null;
                }
            }
            return token;
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    // Block inactive users
                    if (!user.is_active) return null;

                    // Check if user has a password (migrated users might not)
                    // If no password in DB but user exists, maybe they signed up with Google?
                    // For now, if no password, deny credentials login.
                    // Or if we want to allow "setting" it? No, keeping it simple.
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
