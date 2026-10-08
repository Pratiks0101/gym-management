import Link from 'next/link'
import { Calendar } from 'lucide-react'

type TransactionsProps = {
    recentPayments: any[]
}

export function RecentTransactionsWidget({ recentPayments }: TransactionsProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Recent Transactions
                </h2>
                <Link href="/dashboard/payments" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                    View All
                </Link>
            </div>

            {recentPayments && recentPayments.length > 0 ? (
                <div className="space-y-3">
                    {recentPayments.map((p: any) => (
                        <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-xs text-slate-900 dark:text-white">
                                    {p.members?.full_name || 'Gym Member'}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {new Date(p.created_at).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    +₹{p.amount_paid}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                    No payment records yet.
                </p>
            )}
        </div>
    )
}