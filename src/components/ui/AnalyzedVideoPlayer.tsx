"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Activity, CheckCircle } from "lucide-react";

interface AnalyzedVideoPlayerProps {
    src: string;
    title: string;
    className?: string;
    avgPeople?: number;
    maxPeople?: number;
    minPeople?: number;
}

export function AnalyzedVideoPlayer({
    src,
    title,
    className = "",
    avgPeople = 0,
    maxPeople = 0,
    minPeople = 0
}: AnalyzedVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => {
            console.log("✓ Analyzed video loaded:", src);
            setIsLoading(false);
            setError(null);
        };

        const handleError = (e: Event) => {
            const videoElement = e.target as HTMLVideoElement;
            const errorCode = videoElement.error?.code;
            console.error("Video error:", src, "Code:", errorCode);
            setIsLoading(false);
            setError(`Failed to load video (Error ${errorCode})`);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("error", handleError);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        // Try to play
        video.play().catch((err) => {
            console.warn("Autoplay blocked, waiting for user interaction");
        });

        return () => {
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("error", handleError);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [src]);

    const handleClick = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="flex flex-col items-center gap-3">
                        <Activity className="w-8 h-8 text-primary animate-pulse" />
                        <div className="text-white text-sm">Loading analyzed video...</div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-red-400 text-sm">{error}</div>
                </div>
            )}

            {/* Video */}
            <div onClick={handleClick} className="cursor-pointer">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    controls={false}
                    className="w-full h-full object-cover"
                    style={{ display: isLoading ? 'none' : 'block' }}
                >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Analyzed Badge */}
            <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-sm px-3 py-1.5 rounded border border-primary/30 flex items-center gap-2 z-10">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-primary font-mono text-xs font-semibold">AI ANALYZED</span>
            </div>

            {/* Stats Overlay */}
            {avgPeople > 0 && !isLoading && (
                <div className="absolute top-14 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-white text-xs font-mono z-10 space-y-1">
                    <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-gray-400">Avg:</span>
                        <span className="text-primary font-bold">{avgPeople}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 ml-5">Max:</span>
                        <span className="text-green-400">{maxPeople}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 ml-5">Min:</span>
                        <span className="text-blue-400">{minPeople}</span>
                    </div>
                </div>
            )}

            {/* Timestamp overlay */}
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded font-mono text-xs text-green-400 z-10">
                {currentTime}
            </div>

            {/* Play/Pause Indicator */}
            {!isPlaying && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                    <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4 border-2 border-primary">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-5">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                    }}
                />
            </div>
        </div>
    );
}
