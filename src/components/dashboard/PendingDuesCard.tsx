// 'use client'

// import { useState } from 'react'
// import Image from 'next/image'
// import { useRouter } from 'next/navigation'
// import { AlertCircle, MessageCircle, X, Loader2 } from 'lucide-react'
// import { generatePendingDueReminderLink } from '@/lib/whatsapp'
// import { clearMemberDue } from '@/app/actions/members'

// type PendingDueItem = {
//     id: string // subscription_id
//     due_amount: number
//     plan_name?: string
//     members?: {
//         id: string
//         full_name: string
//         phone: string
//         photo_url?: string
//     } | null
//     full_name?: string
//     phone?: string
// }

// type Props = {
//     pendingDues: PendingDueItem[]
//     gymName?: string
// }

// export function PendingDuesCard({ pendingDues, gymName = 'Gym' }: Props) {
//     const router = useRouter()
//     const [selectedItem, setSelectedItem] = useState<PendingDueItem | null>(null)
//     const [paymentMethod, setPaymentMethod] = useState<string>('UPI')
//     const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

//     // Modal Confirmation Handler
//     const handleConfirmPayment = async () => {
//         if (!selectedItem) return

//         const memberId = selectedItem.members?.id
//         const subscriptionId = selectedItem.id
//         const amountPaid = selectedItem.due_amount

//         if(!subscriptionId || !memberId) {
//             alert("Missing subscription or member ID context.")
//             return
//         }

//         setIsSubmitting(true)

//         try {
//             const formData = new FormData()
//             formData.append('subscription_id', subscriptionId)
//             formData.append('member_id', memberId)
//             formData.append('amount_paid', String(amountPaid))
//             formData.append('payment_method', paymentMethod)

//             const res = await clearMemberDue(formData)
//             if (res?.success) {
//                 await router.refresh() // Soft refresh dashboard data instantly
//                 setSelectedItem(null)
//             } else {
//                 alert("Failed to clear due amount.")
//             }
//         } catch (err: any) {
//             alert(err.message || "Failed to clear due amount.")
//         } finally {
//             setIsSubmitting(false)
//         }
//     }

//     const totalDueSum = pendingDues.reduce((sum, item) => sum + Number(item.due_amount || 0), 0)

//     return (
//         <>
//             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
//                     <div className="flex items-center gap-2">
//                         <AlertCircle className="w-5 h-5 text-rose-500" />
//                         <div>
//                             <h2 className="font-bold text-slate-900 dark:text-white text-base">
//                                 Pending Member Dues
//                             </h2>
//                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                                 Total Unpaid Amount:{' '}
//                                 <span className="font-bold text-rose-600 dark:text-rose-400">
//                                     ₹{totalDueSum}
//                                 </span>
//                             </p>
//                         </div>
//                     </div>
//                     <span className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 font-semibold px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
//                         {pendingDues.length} Pending
//                     </span>
//                 </div>

//                 {/* Empty State */}
//                 {pendingDues.length === 0 ? (
//                     <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
//                         🎉 All clear! No pending dues found.
//                     </div>
//                 ) : (
//                     <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto pr-1">
//                         {pendingDues.map((item) => {
//                             const fullName = item.full_name || item.members?.full_name || 'Member'
//                             const phone = item.phone || item.members?.phone || ''
//                             const photoUrl = item.members?.photo_url
//                             const planName = item.plan_name || 'Standard Plan'
//                             const dueAmount = item.due_amount

//                             const whatsappUrl = generatePendingDueReminderLink({
//                                 phone: phone,
//                                 memberName: fullName,
//                                 dueAmount: dueAmount,
//                                 gymName: gymName,
//                             })

//                             return (
//                                 <div key={item.id} className="py-3 flex items-center justify-between gap-3">
//                                     <div className="flex items-center gap-3">
//                                         {photoUrl ? (
//                                             <Image
//                                                 src={photoUrl}
//                                                 alt={fullName}
//                                                 width={36}
//                                                 height={36}
//                                                 className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
//                                             />
//                                         ) : (
//                                             <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
//                                                 {fullName.slice(0, 2).toUpperCase()}
//                                             </div>
//                                         )}
//                                         <div>
//                                             <p className="font-semibold text-sm text-slate-900 dark:text-white">
//                                                 {fullName}
//                                             </p>
//                                             <p className="text-xs text-slate-500 dark:text-slate-400">
//                                                 {planName}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <div className="text-right">
//                                             <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
//                                                 Due: ₹{dueAmount}
//                                             </p>
//                                         </div>

//                                         <div className="flex items-center gap-2">
//                                             <a
//                                                 href={whatsappUrl}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition"
//                                                 title="Send WhatsApp Payment Reminder"
//                                             >
//                                                 Remind <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-transparent" />
//                                             </a>

//                                             <button
//                                                 onClick={() => setSelectedItem(item)}
//                                                 className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-500/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400 dark:border-amber-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
//                                             >
//                                                 Pay Due
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )
//                         })}
//                     </div>
//                 )}
//             </div>

//             {/* Clear Due Modal */}
//             {selectedItem && (
//                 <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
//                     <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
//                         <div className="p-6 pb-2 flex items-start justify-between">
//                             <div>
//                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">
//                                     Clear Pending Due
//                                 </h3>
//                                 <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
//                                     Are you receiving the pending due payment of{' '}
//                                     <span className="font-bold text-slate-900 dark:text-white">
//                                         ₹{selectedItem.due_amount}
//                                     </span>{' '}
//                                     from{' '}
//                                     <span className="font-bold text-slate-900 dark:text-white">
//                                         {selectedItem.full_name || selectedItem.members?.full_name}
//                                     </span>
//                                     ?
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={() => !isSubmitting && setSelectedItem(null)}
//                                 disabled={isSubmitting}
//                                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="p-6 pt-3 space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
//                                     Payment Method
//                                 </label>
//                                 <select
//                                     value={paymentMethod}
//                                     onChange={(e) => setPaymentMethod(e.target.value)}
//                                     disabled={isSubmitting}
//                                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
//                                 >
//                                     <option value="UPI">UPI</option>
//                                     <option value="Cash">Cash</option>
//                                     <option value="Card">Card</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
//                             <button
//                                 onClick={() => setSelectedItem(null)}
//                                 disabled={isSubmitting}
//                                 className="w-1/2 sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleConfirmPayment}
//                                 disabled={isSubmitting}
//                                 className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
//                             >
//                                 {isSubmitting ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 animate-spin" />
//                                         <span>Processing...</span>
//                                     </>
//                                 ) : (
//                                     <span>Confirm ₹{selectedItem.due_amount} Received</span>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     )
// }

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, MessageCircle, X, Loader2 } from 'lucide-react'
import { generatePendingDueReminderLink } from '@/lib/whatsapp'
import { clearMemberDue } from '@/app/actions/members'

type PendingDueItem = {
    id: string // subscription_id
    due_amount: number
    plan_name?: string
    members?: {
        id: string
        full_name: string
        phone: string
        photo_url?: string
    } | null
    full_name?: string
    phone?: string
}

type Props = {
    pendingDues: PendingDueItem[]
    gymName?: string
}

export function PendingDuesCard({ pendingDues, gymName = 'Gym' }: Props) {
    const router = useRouter()
    const [selectedItem, setSelectedItem] = useState<PendingDueItem | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<string>('UPI')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleConfirmPayment = async () => {
        if (!selectedItem) return

        const memberId = selectedItem.members?.id
        const subscriptionId = selectedItem.id
        const amountPaid = selectedItem.due_amount

        if (!subscriptionId || !memberId) {
            alert("Missing subscription or member ID context.")
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('subscription_id', subscriptionId)
            formData.append('member_id', memberId)
            formData.append('amount_paid', String(amountPaid))
            formData.append('payment_method', paymentMethod)

            const res = await clearMemberDue(formData)
            if (res?.success) {
                await router.refresh()
                setSelectedItem(null)
            } else {
                alert("Failed to clear due amount.")
            }
        } catch (err: any) {
            alert(err.message || "Failed to clear due amount.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalDueSum = pendingDues.reduce((sum, item) => sum + Number(item.due_amount || 0), 0)

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <div className="min-w-0">
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                                Pending Member Dues
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                Total Unpaid Amount:{' '}
                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                    ₹{totalDueSum}
                                </span>
                            </p>
                        </div>
                    </div>
                    <span className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 font-semibold px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 shrink-0">
                        {pendingDues.length} Pending
                    </span>
                </div>

                {/* Empty State */}
                {pendingDues.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                        🎉 All clear! No pending dues found.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto pr-1">
                        {pendingDues.map((item) => {
                            const fullName = item.full_name || item.members?.full_name || 'Member'
                            const phone = item.phone || item.members?.phone || ''
                            const photoUrl = item.members?.photo_url
                            const planName = item.plan_name || 'Standard Plan'
                            const dueAmount = item.due_amount

                            const whatsappUrl = generatePendingDueReminderLink({
                                phone: phone,
                                memberName: fullName,
                                dueAmount: dueAmount,
                                gymName: gymName,
                            })

                            return (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-2">
                                    {/* Left: Avatar & Details */}
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {photoUrl ? (
                                            <Image
                                                src={photoUrl}
                                                alt={fullName}
                                                width={36}
                                                height={36}
                                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                                                {fullName.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                {fullName}
                                            </p>
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">
                                                Due: ₹{dueAmount}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* WhatsApp Remind Button (Icon on mobile, text on desktop) */}
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 sm:px-2.5 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition shrink-0"
                                            title="Send WhatsApp Payment Reminder"
                                        >
                                            <MessageCircle className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400 text-transparent shrink-0" />
                                            <span className="hidden sm:inline">Remind</span>
                                        </a>

                                        {/* Pay Due Button */}
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-500/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400 dark:border-amber-600 text-xs font-semibold px-2.5 py-1.5 sm:px-3 rounded-lg transition shrink-0 whitespace-nowrap"
                                        >
                                            Pay Due
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Clear Due Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-6 pb-2 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Clear Pending Due
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                    Are you receiving the pending due payment of{' '}
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        ₹{selectedItem.due_amount}
                                    </span>{' '}
                                    from{' '}
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedItem.full_name || selectedItem.members?.full_name}
                                    </span>
                                    ?
                                </p>
                            </div>
                            <button
                                onClick={() => !isSubmitting && setSelectedItem(null)}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 pt-3 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setSelectedItem(null)}
                                disabled={isSubmitting}
                                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isSubmitting}
                                className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Confirm ₹{selectedItem.due_amount} Received</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}