import { NextResponse } from 'next/server';
import { VideoFeed } from '@/lib/types';

const videoFeeds: VideoFeed[] = [
    {
        id: 'cam-001',
        name: 'Lobby Entrance',
        type: 'local',
        location: 'Main Building',
        status: 'Active',
        src: '/videos/lobby-cam-feed.mp4',
        peopleCount: 12,
        alerts: 2,
    },
    {
        id: 'cam-002',
        name: 'Exterior Parking',
        type: 'local',
        location: 'Parking Zone A',
        status: 'Active',
        src: '/videos/exterior-cam-feed.mp4',
        peopleCount: 8,
        alerts: 1,
    },
    {
        id: 'cam-003',
        name: 'Street View Live',
        type: 'youtube',
        location: 'Public Area',
        status: 'Active',
        src: 'https://www.youtube.com/watch?v=NscyTzvTjHE',
        peopleCount: 25,
        alerts: 0,
    },
];

export async function GET() {
    // Simulate some dynamic data
    const feeds = videoFeeds.map(feed => ({
        ...feed,
        peopleCount: feed.peopleCount! + Math.floor(Math.random() * 5) - 2,
        timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
        feeds,
        meta: {
            totalCameras: feeds.length,
            activeCameras: feeds.filter(f => f.status === 'Active').length,
            totalAlerts: feeds.reduce((acc, f) => acc + (f.alerts || 0), 0),
        },
    });
}
