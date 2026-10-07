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

// 🗓 Deterministic Date Formatter (Prevents Mismatch)
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <UserPlus className="w-3 h-3" /> Registration
                    </span>
                )
            case 'renewal':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <RotateCw className="w-3 h-3" /> Renewal
                    </span>
                )
            case 'due_clear':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Due Clear
                    </span>
                )
            default:
                return (
                    <span className="capitalize text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full font-medium border">
                        {type?.replace('_', ' ')}
                    </span>
                )
        }
    }

    const getMethodBadge = (method: string) => {
        const m = method?.toLowerCase()
        if (m === 'upi') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" /> UPI
                </span>
            )
        }
        if (m === 'cash') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" /> CASH
                </span>
            )
        }
        if (m === 'card') {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" /> CARD
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" /> {method}
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
                <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 w-full sm:w-auto justify-between sm:justify-start">
                    {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                                timeRange === range
                                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                            }`}
                        >
                            {rangeLabels[range]}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📱 2x2 Grid on Mobile, 4-Cols on Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Total ({rangeLabels[timeRange]})
                        </p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">UPI / Digital</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-indigo-600 mt-1">₹{upiRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash Received</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-700 mt-1">₹{cashRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Card Payment</p>
                        <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 mt-1">₹{cardRevenue.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            </div>

            {/* 📱 Mobile Card View with Jump Fix */}
            <div className="block sm:hidden space-y-3 min-h-80 transition-all duration-200">
                {filteredPayments.length === 0 ? (
                    <div className="bg-white p-6 text-center text-gray-500 rounded-xl border border-gray-200 text-sm flex items-center justify-center min-h-40">
                        No payment logs found for {rangeLabels[timeRange].toLowerCase()}.
                    </div>
                ) : (
                    filteredPayments.map((p: any) => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{p.members?.full_name || 'N/A'}</h4>
                                    <p className="text-xs text-gray-500">{p.members?.phone}</p>
                                </div>
                                <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 text-base">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    +₹{Number(p.amount_paid).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                                <div className="flex gap-1.5 items-center">
                                    {getTypeBadge(p.payment_type)}
                                    {getMethodBadge(p.payment_method)}
                                </div>
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {formatDate(p.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 💻 Desktop & Tablet Fixed Table View */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-gray-50/80 border-b border-gray-200">
                            <TableHead className="w-[28%] font-semibold text-gray-700">Date & Time</TableHead>
                            <TableHead className="w-[26%] font-semibold text-gray-700">Member</TableHead>
                            <TableHead className="w-[22%] font-semibold text-gray-700">Type</TableHead>
                            <TableHead className="w-[12%] font-semibold text-gray-700">Method</TableHead>
                            <TableHead className="w-[12%] text-right font-semibold text-gray-700">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                    No payment logs found for {rangeLabels[timeRange].toLowerCase()}.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((p: any) => (
                                <TableRow key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                    <TableCell className="text-xs text-gray-600 font-medium">
                                        {formatDate(p.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-gray-900 text-sm truncate">
                                            {p.members?.full_name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">
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
                                        <span className="inline-flex items-center justify-end gap-0.5 font-bold text-emerald-600 text-sm sm:text-base">
                                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
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