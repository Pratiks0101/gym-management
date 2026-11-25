'use client'

import {useState} from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { AppNavbar } from '@/components/AppNavbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal'


export type PreviewImageTarget = {
    url: string
    title: string
    subtitle?: string
}

type DashboardLayoutClientProps = {
    gymName: string
    ownerEmail: string
    logoUrl?: string | null
    bannerUrl?: string | null
    defaultOpen: boolean
    children: React.ReactNode
}

export function DashboardLayoutClient({
    gymName,
    ownerEmail,
    logoUrl,
    bannerUrl,
    defaultOpen,
    children
}: DashboardLayoutClientProps) {
    const [previewImage, setPreviewImage] = useState<PreviewImageTarget | null>(null)

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            {/* {sidebar with gym logo and click to preview} */}
            <AppSidebar 
                gymName={gymName}
                userEmail={ownerEmail}
                logoUrl={logoUrl}
                onPreviewImage={setPreviewImage}
            />

            {/* {Main content area} */}
        <SidebarInset className="bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
            {/* {Global top header / navbar with logo + conditional banner} */}
            <AppNavbar 
                gymName={gymName}
                ownerEmail={ownerEmail}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                onPreviewImage={setPreviewImage}
            />

            {/* {page content} */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                {children}
            </main>
            </SidebarInset>

            {/* {shared click to preview modal} */}
            {previewImage && (
                <ImagePreviewModal 
                    imageUrl={previewImage.url ?? null}
                    title={previewImage.title ?? 'Image Preview'}
                    subtitle={previewImage?.subtitle}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </SidebarProvider>
    )
}