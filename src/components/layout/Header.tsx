import { Search, Bell, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Header() {
    return (
        <header className="h-16 border-b border-[#ffffff10] flex items-center justify-between px-8 bg-[#05050580] backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search cameras, events..."
                        className="w-full bg-[#ffffff05] border border-[#ffffff10] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500">2</Badge>
                </button>

                <div className="flex items-center gap-3 border-l border-[#ffffff10] pl-6">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-white">Admin User</div>
                        <div className="text-xs text-gray-500">System Owner</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
