import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowUpRight } from 'lucide-react'

type ExpiringProps = {
    expiringSoon: any[]
}

export function ExpiringSubscriptionsWidget({ expiringSoon }: ExpiringProps) {
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
                    {expiringSoon.map((sub: any) => (
                        <div key={sub.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {sub.members?.photo_url ? (
                                    <Image 
                                        src={sub.members.photo_url} 
                                        alt={sub.members.full_name} 
                                        width={36} 
                                        height={36} 
                                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                                        {sub.members?.full_name?.slice(0, 2) || 'MB'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                        {sub.members?.full_name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {sub.membership_plans?.plan_name || 'Standard Plan'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                    Expires: {new Date(sub.end_date).toLocaleDateString('en-IN')}
                                </p>
                                <Link 
                                    href="/dashboard/members" 
                                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center justify-end gap-0.5 mt-0.5"
                                >
                                    Renew Now <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}