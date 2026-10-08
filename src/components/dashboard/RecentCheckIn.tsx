'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { CheckCircle2, UserCheck, Clock } from 'lucide-react'

type CheckInLog = {
    id: string
    check_in_time: string
    members: {
        full_name: string
        phone: string
    } | null
}

export function RecentCheckIn({ gymId }: { gymId: string }) {
    const [logs, setLogs] = useState<CheckInLog[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = useCallback(async () => {
        if (!gymId) return

        const supabase = createClient()
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { data, error } = await supabase
            .from('attendance')
            .select('id, check_in_time, members(full_name, phone)')
            .eq('gym_id', gymId)
            .gte('check_in_time', startOfDay.toISOString())
            .order('check_in_time', { ascending: false })
            .limit(10)

        if (!error && data) {
            setLogs(data as unknown as CheckInLog[])
        }
        setLoading(false)
    }, [gymId])

    useEffect(() => {
        if (!gymId) return

        const supabase = createClient()

        // 1. Initial Data Fetch
        fetchLogs()

        // 2. Realtime Listener with Robust Channel Config
        const channel = supabase
            .channel(`recent-attendance-${gymId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'attendance',
                },
                (payload) => {
                    // Check gym_id manually in payload to prevent filter missing issue
                    if (payload.new && payload.new.gym_id === gymId) {
                        console.log('⚡ Check-in detected via Realtime:', payload)
                        fetchLogs()
                    }
                }
            )
            .subscribe((status) => {
                console.log('Supabase Channel Status:', status)
            })

        // 3. Fallback Polling (Every 5 Seconds) - Guarantees Auto-Refresh
        const interval = setInterval(() => {
            fetchLogs()
        }, 5000)

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [gymId, fetchLogs])

    return (
        <div className="space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" /> Recent Check-ins Today
            </h2>

            {loading ? (
                <div className="text-xs text-slate-400 py-6 text-center animate-pulse">
                    Loading live logs...
                </div>
            ) : logs.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Listening for live scans... No check-ins yet today.
                </div>
            ) : (
                <div className="space-y-2 max-h-90 overflow-y-auto pr-1">
                    {logs.map((log) => (
                        <div 
                            key={log.id} 
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all duration-300"
                        >
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                        {log.members?.full_name || 'Member'}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {log.members?.phone || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(log.check_in_time), 'hh:mm a')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}