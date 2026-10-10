'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, MessageCircle, RefreshCw } from 'lucide-react'
import { generateMembershipRenewalReminderLink } from '@/lib/whatsapp'

type ExpiringProps = {
    expiringSoon: any[]
    gymName?: string
}

export function ExpiringSubscriptionsWidget({ expiringSoon, gymName = 'Test Gym' }: ExpiringProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Subscriptions Expiring Soon (Next 7 Days)
                </h2>
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    {expiringSoon.length} Members
                </span>
            </div>

            {expiringSoon.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                    🎉 No subscriptions expiring in the next 7 days.
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expiringSoon.map((sub: any) => {
                        // Support both direct mapped objects & nested member objects
                        const fullName = sub.full_name || sub.members?.full_name || 'Member'
                        const phone = sub.phone || sub.members?.phone || ''
                        const photoUrl = sub.members?.photo_url
                        const planName = sub.plan_name || sub.membership_plans?.plan_name || sub.plans?.name || 'Standard Plan'
                        const formattedDate = new Date(sub.end_date).toLocaleDateString('en-IN')

                        // Dynamic wa.me URL
                        const whatsappUrl = generateMembershipRenewalReminderLink({
                            phone: phone,
                            memberName: fullName,
                            planName: planName,
                            expiryDate: formattedDate,
                            gymName: gymName
                        })

                        return (
                            <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {photoUrl ? (
                                        <Image 
                                            src={photoUrl} 
                                            alt={fullName} 
                                            width={36} 
                                            height={36} 
                                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            {fullName.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {fullName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {planName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                            Expires: {formattedDate}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {/* Remind via WhatsApp Button */}
                                        <a 
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition"
                                            title="Send WhatsApp Reminder"
                                        >
                                            Remind <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-transparent" />

                                        </a>

                                        {/* Renew Subscription Link Button */}
                                        <Link 
                                            href={`/dashboard/members?search=${encodeURIComponent(phone || fullName)}`}
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition"
                                            title="Renew Member Subscription"
                                        >
                                            Renew <RefreshCw className="w-3.5 h-3.5" />

                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}