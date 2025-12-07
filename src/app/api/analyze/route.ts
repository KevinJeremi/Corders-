import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Vision API client using environment variables only
let client: ImageAnnotatorClient | null = null;
let initError: string | null = null;

try {
    // First try: use JSON credentials from environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        client = new ImageAnnotatorClient({ credentials });
        console.log('✓ Vision API: Using credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON');
    }
    // Second try: use file path from environment variable (set by deployment platform)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        client = new ImageAnnotatorClient();
        console.log('✓ Vision API: Using credentials from GOOGLE_APPLICATION_CREDENTIALS file');
    }
    // No credentials found
    else {
        initError = 'No Google Cloud credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS environment variable.';
        console.error('✗ Vision API:', initError);
    }
} catch (error: any) {
    initError = `Failed to initialize Vision API client: ${error.message}`;
    console.error('✗ Vision API:', initError);
}

export async function POST(req: NextRequest) {
    // Check if Vision API client is properly initialized
    if (!client) {
        return NextResponse.json(
            { error: initError || 'Vision API not configured' },
            { status: 503 }
        );
    }

    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Remove data URL prefix if present
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // Use batchAnnotateImages with proper features configuration 
        // This is the correct way to set maxResults in Node.js client
        const [response] = await client.batchAnnotateImages({
            requests: [
                {
                    image: { content: imageBuffer.toString('base64') },
                    features: [
                        {
                            type: 'OBJECT_LOCALIZATION',
                            maxResults: 100, // Detect up to 100 objects
                        },
                        {
                            type: 'FACE_DETECTION',
                            maxResults: 100, // Detect up to 100 faces
                        },
                    ],
                },
            ],
        });

        const result = response.responses?.[0];
        if (!result) {
            throw new Error('No response from Vision API');
        }

        const objects = result.localizedObjectAnnotations || [];
        const faces = result.faceAnnotations || [];

        // Count people from objects
        const peopleFromObjects = objects.filter(
            (obj) => obj.name?.toLowerCase() === 'person'
        ).length;
        const peopleFromFaces = faces.length;
        const totalPeople = Math.max(peopleFromObjects, peopleFromFaces);

        console.log(`📊 Detection: ${peopleFromObjects} people (objects), ${peopleFromFaces} faces, Total: ${totalPeople}`);

        // Prepare detection data
        const detections = {
            people: totalPeople,
            peopleFromObjects,
            facesDetected: peopleFromFaces,
            objects: objects.map((obj) => ({
                name: obj.name,
                confidence: obj.score,
                boundingBox: obj.boundingPoly?.normalizedVertices || [],
            })),
            faces: faces.map((face) => ({
                confidence: face.detectionConfidence,
                boundingBox: face.boundingPoly?.vertices || [],
                expressions: {
                    joy: face.joyLikelihood,
                    sorrow: face.sorrowLikelihood,
                    anger: face.angerLikelihood,
                    surprise: face.surpriseLikelihood,
                },
            })),
        };

        return NextResponse.json({
            success: true,
            detections,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}
