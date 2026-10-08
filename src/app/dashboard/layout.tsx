import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/AppSidebar'
import { AppNavbar } from '@/components/AppNavbar'
import { cookies } from 'next/headers'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's Gym details
    const { data: gym } = await supabase
        .from('gyms')
        .select('name')
        .eq('owner_id', user.id)
        .single()

    const gymName = gym?.name || 'Gym Workspace'
    const ownerEmail = user.email || ''

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            {/* Custom AppSidebar Component */}
            <AppSidebar gymName={gymName} userEmail={ownerEmail} />

            {/* Main Content Area */}
            <SidebarInset className="bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen">
                {/* Global Top Header / Navbar */}
                <AppNavbar gymName={gymName} ownerEmail={ownerEmail} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}