export interface VideoFeed {
    id: string;
    name: string;
    type: 'local' | 'youtube';
    location: string;
    status: 'Active' | 'Maintenance' | 'Offline';
    src: string;
    peopleCount?: number;
    alerts?: number;
    timestamp?: string;
}

export interface AnalyticsData {
    totalPeople: number;
    totalAlerts: number;
    activeCameras: number;
    avgConfidence: number;
}

export interface Detection {
    people: number;
    peopleFromObjects?: number;
    facesDetected?: number;
    objects: DetectedObject[];
    faces: DetectedFace[];
}

export interface DetectedObject {
    name?: string;
    confidence?: number;
    boundingBox: NormalizedVertex[];
}

export interface DetectedFace {
    confidence?: number;
    boundingBox: Vertex[];
    expressions?: {
        joy?: string;
        sorrow?: string;
        anger?: string;
        surprise?: string;
    };
}

export interface NormalizedVertex {
    x?: number;
    y?: number;
}

export interface Vertex {
    x?: number;
    y?: number;
}

export interface AnalysisResult {
    success: boolean;
    detections?: Detection;
    timestamp?: string;
    error?: string;
}
