import Link from "next/link"
import { QrCode, ArrowUpRight, CheckCircle2 } from "lucide-react"

type Props = {
    todayCount?: number
    expectedCount?: number
}

export function TodayAttendanceWidget({ todayCount = 0, expectedCount = 100 }: Props) {
    const percentage = Math.min(Math.round((todayCount / expectedCount) * 100), 100)

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-xl">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Today&apos;s Attendance</h3>
                        <p className="text-xs text-slate-500">Live check-ins summary</p>
                    </div>
                </div>
                <Link 
                    href="/dashboard/attendance" 
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-0.5"
                >
                    Scanner <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{todayCount}</span>
                <span className="text-xs font-medium text-slate-500">/ {expectedCount} Check-ins Expected</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>QR Scanner logic ready for integration</span>
            </div>
        </div>
    )
}