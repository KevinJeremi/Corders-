"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LiveFeedCard } from "@/components/ui/LiveFeedCard";
import { Video, Activity, Users, AlertTriangle } from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";

export default function LiveViewPage() {
    const { feeds, stats, updateFeedCount, startAnalysis, lastUpdate } = useAnalysis();

    // Start analysis saat page dimount
    useEffect(() => {
        startAnalysis();
    }, [startAnalysis]);

    // Handle real-time people count updates from child components
    const handlePeopleCountChange = (feedId: string, count: number) => {
        updateFeedCount(feedId, count);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white neon-text">
                        Live Camera Feeds
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time monitoring • AI-Powered Detection Active
                    </p>
                </div>
                <div className="flex gap-3">
                    <Card className="px-4 py-2 flex items-center gap-3 bg-primary/10 border-primary/30">
                        <Video className="text-primary w-5 h-5" />
                        <span className="text-primary font-semibold">
                            {stats.activeCameras} Active
                        </span>
                    </Card>
                    <Card className="px-4 py-2 flex items-center gap-3 bg-blue-500/10 border-blue-500/30">
                        <Users className="text-blue-400 w-5 h-5" />
                        <span className="text-blue-400 font-semibold">
                            {stats.totalPeople} People
                        </span>
                    </Card>
                    {stats.totalAlerts > 0 && (
                        <Card className="px-4 py-2 flex items-center gap-3 bg-red-500/10 border-red-500/30">
                            <AlertTriangle className="text-red-400 w-5 h-5" />
                            <span className="text-red-400 font-semibold">
                                {stats.totalAlerts} Alerts
                            </span>
                        </Card>
                    )}
                </div>
            </div>

            {/* Live Feeds Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {feeds.map((feed) => (
                    <LiveFeedCard
                        key={feed.id}
                        feed={feed}
                        onPeopleCountChange={handlePeopleCountChange}
                    />
                ))}
            </div>

            {/* System Status Footer */}
            <Card className="p-4 bg-black/30 border-[#ffffff08]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-sm text-gray-400">System Status:</span>
                            <span className="text-sm text-primary font-semibold">
                                Operational
                            </span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <span className="text-sm text-gray-500">
                            Google Cloud Vision API • Active
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        Last sync: {lastUpdate.toLocaleTimeString('id-ID')}
                    </div>
                </div>
            </Card>
        </div>
    );
}
