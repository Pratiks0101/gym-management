'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    QrCode, 
    ChevronLeft, 
    ChevronRight, 
    Dumbbell,
    Receipt
} from "lucide-react"

type SidebarProps = {
    gymName: string
}

export function AppSidebar({ gymName }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Members", href: "/dashboard/members", icon: Users },
        { label: "Payments", href: "/dashboard/payments", icon: Receipt },
        { label: "Plans", href: "/dashboard/plans", icon: CreditCard },
        { label: "Attendance", href: "/dashboard/attendance", icon: QrCode },
    ]

    return (
        <aside 
            className={`h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative flex flex-col shrink-0 ${
                isCollapsed ? "w-16 sm:w-20" : "w-60 sm:w-64"
            }`}
        >
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                        <Dumbbell className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight whitespace-nowrap truncate">
                            {gymName}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                isActive
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            } ${isCollapsed ? "justify-center" : ""}`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}