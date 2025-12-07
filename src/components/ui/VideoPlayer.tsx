"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
    src: string;
    className?: string;
}

export function VideoPlayer({ src, className = "" }: VideoPlayerProps) {
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
            console.log("Video loaded:", src);
            setIsLoading(false);
            setError(null);
        };

        const handleError = (e: Event) => {
            const videoElement = e.target as HTMLVideoElement;
            const errorCode = videoElement.error?.code;
            const errorMessage = videoElement.error?.message;
            console.error("Video error:", src, {
                code: errorCode,
                message: errorMessage,
                networkState: videoElement.networkState,
                readyState: videoElement.readyState
            });
            setIsLoading(false);
            setError(`Failed to load video (Error ${errorCode})`);
        };

        const handlePlay = () => {
            console.log("Video playing:", src);
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
            console.error("Autoplay failed:", err);
            setError("Click to play");
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
        <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-white text-sm">Loading video...</div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-red-400 text-sm">{error}</div>
                </div>
            )}
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
