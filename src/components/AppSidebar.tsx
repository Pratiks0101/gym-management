'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    QrCode, 
    Dumbbell,
    Receipt,
    LogOut,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { getInitials } from "@/lib/utils"

type AppSidebarProps = {
    gymName: string
    userEmail?: string
}

export function AppSidebar({ gymName, userEmail }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Members", href: "/dashboard/members", icon: Users },
        { label: "Payments", href: "/dashboard/payments", icon: Receipt },
        { label: "Plans", href: "/dashboard/plans", icon: CreditCard },
        { label: "Attendance", href: "/dashboard/attendance", icon: QrCode },
    ]

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const initials = getInitials(gymName)

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800">
            {/* Header with Gym Branding */}
            <SidebarHeader className="border-b border-slate-200 dark:border-slate-800">
                <SidebarMenu>
                    <SidebarMenuItem className="cursor-pointer">
                        <Link href="/dashboard">
                            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                                    <Dumbbell className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight truncate group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-extrabold text-slate-900 dark:text-white">
                                        {gymName}
                                    </span>
                                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        {userEmail}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Main Navigation Links */}
            <SidebarContent className="py-2">
                <SidebarMenu className="px-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        
                        // 🟢 Smart Path Matching Fix
                        const isActive = item.href === "/dashboard" 
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href)

                        return (
                            <SidebarMenuItem key={item.href} className="cursor-pointer">
                                <Link href={item.href} className="w-full">
                                    <SidebarMenuButton
                                        isActive={isActive}
                                        tooltip={item.label}
                                        className={`w-full flex items-center gap-3 px-3 py-5 text-sm transition-all rounded-xl cursor-pointer ${
                                            isActive
                                                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold border-r-4 border-emerald-600 shadow-xs text-xl uppercase"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`} />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Direct Profile Info & Signout Button */}
            <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-2">
                <div className="flex items-center justify-between w-full gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
                    
                    {/* User Info & Avatar Initials */}
                    <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                        </div>
                        <div className="grid flex-1 text-left text-xs leading-tight truncate">
                            <span className="truncate font-bold text-slate-900 dark:text-white">
                                Owner
                            </span>
                            <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                {userEmail || "owner@gym.com"}
                            </span>
                        </div>
                    </div>

                    {/* Signout Button */}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        title="Sign Out"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}