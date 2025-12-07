"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, BarChart2, Camera, Settings, ShieldAlert, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Camera, label: "Live View", href: "/live" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="glass h-full w-64 flex flex-col border-r border-[#ffffff10] fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2 text-primary neon-text">
                <img src="/logo.jpg" alt="Corders Logo" className="w-10 h-10 object-contain rounded-lg drop-shadow-[0_0_10px_rgba(0,255,148,0.5)]" />
                <span className="text-xl font-bold tracking-wider">C<span className="text-white">orders</span></span>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group hover:bg-[#ffffff08]",
                                isActive
                                    ? "bg-[#00ff9415] text-primary border-l-2 border-primary neon-border"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_5px_rgba(0,255,148,0.5)]")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[#ffffff10]">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-[#ff444410] rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}
