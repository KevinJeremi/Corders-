"use client";

import { useEffect, useState } from "react";

interface YouTubeEmbedProps {
    videoUrl: string;
    className?: string;
}

function extractVideoId(url: string): string | null {
    const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function YouTubeEmbed({ videoUrl, className = "" }: YouTubeEmbedProps) {
    const [currentTime, setCurrentTime] = useState("");
    const videoId = extractVideoId(videoUrl);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!videoId) {
        return (
            <div
                className={`flex items-center justify-center bg-black text-red-500 ${className}`}
            >
                Invalid YouTube URL
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: "none" }}
            />

            {/* Scanline overlay effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                    }}
                />
            </div>

            {/* Timestamp overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded font-mono text-xs text-green-400">
                {currentTime}
            </div>

            {/* Subtle vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
                }}
            />
        </div>
    );
}
