'use client'

import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card"
import { 
    ChartContainer, 
    ChartTooltip, 
    ChartTooltipContent 
} from "@/components/ui/chart"
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    ResponsiveContainer 
} from "recharts"
import { IndianRupee, TrendingUp } from "lucide-react"

type RevenueData = {
    month: string
    revenue: number
}

type DashboardChartsProps = {
    data: RevenueData[]
}

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    const chartData = Array.isArray(data) ? data : []
    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-emerald-500" />
                        Revenue Analytics
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Monthly earnings and collection overview
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Growth
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {chartData.length === 0 ? (
                    <div className="h-65 w-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No revenue data available yet.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-65 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    className="text-[11px] text-slate-400"
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    className="text-[11px] text-slate-400"
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#10b981" 
                                    strokeWidth={2.5} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}