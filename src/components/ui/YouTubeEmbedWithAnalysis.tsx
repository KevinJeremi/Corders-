"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnalysisResult, Detection } from "@/lib/types";

interface YouTubeEmbedWithAnalysisProps {
    videoUrl: string;
    className?: string;
    onAnalysisUpdate?: (peopleCount: number) => void;
}

function extractVideoId(url: string): string | null {
    const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export function YouTubeEmbedWithAnalysis({
    videoUrl,
    className = "",
    onAnalysisUpdate,
}: YouTubeEmbedWithAnalysisProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [peopleCount, setPeopleCount] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
    const [detections, setDetections] = useState<Detection | null>(null);
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

    const analyzeFrame = useCallback(async () => {
        if (!iframeRef.current || !canvasRef.current || isAnalyzing) return;

        setIsAnalyzing(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            let imageData: string;

            // First try: Get live frame from YouTube using yt-dlp API
            try {
                console.log("Fetching live frame from YouTube...");
                const frameResponse = await fetch("/api/youtube-frame", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ youtubeUrl: videoUrl }),
                });

                if (frameResponse.ok) {
                    const frameResult = await frameResponse.json();
                    if (frameResult.success && frameResult.image) {
                        imageData = frameResult.image;
                        console.log("✓ Got live frame from YouTube");
                    } else {
                        throw new Error("No frame data");
                    }
                } else {
                    throw new Error("Frame API error");
                }
            } catch (frameError) {
                // Fallback: Use YouTube Thumbnail if live frame fails
                console.log("Fallback to YouTube thumbnail...");
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = thumbnailUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                canvas.width = 1280;
                canvas.height = 720;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                imageData = canvas.toDataURL("image/jpeg", 0.8);
            }

            // Send to analysis API
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: imageData }),
            });

            if (response.ok) {
                const result: AnalysisResult = await response.json();
                if (result.success && result.detections) {
                    const count = result.detections.people;
                    setPeopleCount(count);
                    setDetections(result.detections);
                    setLastAnalysis(new Date());
                    onAnalysisUpdate?.(count);
                    console.log(`📊 Detection: ${count} people (${result.detections.peopleFromObjects || 0} obj, ${result.detections.facesDetected || 0} faces)`);
                }
            }
        } catch (error) {
            console.error("YouTube analysis error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, onAnalysisUpdate, videoId, videoUrl]);

    const drawBoundingBoxes = useCallback(() => {
        if (!overlayCanvasRef.current || !iframeRef.current || !detections) return;

        const canvas = overlayCanvasRef.current;
        const iframe = iframeRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Set canvas size to match iframe
        canvas.width = iframe.clientWidth;
        canvas.height = iframe.clientHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw person bounding boxes
        detections.objects.forEach((obj) => {
            if (obj.name?.toLowerCase() === "person" && obj.boundingBox) {
                const vertices = obj.boundingBox;

                const x1 = vertices[0].x! * canvas.width;
                const y1 = vertices[0].y! * canvas.height;
                const x2 = vertices[2].x! * canvas.width;
                const y2 = vertices[2].y! * canvas.height;

                // Draw box
                ctx.strokeStyle = "#00ff94";
                ctx.lineWidth = 3;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                // Draw corners
                const cornerLength = 15;
                ctx.lineWidth = 4;

                // Top-left
                ctx.beginPath();
                ctx.moveTo(x1, y1 + cornerLength);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x1 + cornerLength, y1);
                ctx.stroke();

                // Top-right
                ctx.beginPath();
                ctx.moveTo(x2 - cornerLength, y1);
                ctx.lineTo(x2, y1);
                ctx.lineTo(x2, y1 + cornerLength);
                ctx.stroke();

                // Bottom-left
                ctx.beginPath();
                ctx.moveTo(x1, y2 - cornerLength);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x1 + cornerLength, y2);
                ctx.stroke();

                // Bottom-right
                ctx.beginPath();
                ctx.moveTo(x2 - cornerLength, y2);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, y2 - cornerLength);
                ctx.stroke();

                // Draw label
                const label = `PERSON ${Math.round((obj.confidence || 0) * 100)}%`;
                ctx.font = "bold 14px monospace";
                const textWidth = ctx.measureText(label).width;

                ctx.fillStyle = "rgba(0, 255, 148, 0.2)";
                ctx.fillRect(x1, y1 - 28, textWidth + 16, 24);

                ctx.strokeStyle = "#00ff94";
                ctx.lineWidth = 1;
                ctx.strokeRect(x1, y1 - 28, textWidth + 16, 24);

                ctx.fillStyle = "#00ff94";
                ctx.fillText(label, x1 + 8, y1 - 10);
            }
        });

        // Draw face bounding boxes
        detections.faces.forEach((face) => {
            if (face.boundingBox) {
                const vertices = face.boundingBox;

                const x1 = vertices[0].x!;
                const y1 = vertices[0].y!;
                const x2 = vertices[2].x!;
                const y2 = vertices[2].y!;

                const sx1 = (x1 / 1280) * canvas.width;
                const sy1 = (y1 / 720) * canvas.height;
                const sx2 = (x2 / 1280) * canvas.width;
                const sy2 = (y2 / 720) * canvas.height;

                ctx.strokeStyle = "#ff0000"; // Red for faces (matching Python)
                ctx.lineWidth = 2;
                ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

                const cornerLength = 10;
                ctx.lineWidth = 3;

                // Corners
                ctx.beginPath();
                ctx.moveTo(sx1, sy1 + cornerLength);
                ctx.lineTo(sx1, sy1);
                ctx.lineTo(sx1 + cornerLength, sy1);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(sx2 - cornerLength, sy1);
                ctx.lineTo(sx2, sy1);
                ctx.lineTo(sx2, sy1 + cornerLength);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(sx1, sy2 - cornerLength);
                ctx.lineTo(sx1, sy2);
                ctx.lineTo(sx1 + cornerLength, sy2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(sx2 - cornerLength, sy2);
                ctx.lineTo(sx2, sy2);
                ctx.lineTo(sx2, sy2 - cornerLength);
                ctx.stroke();

                // Label
                const label = "FACE";
                ctx.font = "bold 12px monospace";
                const textWidth = ctx.measureText(label).width;

                ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
                ctx.fillRect(sx1, sy1 - 24, textWidth + 12, 20);

                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 1;
                ctx.strokeRect(sx1, sy1 - 24, textWidth + 12, 20);

                ctx.fillStyle = "#ff0000";
                ctx.fillText(label, sx1 + 6, sy1 - 8);
            }
        });
    }, [detections]);

    useEffect(() => {
        drawBoundingBoxes();
    }, [detections, drawBoundingBoxes]);

    useEffect(() => {
        // Staggered initialization: random delay 500-1000ms to avoid collision with local videos
        const initialDelay = 500 + Math.random() * 500;
        const initialTimeout = setTimeout(() => {
            analyzeFrame();
        }, initialDelay);

        // Start regular analysis after initial delay
        const interval = setInterval(analyzeFrame, 2000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [analyzeFrame]);

    if (!videoId) {
        return (
            <div className={`flex items-center justify-center bg-black text-red-500 ${className}`}>
                Invalid YouTube URL
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <iframe
                ref={iframeRef}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1`}
                title="YouTube Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />

            {/* Overlay canvas for bounding boxes */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Hidden canvas for analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live indicator */}
            <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded flex items-center gap-2 z-10 border border-red-400/30 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                <span className="text-white font-bold text-sm">LIVE</span>
            </div>

            {/* Time indicator */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded text-white text-xs font-mono z-10 border border-white/10">
                {currentTime}
            </div>

            {/* Analysis overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded border border-primary/30 text-white text-sm font-mono z-10">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                            }`}
                    />
                    <span>
                        People: <span className="text-primary font-bold">{peopleCount}</span>
                    </span>
                </div>
                {lastAnalysis && (
                    <div className="text-xs text-gray-400 mt-1">
                        Last: {lastAnalysis.toLocaleTimeString()}
                    </div>
                )}
            </div>

            {/* Detection legend */}
            {detections && (detections.objects.length > 0 || detections.faces.length > 0) && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-white text-xs font-mono z-10 space-y-1">
                    {detections.objects.filter(o => o.name?.toLowerCase() === 'person').length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary"></div>
                            <span className="text-primary">Person</span>
                        </div>
                    )}
                    {detections.faces.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-red-500"></div>
                            <span className="text-red-500">Face</span>
                        </div>
                    )}
                </div>
            )}

            {/* Analyzing indicator */}
            {isAnalyzing && (
                <div className="absolute top-16 right-4 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded text-yellow-400 text-xs font-mono border border-yellow-500/30 z-10">
                    Analyzing...
                </div>
            )}
        </div>
    );
}
