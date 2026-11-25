'use client'

import { useState } from "react"
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
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import Image from "next/image"
import { LogoutButton } from "./auth/Logout"
import { GymBrandingManager } from "./shared/GymBrandingManager"

type PreviewTarget = {
    url: string
    title: string
    subtitle?: string
}

type NavbarProps = {
    gymName: string
    ownerEmail: string
    logoUrl?: string | null
    bannerUrl?: string | null
    onPreviewImage?: (target: PreviewTarget) => void
}

export function AppNavbar({ gymName, ownerEmail, logoUrl, bannerUrl, onPreviewImage }: NavbarProps) {

    const {open} = useSidebar()
    const [menuOpen, setMenuOpen] = useState(false)
    const [logoLoadfailed, setLogoLoadfailed] = useState(false)
    const initials = getInitials(gymName)
    const hasBanner = Boolean(bannerUrl)
    const showLogoInAvatar = Boolean(logoUrl && !logoLoadfailed)

    return (
        <header 
            className={`relative border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between top-0 z-10 overflow-hidden transition-all ${
                // Adjust header height based on whether a banner is present
                hasBanner ? "h-44 sm:h-48 md:h-52" : "h-16"
            }`}
        >

            {/* {Conditional Gym Banneer Background} */}
            {hasBanner && bannerUrl && (
                <>
                    <Image
                        src={bannerUrl}
                        alt={`${gymName} Banner`}
                        fill
                        sizes="100vw"
                        loading="eager"
                        onClick={() => 
                            onPreviewImage?.({
                                url: bannerUrl,
                                title: `${gymName} - Banner`,
                                subtitle: ownerEmail || "Gym Owner",
                            })
                        }
                        title="Click to preview banner"
                        className="object-cover object-center cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] pointer-events-none" />
                </>
            )}

            {/* Left Section: Sidebar Toggle + Live Badge + Gym Title */}
            <div className="relative z-10 flex items-center gap-2 sm:gap-3 min-w-0">
                <SidebarTrigger 
                    title={open ? 'Close Sidebar' : 'Open Sidebar'}
                    className={
                        hasBanner
                            ? "text-white hover:bg-white/15"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                />
                
                <h1 
                    className={`text-sm sm:text-base font-bold truncate max-w-44 sm:max-w-xs ${
                        hasBanner ? "text-white drop-shadow-xs" : "text-slate-900 dark:text-white"
                    }`}
                >
                    {gymName}
                </h1>
                <span className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold shrink-0">
                    Live
                </span>
            </div>

            {/* Right Section: Theme Toggle & User Dropdown */}
            <div className="relative z-10 flex items-center gap-3 shrink-0">
                <div className={hasBanner ? "rounded-lg bg-slate-900/60 text-white" : ""}>
                    <ThemeToggle />
                </div>

                <GymBrandingManager
                    logoUrl={logoUrl}
                    bannerUrl={bannerUrl}
                    renderTrigger={(branding) => (
                        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                            <DropdownMenuTrigger className={`outline-none flex items-center gap-2.5 p-1 rounded-lg transition-colors cursor-pointer ${
                                hasBanner ? "hover:bg-white/15" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}>
                                <Avatar className="w-8 h-8">
                                    {( showLogoInAvatar && logoUrl) ? (
                                        <Image
                                            src={logoUrl}
                                            alt={`${gymName} - Logo`}
                                            width={32}
                                            height={32}
                                            onError={() => setLogoLoadfailed(true)}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>)}
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p
                                        className={`text-xs font-bold leading-none truncate max-w-35 ${
                                            hasBanner ? "text-white" : "text-slate-900 dark:text-white"
                                        }`}
                                    >
                                        {gymName}
                                    </p>
                                    <p
                                        className={`text-[10px] mt-0.5 truncate max-w-35 ${
                                            hasBanner ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        {ownerEmail}
                                    </p>
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
                                    <DropdownMenuLabel className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Gym Branding
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                        disabled={branding.isBusy}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log("item clicked: openLogoPicker")
                                            setMenuOpen(false);
                                            setTimeout(() => branding.openLogoPicker(), 0);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {branding.hasLogo ? "Update Logo" : "Upload Logo"}
                                    </DropdownMenuItem>
                                    {branding.hasLogo && (
                                        <DropdownMenuItem
                                            disabled={branding.isBusy}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setMenuOpen(false);
                                                void branding.removeLogo();
                                            }}
                                            className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Logo
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        disabled={branding.isBusy}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMenuOpen(false);
                                            console.log("item clicked: openBannerPicker")
                                            setTimeout(() => branding.openBannerPicker(), 0);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        {branding.hasBanner ? "Update Banner" : "Upload Banner"}
                                    </DropdownMenuItem>
                                    {branding.hasBanner && (
                                        <DropdownMenuItem
                                            disabled={branding.isBusy}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setMenuOpen(false);
                                                void branding.removeBanner();
                                            }}
                                            className="cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Banner
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <LogoutButton isIconOnly={false} />
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                />
            </div>
        </header>
    )
}