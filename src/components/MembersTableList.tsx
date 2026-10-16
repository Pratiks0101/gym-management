'use client'

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, Search, X } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { getMemberStatus } from "@/lib/subscription"
import RenewMemberModal from "@/components/RenewMemberModal"
import ClearDueButton from "@/components/ClearDueButton"
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import EditMemberModal from "./EditMemberModal"
import { DeleteMemberButton } from "./DeleteMemberButton"

type MembersTableListProps = {
    initialMembers: any[]
    activePlans: any[]
}

export default function MembersTableList({ initialMembers, activePlans }: MembersTableListProps) {
    const router = useRouter()
    const [members, setMembers] = useState(initialMembers)
    const [selectedDuration, setSelectedDuration] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        setMembers(initialMembers)
    }, [initialMembers])

    // Pre-process members using useMemo for lightning-fast rendering
    const processedMembers = useMemo(() => {
        return members.map((member: any) => {
            const sortedSubs = [...(member.subscriptions || [])].sort(
                (a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
            )
            const latestSub = sortedSubs[0]
            const planName = latestSub?.membership_plans?.plan_name || 'N/A'
            const rawEndDate = latestSub?.end_date || member.valid_till
            const durationMonths = latestSub?.membership_plans?.duration_months
            const dueAmount = Number(latestSub?.due_amount || 0)

            return {
                ...member,
                latestSub,
                sortedSubs,
                planName,
                rawEndDate,
                durationMonths,
                dueAmount
            }
        })
    }, [members])

    // Instant Client-Side Filtering (Search + Duration)
    const filteredMembers = useMemo(() => {
        return processedMembers.filter((member: any) => {
            const nameMatch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
            const phoneMatch = member.phone?.includes(searchTerm)
            const matchesSearch = nameMatch || phoneMatch

            if (!matchesSearch) return false
            if (selectedDuration === 'all') return true

            return String(member.durationMonths) === selectedDuration
        })
    }, [processedMembers, searchTerm, selectedDuration])

    const availableDurations = useMemo(() => {
        const durations = activePlans
            .map((plan: any) => Number(plan.duration_months))
            .filter((d: number) => !isNaN(d) && d > 0)

        return Array.from(new Set(durations)).sort((a: number, b: number) => a - b)
    }, [activePlans])

    return (
        <div className="space-y-4">
            {/* Top Bar: Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Registered Members ({filteredMembers.length})
                </h2>

                {/* Search Box */}
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

            {/* Duration Filter Bar with justify-between layout */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
                <div className="flex items-center justify-between gap-1 w-full">
                    <button
                        onClick={() => setSelectedDuration('all')}
                        className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                            selectedDuration === 'all'
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        All Members
                    </button>

                    {availableDurations.map((duration) => (
                        <button
                            key={duration}
                            onClick={() => setSelectedDuration(String(duration))}
                            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                                selectedDuration === String(duration)
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            {duration} {duration === 1 ? 'Month' : 'Months'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Members Table with Fixed Solid Header */}
            {filteredMembers.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
                    {searchTerm ? (
                        <>No members matching &quot;<strong className="text-slate-700 dark:text-slate-300">{searchTerm}</strong>&quot;</>
                    ) : (
                        <>No members found for this plan duration filter.</>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-h-155 h-fit overflow-y-auto custom-scrollbar">
                    <Table>
                        {/* Fixed solid header color with no hover effect */}
                        <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                            <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent">
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
                                const endDate = member.rawEndDate  
                                    ? new Date(member.rawEndDate).toLocaleDateString('en-IN') 
                                    : 'N/A'
                                
                                const statusInfo = getMemberStatus(member.rawEndDate)

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
                                                <span className="truncate max-w-34 sm:max-w-none">{member.full_name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">
                                            {member.phone || 'N/A'}
                                        </TableCell>

                                        <TableCell className="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm">
                                            {member.planName}
                                        </TableCell>

                                        <TableCell className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                                            {endDate}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeColor}`}>
                                                    {statusInfo.badgeText}
                                                </span>

                                                {member.dueAmount > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/80">
                                                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                        Due: ₹{member.dueAmount}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {member.dueAmount > 0 && member.latestSub && (
                                                    <ClearDueButton 
                                                        subscriptionId={member.latestSub.id}
                                                        memberId={member.id}
                                                        memberName={member.full_name}
                                                        dueAmount={member.dueAmount}
                                                    />
                                                )}
                                                <RenewMemberModal member={member} plans={activePlans} />

                                                <EditMemberModal member={member} />

                                                <DeleteMemberButton 
                                                    memberId={member.id} 
                                                    memberName={member.full_name} 
                                                />
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