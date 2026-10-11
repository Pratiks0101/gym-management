// import { redirect } from 'next/navigation'

// export default function Home() {
//     redirect('/login')
// }

import Link from 'next/link'
import { Dumbbell, ArrowRight } from 'lucide-react'

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-6">
                <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Dumbbell className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Gym Management SaaS</h1>
                    <p className="text-sm text-slate-400">
                        Manage members, track live attendance, automated WhatsApp reminders, and real-time revenue analytics.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link
                        href="/login"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        Login to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/signup"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl transition border border-slate-700"
                    >
                        Create Gym Account
                    </Link>
                </div>
            </div>
        </main>
    )
}