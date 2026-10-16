'use client'

import { useState, useMemo } from "react"
import { processManualCheckIn } from "@/app/actions/attendance"
import { RecentCheckIn } from "@/components/dashboard/RecentCheckIn"
import { 
    QrCode,
    Search,
    AlertCircle,
    CheckCircle2,
    Monitor,
    X
} from "lucide-react"
import Link from "next/link"

type MemberItem = {
    id: string
    full_name: string
    phone: string
    status: string
}

type Props = {
    gymId: string
    initialMembers: MemberItem[]
    initialCheckedIn: string[]
    initialLogs: any[]
}

export function AttendanceClientView({ gymId, initialMembers, initialCheckedIn, initialLogs }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [todayCheckedInIds, setTodayCheckedInIds] = useState<Set<string>>(new Set(initialCheckedIn))
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'warning'; text: string} | null>(null)

    // Instant Client-Side Filtering using useMemo (Zero Delay!)
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase().trim()
        return initialMembers.filter(m => 
            m.full_name?.toLowerCase().includes(query) || 
            m.phone?.includes(query)
        ).slice(0, 10) // Top 10 matches show karenge
    }, [searchQuery, initialMembers])

    // Manual Check-In Execution
    const handleManualCheckIn = async (memberId: string) => {
        if (!gymId) return
        setLoading(true)
        setStatusMessage(null)

        const res = await processManualCheckIn({
            gymId,
            memberId,
        })

        if (res.success) {
            setStatusMessage({ type: 'success', text: res.message })
            // Instant local state update for attendance badge
            setTodayCheckedInIds(prev => new Set(prev).add(memberId))
        } else {
            setStatusMessage({
                type: res.message.includes('already') ? 'warning' : 'error',
                text: res.message,
            })
        }

        setLoading(false)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-indigo-600" /> Attendance Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Live check-ins and front-desk manual search</p>
                </div>
                
                <Link
                    href="/dashboard/attendance/display"
                    target="_blank"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                    <Monitor className="w-4 h-4" /> Launch Desk QR Screen
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Manual Search (7 Cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
                    <h2 className="font-bold text-slate-900 dark:text-white text-sm">Manual Check-In Search</h2>
                    
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search member by Name or Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status Alert Banner */}
                    {statusMessage && (
                        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900' :
                            statusMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' :
                            'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                        }`}>
                            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {statusMessage.type !== 'success' && <AlertCircle className="w-4 h-4 shrink-0" />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    {/* Search Results List */}
                    {searchQuery.trim() && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">
                                    No members found matching &quot;{searchQuery}&quot;
                                </div>
                            ) : (
                                searchResults.map((m) => {
                                    const isCheckedIn = todayCheckedInIds.has(m.id)
                                    return (
                                        <div key={m.id} className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.full_name}</p>
                                                <p className="text-[10px] text-slate-400">{m.phone}</p>
                                            </div>
                                            {isCheckedIn ? (
                                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                                                </span>
                                            ) : (
                                                <button
                                                    disabled={loading}
                                                    onClick={() => handleManualCheckIn(m.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    Mark Present
                                                </button>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Live Activity Feed Component (5 Cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                    <RecentCheckIn gymId={gymId} initialLogs={initialLogs} />
                </div>
            </div>
        </div>
    )
}