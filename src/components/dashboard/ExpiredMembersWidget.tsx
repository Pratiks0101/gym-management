'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { AlertTriangle, MessageCircle, Search, X } from 'lucide-react'
import { generateMembershipRenewalReminderLink } from '@/lib/whatsapp'
import RenewMemberModal from '../RenewMemberModal'

type ExpiredProps = {
    expiredMembers: any[]
    gymName?: string
    plans: any[]
}

export function ExpiredMembersWidget({ expiredMembers, gymName = 'Test Gym', plans }: ExpiredProps) {

    const [searchQuery, setSearchQuery] = useState('')

    // Check if items are more than 5 (i.e., container will become scrollable)
    const isScrollable = expiredMembers.length > 5

    // Filter items based on search query for name or phone
    const filteredExpired = useMemo(() =>{
        if(!searchQuery.trim()) return expiredMembers
        const q = searchQuery.toLowerCase()
        return expiredMembers.filter((sub: any) => {
            const fullName = sub.full_name || sub.members?.full_name || ''
            const phone = sub.phone || sub.members?.phone || ''
            return fullName.toLowerCase().includes(q) || phone.includes(q)
        })
    }, [searchQuery, expiredMembers])

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>Expired Memberships</span>
                </h2>
                <span className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 font-semibold px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 shrink-0">
                    {expiredMembers.length} Expired
                </span>
            </div>

            {expiredMembers.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                    ✅ No expired memberships found.
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Render Search Bar ONLY if items exceed 5 (scrollable condition) */}
                    {isScrollable && (
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                            />
                            {/* Clear search button */}
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Scrollbar Container */}
                    <div className="max-h-87.5 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Fallback if search returns no matches */}
                        {filteredExpired.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No matching members found.</p>
                        ) : (
                            /* Map through filtered items instead of raw expiredMembers */
                            filteredExpired.map((sub: any) => {
                                const fullName = sub.full_name || sub.members?.full_name || 'Member'
                                const phone = sub.phone || sub.members?.phone || ''
                                const photoUrl = sub.members?.photo_url
                                const planName = sub.plan_name || sub.membership_plans?.plan_name || sub.plans?.name || 'Standard Plan'
                                const formattedDate = new Date(sub.end_date).toLocaleDateString('en-IN')

                                const whatsappUrl = generateMembershipRenewalReminderLink({
                                    phone: phone,
                                    memberName: fullName,
                                    planName: planName,
                                    expiryDate: formattedDate,
                                    gymName: gymName
                                })

                                const memberObj = sub.members || {
                                    id: sub.member_id || sub.id,
                                    full_name: fullName,
                                    phone: phone
                                }

                                return (
                                    <div key={sub.id} className="py-3 flex items-center justify-between gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                            {photoUrl ? (
                                                <Image 
                                                    src={photoUrl} 
                                                    alt={fullName} 
                                                    width={36} 
                                                    height={36} 
                                                    className="w-9 h-9 rounded-full object-cover border border-rose-200 dark:border-rose-900 shrink-0" 
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/60 font-bold text-xs flex items-center justify-center text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                                                    {fullName.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                    {fullName}
                                                </p>
                                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">
                                                    Expired: {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* WhatsApp Remind */}
                                                <a 
                                                    href={whatsappUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-400 text-xs font-semibold px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition"
                                                    title="Send Renewal Link"
                                                >
                                                    <span className="hidden sm:inline">Remind</span>
                                                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-transparent" />
                                                </a>

                                                {/* Renew Modal */}
                                                <RenewMemberModal 
                                                    member={memberObj} 
                                                    plans={plans} 
                                                    showText={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}