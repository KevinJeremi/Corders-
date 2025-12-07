"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Bell, Shield, Database, Wifi, Moon, Save } from "lucide-react"

const settingsSections = [
    {
        title: "Camera Settings",
        icon: Camera,
        settings: [
            { label: "Default Resolution", value: "1080p", type: "select" },
            { label: "Frame Rate", value: "30 FPS", type: "select" },
            { label: "Night Vision", value: true, type: "toggle" },
        ]
    },
    {
        title: "Notifications",
        icon: Bell,
        settings: [
            { label: "Alert Sound", value: true, type: "toggle" },
            { label: "Email Notifications", value: false, type: "toggle" },
            { label: "Push Notifications", value: true, type: "toggle" },
        ]
    },
    {
        title: "Security",
        icon: Shield,
        settings: [
            { label: "Two-Factor Auth", value: true, type: "toggle" },
            { label: "Session Timeout", value: "30 min", type: "select" },
            { label: "Auto Logout", value: true, type: "toggle" },
        ]
    },
    {
        title: "Storage",
        icon: Database,
        settings: [
            { label: "Recording Storage", value: "500 GB / 2 TB", type: "text" },
            { label: "Cloud Backup", value: true, type: "toggle" },
            { label: "Auto Delete After", value: "30 days", type: "select" },
        ]
    },
]

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white neon-text">Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your surveillance system</p>
                </div>
                <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>

            <div className="space-y-6">
                {settingsSections.map((section, idx) => (
                    <Card key={idx} className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#ffffff10] pb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <section.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                        </div>

                        <div className="space-y-4">
                            {section.settings.map((setting, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between py-2">
                                    <span className="text-gray-300">{setting.label}</span>

                                    {setting.type === 'toggle' ? (
                                        <button
                                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${setting.value
                                                    ? 'bg-primary shadow-[0_0_10px_rgba(0,255,148,0.3)]'
                                                    : 'bg-gray-700'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${setting.value ? 'left-6' : 'left-0.5'
                                                    }`}
                                            />
                                        </button>
                                    ) : setting.type === 'select' ? (
                                        <select className="bg-[#ffffff08] border border-[#ffffff10] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50">
                                            <option>{setting.value}</option>
                                        </select>
                                    ) : (
                                        <span className="text-sm text-primary font-mono">{setting.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Connection Status */}
            <Card className="p-6 border-green-500/30 bg-green-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-green-500" />
                        <div>
                            <span className="text-white font-medium">System Connected</span>
                            <p className="text-xs text-gray-400 mt-0.5">All 6 cameras online • Last sync: 2 min ago</p>
                        </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
            </Card>
        </div>
    )
}
