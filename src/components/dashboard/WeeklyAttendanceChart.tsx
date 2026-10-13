'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { CalendarDays, Sun, Moon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

type DayAttendance = {
    day: string
    morning?: number
    evening?: number
    total?: number
    count?: number
}

type Props = {
    data?: DayAttendance[]
}

const defaultWeeklyData: DayAttendance[] = [
    { day: 'Mon', morning: 25, evening: 20, total: 45 },
    { day: 'Tue', morning: 30, evening: 22, total: 52 },
    { day: 'Wed', morning: 18, evening: 20, total: 38 },
    { day: 'Thu', morning: 22, evening: 26, total: 48 },
    { day: 'Fri', morning: 20, evening: 22, total: 42 },
    { day: 'Sat', morning: 15, evening: 15, total: 30 },
    { day: 'Sun', morning: 10, evening: 8, total: 18 },
]

const chartConfig = {
    morning: {
        label: 'Morning (Before 12 PM)',
        color: '#f59e0b', // Amber / Gold color
    },
    evening: {
        label: 'Evening (After 12 PM)',
        color: '#6366f1', // Indigo / Purple color
    },
}

export function WeeklyAttendanceChart({ data = defaultWeeklyData }: Props) {
    // Normalize Data for Morning vs Evening Stacked Bars
    const normalizedData = data.map(item => {
        const morning = Number(item.morning ?? Math.round((item.count || item.total || 0) / 2))
        const evening = Number(item.evening ?? Math.floor((item.count || item.total || 0) / 2))
        return {
            day: item.day,
            morning,
            evening,
            total: morning + evening
        }
    })

    const weeklyTotal = normalizedData.reduce((sum, item) => sum + item.total, 0)
    const validLength = normalizedData.length > 0 ? normalizedData.length : 1
    const avgDaily = isNaN(weeklyTotal) ? 0 : Math.round(weeklyTotal / validLength)

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-indigo-500" />
                        Weekly Footfall Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Morning vs Evening footfall (Rolling 7 Days)
                    </CardDescription>
                </div>

                {/* Sub-Header Indicators */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Morning
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        Evening
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-56 w-full">
                    <div className='h-56 w-full min-w-0'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={normalizedData} 
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                barGap={4}
                            >
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    className="text-[11px] font-medium text-slate-400"
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    className="text-[11px] text-slate-400"
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                                
                                {/* Morning Bar (Amber Color) */}
                                <Bar 
                                    dataKey="morning" 
                                    radius={[4, 4, 0, 0]}
                                    fill="#f59e0b" 
                                    barSize={14}
                                />
                                
                                {/* Evening Bar (Indigo Color) */}
                                <Bar 
                                    dataKey="evening" 
                                    fill="#6366f1" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={14}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Total Week Attendance: <strong className="text-slate-800 dark:text-slate-200">{weeklyTotal}</strong></span>
                    <span>Avg: <strong className="text-indigo-600 dark:text-indigo-400">{avgDaily}</strong> / day</span>
                </div>
            </CardContent>
        </Card>
    )
}