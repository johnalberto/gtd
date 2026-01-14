
import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    try {
        const result = await sql`SELECT image FROM users WHERE id=${userId}`;
        if (result.rowCount === 0 || !result.rows[0].image) {
            return new NextResponse(null, { status: 404 });
        }

        const imageData = result.rows[0].image;

        // If it's an external URL (e.g. Google), redirect to it
        if (!imageData.startsWith('data:')) {
            return NextResponse.redirect(imageData);
        }

        // Parse data URI: data:[<mediatype>][;base64],<data>
        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return new NextResponse(null, { status: 400 });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': type,
                'Cache-Control': 'public, max-age=60', // Short cache to allow updates
            },
        });
    } catch (e) {
        console.error('Error serving avatar:', e);
        return new NextResponse(null, { status: 500 });
    }
}
