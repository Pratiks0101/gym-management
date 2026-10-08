'use client'

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, Receipt, CreditCard,  User } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

type NavbarProps = {
    gymName: string
    ownerEmail: string
}

export function AppNavbar({ gymName, ownerEmail }: NavbarProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const initials = getInitials(gymName)

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">

            {/* Left Section: Sidebar Toggle Button + Gym Title */}
            <div className="flex items-center gap-2 sm:gap-3">
                <SidebarTrigger className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" />
                
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-50 sm:max-w-xs">
                    {gymName}
                </h1>
                <span className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold shrink-0">
                    Live
                </span>
            </div>

            {/* Right Section: Theme Toggle & User Dropdown */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-35">
                                    {gymName}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-35">
                                    {ownerEmail}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{gymName}</p>
                                    <p className="text-xs text-slate-500 truncate">{ownerEmail}</p>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href="/dashboard" className="flex">
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href="/dashboard/members" className="flex">
                                    <User className="w-4 h-4 mr-2" /> Members
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href="/dashboard/payments" className="flex">
                                    <Receipt className="w-4 h-4 mr-2" /> Payments
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Link href="/dashboard/plans" className="flex">
                                    <CreditCard className="w-4 h-4 mr-2" /> Plans
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem 
                                onClick={handleSignOut}
                                className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}