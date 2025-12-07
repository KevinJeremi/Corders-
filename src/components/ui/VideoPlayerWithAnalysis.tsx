"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnalysisResult, Detection } from "@/lib/types";

interface VideoPlayerWithAnalysisProps {
    src: string;
    className?: string;
    onAnalysisUpdate?: (peopleCount: number) => void;
}

export function VideoPlayerWithAnalysis({
    src,
    className = "",
    onAnalysisUpdate,
}: VideoPlayerWithAnalysisProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [peopleCount, setPeopleCount] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
    const [detections, setDetections] = useState<Detection | null>(null);

    const analyzeFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx || video.paused || video.ended) return;

        setIsAnalyzing(true);

        try {
            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to base64
            const imageData = canvas.toDataURL("image/jpeg", 0.8);

            // Send to API for analysis
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
                }
            }
        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, onAnalysisUpdate]);

    const drawBoundingBoxes = useCallback(() => {
        if (!overlayCanvasRef.current || !videoRef.current || !detections) return;

        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw person bounding boxes
        detections.objects.forEach((obj) => {
            if (obj.name?.toLowerCase() === "person" && obj.boundingBox) {
                const vertices = obj.boundingBox;

                // Convert normalized coordinates to pixels
                const x1 = vertices[0].x! * canvas.width;
                const y1 = vertices[0].y! * canvas.height;
                const x2 = vertices[2].x! * canvas.width;
                const y2 = vertices[2].y! * canvas.height;

                // Draw box
                ctx.strokeStyle = "#00ff94"; // Primary green
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

                // Label background
                ctx.fillStyle = "rgba(0, 255, 148, 0.2)";
                ctx.fillRect(x1, y1 - 28, textWidth + 16, 24);

                // Label border
                ctx.strokeStyle = "#00ff94";
                ctx.lineWidth = 1;
                ctx.strokeRect(x1, y1 - 28, textWidth + 16, 24);

                // Label text
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

                // Scale to canvas size
                const sx1 = (x1 / videoRef.current!.videoWidth) * canvas.width;
                const sy1 = (y1 / videoRef.current!.videoHeight) * canvas.height;
                const sx2 = (x2 / videoRef.current!.videoWidth) * canvas.width;
                const sy2 = (y2 / videoRef.current!.videoHeight) * canvas.height;

                // Draw box
                ctx.strokeStyle = "#ff0000"; // Red for faces (matching Python)
                ctx.lineWidth = 2;
                ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

                // Draw corners
                const cornerLength = 10;
                ctx.lineWidth = 3;

                // Top-left
                ctx.beginPath();
                ctx.moveTo(sx1, sy1 + cornerLength);
                ctx.lineTo(sx1, sy1);
                ctx.lineTo(sx1 + cornerLength, sy1);
                ctx.stroke();

                // Top-right
                ctx.beginPath();
                ctx.moveTo(sx2 - cornerLength, sy1);
                ctx.lineTo(sx2, sy1);
                ctx.lineTo(sx2, sy1 + cornerLength);
                ctx.stroke();

                // Bottom-left
                ctx.beginPath();
                ctx.moveTo(sx1, sy2 - cornerLength);
                ctx.lineTo(sx1, sy2);
                ctx.lineTo(sx1 + cornerLength, sy2);
                ctx.stroke();

                // Bottom-right
                ctx.beginPath();
                ctx.moveTo(sx2 - cornerLength, sy2);
                ctx.lineTo(sx2, sy2);
                ctx.lineTo(sx2, sy2 - cornerLength);
                ctx.stroke();

                // Draw label
                const label = "FACE";
                ctx.font = "bold 12px monospace";
                const textWidth = ctx.measureText(label).width;

                // Label background
                ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
                ctx.fillRect(sx1, sy1 - 24, textWidth + 12, 20);

                // Label border
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 1;
                ctx.strokeRect(sx1, sy1 - 24, textWidth + 12, 20);

                // Label text
                ctx.fillStyle = "#ff0000";
                ctx.fillText(label, sx1 + 6, sy1 - 8);
            }
        });
    }, [detections]);

    useEffect(() => {
        drawBoundingBoxes();
    }, [detections, drawBoundingBoxes]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay may be blocked
            });
        }

        // Staggered initialization: random delay 0-300ms to avoid request collision
        const initialDelay = Math.random() * 300;
        let interval: NodeJS.Timeout;

        const initialTimeout = setTimeout(() => {
            analyzeFrame();
            // Start regular analysis interval
            interval = setInterval(analyzeFrame, 500);
        }, initialDelay);

        return () => {
            clearTimeout(initialTimeout);
            if (interval) clearInterval(interval);
        };
    }, [analyzeFrame]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <video
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />

            {/* Overlay canvas for bounding boxes */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Hidden canvas for frame extraction */}
            <canvas ref={canvasRef} className="hidden" />

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
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-white text-xs font-mono z-10 space-y-1">
                    {detections.objects.filter(o => o.name?.toLowerCase() === 'person').length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary"></div>
                            <span className="text-primary">Person Detection</span>
                        </div>
                    )}
                    {detections.faces.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-red-500"></div>
                            <span className="text-red-500">Face Detection</span>
                        </div>
                    )}
                </div>
            )}

            {/* Analyzing indicator */}
            {isAnalyzing && (
                <div className="absolute top-4 right-4 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded text-yellow-400 text-xs font-mono border border-yellow-500/30 z-10">
                    Analyzing...
                </div>
            )}
        </div>
    );
}
