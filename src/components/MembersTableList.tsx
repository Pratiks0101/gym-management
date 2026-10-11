'use client'

import { useState, useMemo } from "react"
import Image from "next/image"
import { AlertCircle, Trash2, Search, X } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { getMemberStatus } from "@/lib/subscription"
import RenewMemberModal from "@/components/RenewMemberModal"
import ClearDueButton from "@/components/ClearDueButton"
import { deleteMembers } from "@/app/actions/members"
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type MembersTableListProps = {
    initialMembers: any[]
    activePlans: any[]
}

export default function MembersTableList({ initialMembers, activePlans }: MembersTableListProps) {
    const [selectedDuration, setSelectedDuration] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // 🟢 Dynamic Durations List Extract karo
    const availableDurations = useMemo(() => {
        const durations = activePlans
            .map((plan: any) => Number(plan.duration_months))
            .filter((d: number) => !isNaN(d) && d > 0)

        // Unique durations extract and sort numerically ascending (e.g. 1, 2, 3, 6, 12)
        const unique = Array.from(new Set(durations)).sort((a: number, b: number) => a - b)
        return unique
    }, [activePlans])

    // 🟢 Combined Dynamic Filter Logic: Search + Dynamic Duration
    const filteredMembers = initialMembers.filter((member: any) => {
        // 1. Search Filter (Name or Phone)
        const nameMatch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const phoneMatch = member.phone?.includes(searchTerm)
        const matchesSearch = nameMatch || phoneMatch

        if (!matchesSearch) return false

        // 2. Dynamic Duration Filter
        if (selectedDuration === 'all') return true

        const sortedSubs = [...(member.subscriptions || [])].sort(
            (a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
        )
        const latestSub = sortedSubs[0]
        const durationMonths = latestSub?.membership_plans?.duration_months

        return String(durationMonths) === selectedDuration
    })

    return (
        <div className="space-y-4">
            {/* Top Bar: Header + Search + Dynamic Filter Buttons */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Registered Members ({filteredMembers.length})
                    </h2>

                    {/* 🔍 Search Box */}
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-xs"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 🟢 Dynamic Duration Filter Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto self-start sm:self-end">
                    <button
                        onClick={() => setSelectedDuration('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                            selectedDuration === 'all'
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        }`}
                    >
                        All Members
                    </button>

                    {availableDurations.map((duration) => (
                        <button
                            key={duration}
                            onClick={() => setSelectedDuration(String(duration))}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                                selectedDuration === String(duration)
                                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                            {duration} {duration === 1 ? 'Month' : 'Months'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Members Table */}
            {filteredMembers.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
                    {searchTerm ? (
                        <>No members matching &quot;<strong className="text-slate-700 dark:text-slate-300">{searchTerm}</strong>&quot;</>
                    ) : (
                        <>No members found for this plan duration filter.</>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Member</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Phone</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Active Plan</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Valid Till</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredMembers.map((member: any) => {
                                const sortedSubs = [...(member.subscriptions || [])].sort(
                                    (a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
                                )
                                const latestSub = sortedSubs[0]
                                const planName = latestSub?.membership_plans?.plan_name || 'N/A'
                                const rawEndDate = latestSub?.end_date || member.valid_till
                                const endDate = rawEndDate  
                                    ? new Date(rawEndDate).toLocaleDateString('en-IN') 
                                    : 'N/A'
                                
                                const statusInfo = getMemberStatus(rawEndDate)
                                const dueAmount = Number(latestSub?.due_amount || 0)

                                return (
                                    <TableRow 
                                        key={member.id} 
                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <TableCell className="font-semibold text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                {member.photo_url ? (
                                                    <Image 
                                                        src={member.photo_url}
                                                        alt={member.full_name || 'Member'}
                                                        width={36}
                                                        height={36}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                                                        {getInitials(member.full_name)}
                                                    </div>
                                                )}
                                                <span className="truncate max-w-[130px] sm:max-w-none">{member.full_name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">
                                            {member.phone || 'N/A'}
                                        </TableCell>

                                        <TableCell className="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm">
                                            {planName}
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                                            {endDate}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeColor}`}>
                                                    {statusInfo.badgeText}
                                                </span>

                                                {dueAmount > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/80">
                                                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                        Due: ₹{dueAmount}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {dueAmount > 0 && latestSub && (
                                                    <ClearDueButton 
                                                        subscriptionId={latestSub.id}
                                                        memberId={member.id}
                                                        memberName={member.full_name}
                                                        dueAmount={dueAmount}
                                                    />
                                                )}
                                                <RenewMemberModal member={member} plans={activePlans} />

                                                <form action={deleteMembers.bind(null, member.id)}>
                                                    <button 
                                                        type="submit"
                                                        title="Delete Member"
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}