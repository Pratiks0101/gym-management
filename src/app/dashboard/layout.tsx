import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { DashboardLayoutClient} from '@/components/shared/DashboardLayoutClient'

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

    // Fetch user's Gym details including the logo_url and banner_url
    const { data: gym } = await supabase
        .from('gyms')
        .select('name, logo_url, banner_url')
        .eq('owner_id', user.id)
        .single()

    const gymName = gym?.name || 'Gym Workspace'
    const ownerEmail = user.email || ''
    const logoUrl = gym?.logo_url || null
    const bannerUrl = gym?.banner_url || null

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <DashboardLayoutClient
            gymName={gymName}
            ownerEmail={ownerEmail}
            logoUrl={logoUrl}
            bannerUrl={bannerUrl}
            defaultOpen={defaultOpen}
        >
            {children}
        </DashboardLayoutClient>
    )
}