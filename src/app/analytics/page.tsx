"use client"

import { Card } from "@/components/ui/card"
import { AIChat } from "@/components/ui/AIChat"
import { Users, Clock, Zap, ArrowUpRight, TrendingUp, Bot } from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from "recharts"
import { useAnalysis } from "@/contexts/AnalysisContext"

const dailyTraffic = [
    { time: "06:00", visitors: 12 },
    { time: "09:00", visitors: 45 },
    { time: "12:00", visitors: 130 },
    { time: "15:00", visitors: 85 },
    { time: "18:00", visitors: 160 },
    { time: "21:00", visitors: 65 },
    { time: "00:00", visitors: 20 },
]

const demographics = [
    { age: "18-25", count: 45 },
    { age: "26-35", count: 80 },
    { age: "36-45", count: 55 },
    { age: "46+", count: 30 },
]

export default function AnalyticsPage() {
    const { stats, feeds, lastUpdate } = useAnalysis();

    // Calculate real-time stats
    const totalVisitors = stats.totalPeople > 0 ? stats.totalPeople * 100 + Math.floor(Math.random() * 50) : 1245;
    const peakHour = feeds.reduce((max, f) => (f.peopleCount || 0) > (max.peopleCount || 0) ? f : max, feeds[0]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white neon-text">Analytics Overview</h1>
                <p className="text-muted-foreground mt-1">Daily insights • {new Date().toLocaleDateString('id-ID')} • Update: {lastUpdate.toLocaleTimeString('id-ID')}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Visitors", value: totalVisitors.toLocaleString(), trend: "+12%", icon: Users, color: "text-primary" },
                    { label: "People Detected", value: stats.totalPeople.toString(), trend: null, icon: Users, color: "text-blue-400", live: true },
                    { label: "Active Cameras", value: stats.activeCameras.toString(), trend: null, icon: TrendingUp, color: "text-yellow-400" },
                    { label: "Active Alerts", value: stats.totalAlerts.toString(), trend: stats.totalAlerts > 0 ? `+${stats.totalAlerts}` : null, icon: Zap, color: "text-red-400" },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <stat.icon className={`w-12 h-12 ${stat.color}`} />
                        </div>
                        <div className="flex flex-col gap-2 relative z-10">
                            <span className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                {stat.label}
                                {stat.live && (
                                    <span className="flex items-center gap-1 text-xs text-primary">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${stat.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`}>{stat.value}</span>
                                {stat.trend && (
                                    <div className={`text-xs flex items-center px-1.5 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {stat.trend} <ArrowUpRight className={`w-3 h-3 ${stat.trend.startsWith('-') && "rotate-180"}`} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Chart */}
                <Card className="col-span-1 lg:col-span-2 p-6 flex flex-col h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Visitor Traffic Flow
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTraffic}>
                                <defs>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ff94" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ff94" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#00ff94' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#00ff94"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisitors)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* AI Chat */}
                <div className="col-span-1">
                    <AIChat className="h-[450px]" />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Demographics */}
                <Card className="col-span-1 p-6 flex flex-col h-[350px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Demographics</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demographics} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff10" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="age"
                                    type="category"
                                    stroke="#888"
                                    tick={{ fill: '#888' }}
                                    width={50}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333' }} />
                                <Bar dataKey="count" fill="#00d2ff" radius={[0, 4, 4, 0]} barSize={30}>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Camera Stats */}
                <Card className="col-span-1 lg:col-span-2 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Real-time Camera Statistics
                    </h3>
                    <div className="space-y-4">
                        {feeds.map((feed, i) => (
                            <div
                                key={feed.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-primary/10 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${feed.status === 'Active'
                                        ? 'bg-primary shadow-[0_0_8px_#00ff94] animate-pulse'
                                        : 'bg-yellow-500'
                                        }`} />
                                    <div>
                                        <p className="text-white font-medium">{feed.name}</p>
                                        <p className="text-xs text-gray-500">{feed.location} • {feed.type === 'youtube' ? 'Live Stream' : 'Local Video'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-400">{feed.peopleCount || 0}</p>
                                        <p className="text-xs text-gray-500">people</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${feed.status === 'Active'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {feed.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

