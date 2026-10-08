'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, UserCheck, IndianRupee, Clock, Loader2 } from 'lucide-react'

type AttendanceRecord = {
    id: string
    created_at: string
    members?: { full_name: string }
}

type PaymentRecord = {
    id: string
    amount_paid: number
    payment_mode?: string
    created_at: string
    members?: { full_name: string }
}

export function InteractiveCalendarWidget({ gymId }: { gymId: string }) {
    const [mounted, setMounted] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [loading, setLoading] = useState(false)
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
    const [payments, setPayments] = useState<PaymentRecord[]>([])

    // 1. First mount logic
    useEffect(() => {
        setMounted(true)
    }, [])

    // 2. Fetch data logic with stable dependencies
    useEffect(() => {
        if (!gymId || !selectedDate) return

        const supabase = createClient()

        async function fetchDateDetails() {
            setLoading(true)

            const startOfDay = new Date(selectedDate)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(selectedDate)
            endOfDay.setHours(23, 59, 59, 999)

            const { data: attData } = await supabase
                .from('attendance')
                .select('id, created_at, members(full_name)')
                .eq('gym_id', gymId)
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .order('created_at', { ascending: false })

            const { data: payData } = await supabase
                .from('payments')
                .select('id, amount_paid, payment_mode, created_at, members(full_name)')
                .eq('gym_id', gymId)
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .order('created_at', { ascending: false })

            setAttendances((attData as any) || [])
            setPayments((payData as any) || [])
            setLoading(false)
        }

        fetchDateDetails()
    }, [selectedDate, gymId]) // Stable 2-item dependency array

    if (!mounted) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[400px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
        )
    }

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-500" />
                    Daily Operations Calendar
                </h2>
            </div>

            <div className="flex justify-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md"
                />
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Snapshot for {format(selectedDate, 'PPP')}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {attendances.length} Check-ins • ₹{totalCollected.toLocaleString('en-IN')} Revenue
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Loading date records...
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Check-ins ({attendances.length})
                        </h4>
                        {attendances.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">No attendance recorded on this date.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {attendances.map((att) => (
                                    <div key={att.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs flex items-center justify-between">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {att.members?.full_name || 'Member'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {format(new Date(att.created_at), 'hh:mm a')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Payments Received ({payments.length})
                        </h4>
                        {payments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">No payments collected on this date.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {payments.map((p) => (
                                    <div key={p.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                {p.members?.full_name || 'Member'}
                                            </p>
                                            {p.payment_mode && (
                                                <p className="text-[10px] text-slate-400 uppercase">{p.payment_mode}</p>
                                            )}
                                        </div>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            +₹{p.amount_paid}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}