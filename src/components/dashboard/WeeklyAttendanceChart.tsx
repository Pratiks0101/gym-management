'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { CalendarDays, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

type DayAttendance = {
    day: string
    checkIns: number
}

type Props = {
    data?: DayAttendance[]
}

const defaultWeeklyData: DayAttendance[] = [
    { day: 'Mon', checkIns: 45 },
    { day: 'Tue', checkIns: 52 },
    { day: 'Wed', checkIns: 38 },
    { day: 'Thu', checkIns: 48 },
    { day: 'Fri', checkIns: 42 },
    { day: 'Sat', checkIns: 30 },
]

const chartConfig = {
    checkIns: {
        label: 'Check-ins',
        color: '#6366f1', // Indigo bar color
    },
}

export function WeeklyAttendanceChart({ data = defaultWeeklyData }: Props) {
    const weeklyTotal = data.reduce((sum, item) => sum + item.checkIns, 0)
    const avgDaily = Math.round(weeklyTotal / (data.length || 1))

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-indigo-500" />
                        Weekly Footfall Trend
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Daily attendance check-ins (Monday to Saturday)
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Avg: {avgDaily}/day
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <ChartContainer config={chartConfig} className="h-50 w-full">
                    <div className='h-50 w-full min-w-0'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                <Bar 
                                    dataKey="checkIns" 
                                    fill="#6366f1" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={28}
                                    />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}