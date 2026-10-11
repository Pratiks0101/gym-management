'use client'

import Link from 'next/link'
import { 
    QrCode, 
    ArrowUpRight, 
    CheckCircle2, 
    UserCheck 
} from 'lucide-react'
import { 
    RadialBarChart, 
    RadialBar, 
    PolarAngleAxis, 
    ResponsiveContainer 
} from 'recharts'

type Props = {
    todayCount?: number
    expectedCount?: number
}

export function TodayAttendanceWidget({ todayCount = 0, expectedCount = 10 }: Props) {
    const validExpected = expectedCount > 0 ? expectedCount : 1
    const percentage = Math.min(Math.round((todayCount / validExpected) * 100), 100)

    const chartData = [
        {
            name: 'Attendance',
            value: todayCount,
            fill: '#4f46e5',
        },
    ]

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-xl">
                        <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Today&apos;s Attendance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Live check-ins summary</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/attendance"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                    Scanner <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Radial Chart & Center Stats */}
            <div className="my-2 relative h-40 w-full min-w-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="90%"
                        barSize={10}
                        data={chartData}
                        startAngle={225}
                        endAngle={-45}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, validExpected]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            background={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                            dataKey="value"
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                        {todayCount}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        / {expectedCount} Registered
                    </span>
                    <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                        {percentage}% Turnout
                    </span>
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>QR Scanner Active</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{todayCount} Checked-in</span>
                </div>
            </div>
        </div>
    )
}