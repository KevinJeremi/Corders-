"use client"

import { ReactNode } from "react"
import { AnalysisProvider } from "@/contexts/AnalysisContext"
import { BackgroundAnalyzer } from "@/components/BackgroundAnalyzer"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnalysisProvider>
      <BackgroundAnalyzer />
      {children}
    </AnalysisProvider>
  )
}
