'use client'

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { 
    IndianRupee, 
    ArrowUpRight, 
    CreditCard, 
    QrCode, 
    Banknote, 
    UserPlus, 
    RotateCw, 
    CheckCircle2
} from "lucide-react"

type TimeRange = 'today' | 'week' | 'month' | 'all'

type PaymentSortProps = {
    initialPayments: any[]
}

// Deterministic Date Formatter
function formatDate(dateString: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    
    const day = date.getDate()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12
    hours = hours ? hours : 12
    
    return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`
}

export default function PaymentSort({ initialPayments }: PaymentSortProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('month')

    const filteredPayments = initialPayments.filter((p: any) => {
        if (timeRange === 'all') return true

        const paymentDate = new Date(p.created_at)
        const now = new Date()

        if (timeRange === 'today') {
            return paymentDate.toDateString() === now.toDateString()
        }

        if (timeRange === 'week') {
            const startOfWeek = new Date(now)
            const day = now.getDay()
            const diff = now.getDate() - day + (day === 0 ? -6 : 1)
            startOfWeek.setDate(diff)
            startOfWeek.setHours(0, 0, 0, 0)
            return paymentDate >= startOfWeek
        }

        if (timeRange === 'month') {
            return (
                paymentDate.getMonth() === now.getMonth() &&
                paymentDate.getFullYear() === now.getFullYear()
            )
        }

        return true
    })

    const totalRevenue = filteredPayments.reduce((acc: number, p: any) => acc + Number(p.amount_paid || 0), 0)
    const upiRevenue = filteredPayments
        .filter((p: any) => p.payment_method?.toLowerCase() === 'upi')
        .reduce((acc: number, p: any) => acc + Number(p.amount_paid || 0), 0)
    const cashRevenue = filteredPayments
        .filter((p: any) => p.payment_method?.toLowerCase() === 'cash')
        .reduce((acc: number, p: any) => acc + Number(p.amount_paid || 0), 0)
    const cardRevenue = filteredPayments
        .filter((p: any) => p.payment_method?.toLowerCase() === 'card')
        .reduce((acc: number, p: any) => acc + Number(p.amount_paid || 0), 0)

    const getTypeBadge = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'registration':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <UserPlus className="w-3 h-3" /> Registration
                    </span>
                )
            case 'renewal':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <RotateCw className="w-3 h-3" /> Renewal
                    </span>
                )
            case 'due_clear':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Due Clear
                    </span>
                )
            default:
                return (
                    <span className="capitalize text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium border border-slate-200 dark:border-slate-700">
                        {type?.replace('_', ' ')}
                    </span>
                )
        }
    }

    const getMethodBadge = (method: string) => {
        const m = method?.toLowerCase()
        if (m === 'upi') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> UPI
                </span>
            )
        }
        if (m === 'cash') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> CASH
                </span>
            )
        }
        if (m === 'card') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> CARD
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 uppercase">
                <CreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {method}
            </span>
        )
    }

    const rangeLabels: Record<TimeRange, string> = {
        today: "Today",
        week: "This Week",
        month: "This Month",
        all: "All Time"
    }

    return (
        <div className="space-y-5">
            {/* Filter Pills */}
            <div className="flex justify-start sm:justify-end">
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
                    {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                                timeRange === range
                                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold border border-slate-200/50 dark:border-slate-700"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            {rangeLabels[range]}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total ({rangeLabels[timeRange]})
                        </p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                {/* UPI Revenue */}
                <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            UPI / Digital
                        </p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            ₹{upiRevenue.toLocaleString('en-IN')}
                        </h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                {/* Cash Revenue */}
                <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Cash Received
                        </p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                            ₹{cashRevenue.toLocaleString('en-IN')}
                        </h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                {/* Card Revenue */}
                <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Card Payment
                        </p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                            ₹{cardRevenue.toLocaleString('en-IN')}
                        </h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/40">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 min-h-80 transition-all duration-200">
                {filteredPayments.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 text-sm flex items-center justify-center min-h-40">
                        No payment logs found for {rangeLabels[timeRange].toLowerCase()}.
                    </div>
                ) : (
                    filteredPayments.map((p: any) => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                        {p.members?.full_name || 'N/A'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.members?.phone}</p>
                                </div>
                                <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                    +₹{Number(p.amount_paid).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                <div className="flex gap-1.5 items-center">
                                    {getTypeBadge(p.payment_type)}
                                    {getMethodBadge(p.payment_method)}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    {formatDate(p.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-155 overflow-y-auto custom-scrollbar">
                <Table className="w-full table-fixed">
                    <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                        {/* <TableRow className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60"> */}
                        <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent">
                            <TableHead className="w-[28%] font-semibold text-slate-700 dark:text-slate-300">Date & Time</TableHead>
                            <TableHead className="w-[26%] font-semibold text-slate-700 dark:text-slate-300">Member</TableHead>
                            <TableHead className="w-[22%] font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                            <TableHead className="w-[12%] font-semibold text-slate-700 dark:text-slate-300">Method</TableHead>
                            <TableHead className="w-[12%] text-right font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No payment logs found for {rangeLabels[timeRange].toLowerCase()}.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((p: any) => (
                                <TableRow key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        {formatDate(p.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                            {p.members?.full_name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {p.members?.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getTypeBadge(p.payment_type)}
                                    </TableCell>
                                    <TableCell>
                                        {getMethodBadge(p.payment_method)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center justify-end gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                                            <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                            +₹{Number(p.amount_paid).toLocaleString('en-IN')}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}