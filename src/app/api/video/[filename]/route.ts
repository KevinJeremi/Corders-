import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const filePath = path.join(process.cwd(), 'public', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = request.headers.get('range');

        // Support range requests for video streaming
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });

            const headers = new Headers({
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': 'video/mp4',
            });

            return new NextResponse(file as any, {
                status: 206,
                headers,
            });
        } else {
            const file = fs.readFileSync(filePath);
            return new NextResponse(file, {
                headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Length': fileSize.toString(),
                },
            });
        }
    } catch (error) {
        console.error('Video serve error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
