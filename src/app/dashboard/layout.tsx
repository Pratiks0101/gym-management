import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/AppSidebar'
import { AppNavbar } from '@/components/AppNavbar'

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
        .select('*')
        .eq('owner_id', user.id)
        .single()

    const gymName = gym?.name || 'Gym Center'

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar with Gym Name */}
            <AppSidebar gymName={gymName} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Navbar with Gym Name & Owner Email */}
                <AppNavbar gymName={gymName} ownerEmail={user.email || ''} />
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}