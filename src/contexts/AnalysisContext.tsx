"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { VideoFeed } from "@/lib/types"

// Data feeds statis
const staticFeeds: VideoFeed[] = [
  {
    id: "cam-001",
    name: "Restaurant Sample 1",
    type: "local",
    location: "Demo Video",
    status: "Active",
    src: "/videos/sample.mp4",
    peopleCount: 0,
    alerts: 0,
  },
  {
    id: "cam-002",
    name: "Restaurant Sample 2",
    type: "local",
    location: "Demo Video",
    status: "Active",
    src: "/videos/sample2.mp4",
    peopleCount: 0,
    alerts: 0,
  },
  {
    id: "cam-003",
    name: "Elbo Room Band WebCam",
    type: "youtube",
    location: "Live Stream",
    status: "Active",
    src: "https://www.youtube.com/watch?v=NscyTzvTjHE",
    peopleCount: 0,
    alerts: 0,
  },
]

interface AnalysisContextType {
  feeds: VideoFeed[]
  updateFeedCount: (feedId: string, count: number) => void
  startAnalysis: () => void
  stopAnalysis: () => void
  isAnalyzing: boolean
  lastUpdate: Date
  stats: {
    totalPeople: number
    totalAlerts: number
    activeCameras: number
  }
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [feeds, setFeeds] = useState<VideoFeed[]>(staticFeeds)
  const [isAnalyzing, setIsAnalyzing] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAnalyzing') === 'true'
    }
    return false
  })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalAlerts: 0,
    activeCameras: 0,
  })

  // Update feed count dari live view
  const updateFeedCount = (feedId: string, count: number) => {
    setFeeds(prevFeeds =>
      prevFeeds.map(feed =>
        feed.id === feedId ? { ...feed, peopleCount: count } : feed
      )
    )
    setLastUpdate(new Date())
  }

  // Sync isAnalyzing ke localStorage
  useEffect(() => {
    localStorage.setItem('isAnalyzing', String(isAnalyzing))
  }, [isAnalyzing])

  // Start/Stop analysis
  const startAnalysis = () => setIsAnalyzing(true)
  const stopAnalysis = () => setIsAnalyzing(false)

  // Hitung statistik
  useEffect(() => {
    const totalPeople = feeds.reduce((acc, f) => acc + (f.peopleCount || 0), 0)
    const totalAlerts = feeds.reduce((acc, f) => acc + (f.alerts || 0), 0)
    const activeCameras = feeds.filter((f) => f.status === "Active").length

    setStats({ totalPeople, totalAlerts, activeCameras })
  }, [feeds])

  return (
    <AnalysisContext.Provider
      value={{
        feeds,
        updateFeedCount,
        startAnalysis,
        stopAnalysis,
        isAnalyzing,
        lastUpdate,
        stats,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error("useAnalysis must be used within AnalysisProvider")
  }
  return context
}
