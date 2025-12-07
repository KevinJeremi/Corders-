"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAnalysis } from "@/contexts/AnalysisContext"
import { VideoFeed } from "@/lib/types"

function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function BackgroundAnalyzer() {
  const { feeds, updateFeedCount, isAnalyzing } = useAnalysis()
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement }>({})
  const analysisIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Analisa frame video lokal
  const analyzeLocalFrame = useCallback(async (feedId: string) => {
    const video = videoRefs.current[feedId]
    const canvas = canvasRefs.current[feedId]

    if (!video || !canvas || video.paused || video.ended) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.detections) {
          updateFeedCount(feedId, result.detections.people || 0)
        }
      }
    } catch (error) {
      console.error("Background analysis error (local):", error)
    }
  }, [updateFeedCount])

  // Analisa YouTube menggunakan thumbnail
  const analyzeYouTubeFrame = useCallback(async (feed: VideoFeed) => {
    const videoId = extractVideoId(feed.src)
    if (!videoId) return

    // Buat canvas jika belum ada
    if (!canvasRefs.current[feed.id]) {
      canvasRefs.current[feed.id] = document.createElement("canvas")
    }
    const canvas = canvasRefs.current[feed.id]
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Gunakan YouTube thumbnail sebagai snapshot
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = thumbnailUrl

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      canvas.width = 1280
      canvas.height = 720
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.detections) {
          updateFeedCount(feed.id, result.detections.people || 0)
        }
      }
    } catch (error) {
      console.error("Background analysis error (YouTube):", error)
    }
  }, [updateFeedCount])

  useEffect(() => {
    if (!isAnalyzing) {
      // Stop semua interval jika tidak analisa
      Object.values(analysisIntervals.current).forEach(interval => clearInterval(interval))
      analysisIntervals.current = {}
      return
    }

    // 1. Local video feeds
    const localFeeds = feeds.filter(f => f.status === "Active" && f.type === "local")

    localFeeds.forEach(feed => {
      // Buat video element jika belum ada
      if (!videoRefs.current[feed.id]) {
        const video = document.createElement("video")
        video.src = feed.src
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.autoplay = true
        video.crossOrigin = "anonymous"
        video.play().catch(err => console.error("Video play error:", err))
        videoRefs.current[feed.id] = video
      }

      // Buat canvas element jika belum ada
      if (!canvasRefs.current[feed.id]) {
        canvasRefs.current[feed.id] = document.createElement("canvas")
      }

      // Start analysis interval untuk local feed
      if (!analysisIntervals.current[feed.id]) {
        analysisIntervals.current[feed.id] = setInterval(() => {
          analyzeLocalFrame(feed.id)
        }, 5000)
      }
    })

    // 2. YouTube feeds
    const youtubeFeeds = feeds.filter(f => f.status === "Active" && f.type === "youtube")

    youtubeFeeds.forEach(feed => {
      // Start analysis interval untuk YouTube feed
      if (!analysisIntervals.current[feed.id]) {
        analysisIntervals.current[feed.id] = setInterval(() => {
          analyzeYouTubeFrame(feed)
        }, 5000)
      }
    })

    // Cleanup untuk feed yang tidak aktif
    const allActiveFeeds = [...localFeeds, ...youtubeFeeds]
    Object.keys(analysisIntervals.current).forEach(feedId => {
      if (!allActiveFeeds.find(f => f.id === feedId)) {
        clearInterval(analysisIntervals.current[feedId])
        delete analysisIntervals.current[feedId]
      }
    })

    return () => {
      Object.values(analysisIntervals.current).forEach(interval => clearInterval(interval))
    }
  }, [feeds, isAnalyzing, analyzeLocalFrame, analyzeYouTubeFrame])

  // Hidden component - tidak render apapun
  return null
}
