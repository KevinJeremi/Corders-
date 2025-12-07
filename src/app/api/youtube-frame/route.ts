import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { youtubeUrl } = await req.json();

        if (!youtubeUrl) {
            return NextResponse.json({ error: 'No YouTube URL provided' }, { status: 400 });
        }

        // Create a temporary Python script to capture frame
        const scriptPath = path.join(process.cwd(), 'capture_frame.py');
        const outputPath = path.join(process.cwd(), 'temp_frame.jpg');

        const pythonScript = `
import sys
import cv2
import yt_dlp

def capture_frame(youtube_url, output_path):
    ydl_opts = {
        'format': 'best[height<=720]',
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            stream_url = info['url']
            
            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                print("ERROR: Cannot open stream")
                return False
            
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                cv2.imwrite(output_path, frame)
                print("SUCCESS")
                return True
            else:
                print("ERROR: Cannot read frame")
                return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    capture_frame("${youtubeUrl}", "${outputPath.replace(/\\/g, '\\\\')}")
`;

        fs.writeFileSync(scriptPath, pythonScript);

        // Execute Python script
        const result = await new Promise<string>((resolve, reject) => {
            const python = spawn('python', [scriptPath], {
                timeout: 30000,
            });

            let output = '';
            let error = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code === 0 && output.includes('SUCCESS')) {
                    resolve('success');
                } else {
                    reject(new Error(error || output || 'Failed to capture frame'));
                }
            });

            python.on('error', (err) => {
                reject(err);
            });
        });

        // Read the captured frame
        if (fs.existsSync(outputPath)) {
            const frameBuffer = fs.readFileSync(outputPath);
            const base64Frame = frameBuffer.toString('base64');

            // Clean up
            fs.unlinkSync(outputPath);
            fs.unlinkSync(scriptPath);

            return NextResponse.json({
                success: true,
                image: `data:image/jpeg;base64,${base64Frame}`,
                timestamp: new Date().toISOString(),
            });
        } else {
            throw new Error('Frame file not found');
        }
    } catch (error: any) {
        console.error('YouTube frame capture error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to capture frame' },
            { status: 500 }
        );
    }
}
