"use client"

import { Card } from "@/components/ui/card"
import { Video, Users, AlertTriangle, Activity, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAnalysis } from "@/contexts/AnalysisContext"

export default function DashboardPage() {
  const { feeds, stats, isAnalyzing, lastUpdate } = useAnalysis()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white neon-text">Dashboard Monitoring</h1>
        <p className="text-muted-foreground mt-1">Ringkasan aktivitas kamera toko secara real-time</p>
      </div>

      {/* Status Analisa */}
      {isAnalyzing && (
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div>
                <p className="text-sm font-semibold text-primary">Analisa Sedang Berjalan</p>
                <p className="text-xs text-gray-400">Live view aktif - data diperbarui otomatis</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Update: {lastUpdate.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </Card>
      )}

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-6 transition-all duration-300 ${
          isAnalyzing ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,255,148,0.2)]" : "bg-primary/10 border-primary/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Kamera Aktif</p>
              <p className="text-3xl font-bold text-primary">{stats.activeCameras}</p>
              <p className="text-xs text-gray-500 mt-1">dari {feeds.length} total kamera</p>
            </div>
            <Video className="w-10 h-10 text-primary opacity-50" />
          </div>
        </Card>

        <Card className={`p-6 transition-all duration-300 ${
          isAnalyzing ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-blue-500/10 border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Orang Terdeteksi</p>
              <p className={`text-3xl font-bold text-blue-400 transition-all ${isAnalyzing ? "scale-110" : ""}`}>
                {stats.totalPeople}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isAnalyzing ? "sedang dianalisa..." : "total saat ini"}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card className={`p-6 transition-all duration-300 ${
          isAnalyzing ? "bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-red-500/10 border-red-500/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Alert Aktif</p>
              <p className="text-3xl font-bold text-red-400">{stats.totalAlerts}</p>
              <p className="text-xs text-gray-500 mt-1">perlu perhatian</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Status Kamera */}
      <Card className="p-6 bg-black/30 border-[#ffffff08]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Status Kamera</h2>
          <Link href="/live" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Lihat Semua
          </Link>
        </div>

        <div className="space-y-3">
          {feeds.map((feed) => (
            <div key={feed.id} className={`flex items-center justify-between p-3 bg-black/20 rounded-lg border transition-all duration-300 ${
              isAnalyzing && feed.status === 'Active' 
                ? 'border-primary/30 hover:border-primary/50 shadow-[0_0_10px_rgba(0,255,148,0.1)]' 
                : 'border-[#ffffff05] hover:border-primary/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  feed.status === 'Active' 
                    ? isAnalyzing 
                      ? 'bg-primary shadow-[0_0_8px_#00ff94] animate-pulse' 
                      : 'bg-primary shadow-[0_0_8px_#00ff94]'
                    : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">{feed.name}</p>
                  <p className="text-xs text-gray-500">{feed.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Orang</p>
                  <p className={`text-sm font-semibold text-blue-400 transition-all ${
                    isAnalyzing && feed.status === 'Active' ? 'scale-110' : ''
                  }`}>
                    {feed.peopleCount || 0}
                  </p>
                </div>
                {(feed.alerts || 0) > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Alert</p>
                    <p className="text-sm font-semibold text-red-400">{feed.alerts}</p>
                  </div>
                )}
                <span className={`px-2 py-1 text-xs rounded ${
                  feed.status === 'Active' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {feed.status}
                </span>
                {isAnalyzing && feed.status === 'Active' && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Sistem */}
      <Card className="p-4 bg-black/30 border-[#ffffff08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 text-primary ${isAnalyzing ? 'animate-pulse' : ''}`} />
              <span className="text-sm text-gray-400">Status Sistem:</span>
              <span className="text-sm text-primary font-semibold">Berjalan Normal</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <span className={`text-sm ${isAnalyzing ? 'text-primary' : 'text-gray-500'}`}>
              AI Detection • {isAnalyzing ? 'Sedang Analisa' : 'Standby'}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Update: {lastUpdate.toLocaleTimeString('id-ID')}
          </div>
        </div>
      </Card>
    </div>
  )
}
