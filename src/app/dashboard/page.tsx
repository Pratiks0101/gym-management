import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Verify auth session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch current user's gym details
    const { data: gym } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    return (
        <div className="p-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
            <div>
            <h1 className="text-3xl font-bold">Welcome, {gym?.name || 'Gym Owner'}!</h1>
            <p className="text-muted-foreground text-sm">Owner Email: {user.email}</p>
            </div>
            
            <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
            }}>
            <Button variant="outline" type="submit">Sign Out</Button>
            </form>
        </div>

        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Dashboard Setup Success 🎉</h2>
            <p className="text-muted-foreground">
            Tenant Scoping, Authentication, aur Supabase Database integration bilkul sahi kaam kar rahe hain.
            </p>
        </div>
        </div>
    )
    }