"use client";

import { useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoPlayerWithAnalysis } from "./VideoPlayerWithAnalysis";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { YouTubeEmbedWithAnalysis } from "./YouTubeEmbedWithAnalysis";
import { Card } from "./card";
import { Badge } from "./badge";
import { Maximize2, MoreVertical, Users, Radio } from "lucide-react";
import { VideoFeed } from "@/lib/types";

interface LiveFeedCardProps {
    feed: VideoFeed;
    enableAnalysis?: boolean;
    onPeopleCountChange?: (feedId: string, count: number) => void;
}

export function LiveFeedCard({ feed, enableAnalysis = true, onPeopleCountChange }: LiveFeedCardProps) {
    const isYouTube = feed.type === "youtube";
    const [currentPeopleCount, setCurrentPeopleCount] = useState(feed.peopleCount || 0);

    const handleAnalysisUpdate = (count: number) => {
        setCurrentPeopleCount(count);
        // Notify parent component about the change
        if (onPeopleCountChange) {
            onPeopleCountChange(feed.id, count);
        }
    };

    return (
        <Card className="overflow-hidden group relative border-[#ffffff10] hover:border-primary/50 transition-all duration-300 bg-black/40">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/90 to-transparent">
                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 bg-red-600/90 px-2 py-0.5 rounded text-xs font-bold text-white animate-pulse">
                        <Radio className="w-3 h-3" />
                        LIVE
                    </div>
                    <span className="text-sm font-medium text-white">{feed.name}</span>
                    <Badge
                        variant={feed.status === "Active" ? "default" : "secondary"}
                        className="ml-1 text-[10px]"
                    >
                        {feed.location}
                    </Badge>
                </div>
                <button className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Video Feed */}
            <div className="aspect-video bg-black relative">
                {isYouTube ? (
                    <YouTubeEmbedWithAnalysis videoUrl={feed.src} className="w-full h-full" />
                ) : enableAnalysis ? (
                    <VideoPlayerWithAnalysis
                        src={feed.src}
                        className="w-full h-full"
                        onAnalysisUpdate={handleAnalysisUpdate}
                    />
                ) : (
                    <VideoPlayer src={feed.src} className="w-full h-full" />
                )}

                {/* Detection info overlay - show for analyzed videos */}
                {!isYouTube && currentPeopleCount > 0 && (
                    <div className="absolute top-14 left-4 bg-primary/20 backdrop-blur-sm px-3 py-1.5 rounded border border-primary/30 flex items-center gap-2 z-10">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-primary font-mono text-sm">
                            {currentPeopleCount} detected
                        </span>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            <div className="p-3 bg-black/60 backdrop-blur-md flex justify-between items-center border-t border-[#ffffff08]">
                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-[blink_1s_ease-in-out_infinite]" />
                    <span className="text-red-400 font-semibold">REC</span>
                    <span className="text-gray-500">•</span>
                    <span>1080p</span>
                    <span className="text-gray-500">•</span>
                    <span>30FPS</span>
                </div>
                <button className="text-primary hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>
        </Card>
    );
}
