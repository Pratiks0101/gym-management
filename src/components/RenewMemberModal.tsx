'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { renewMemberSubscription } from '@/app/actions/members'
import { RefreshCw, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'

type Plan = {
    id: string
    plan_name: string
    price: number
    duration_months: number
}

type RenewMemberModalProps = {
    member: {
        id: string
        full_name: string
        subscriptions?: Array<{end_date: string}>
        valid_till?: string
    }
    plans: Plan[]
    showText?: boolean
}

export default function RenewMemberModal({member, plans, showText = false}: RenewMemberModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '')

    const selectedPlan = plans.find((p) => p.id === selectedPlanId)

    const [discount, setDiscount] = useState<number | ''>('')
    const [amountPaid, setAmountPaid] = useState<number | string>(selectedPlan?.price || 0)

    const handlePlanChange = (planId: string) => {
        setSelectedPlanId(planId)
        const p = plans.find((item) => item.id === planId)
        if(p) {
            const price = Number(p.price || 0)
            setAmountPaid(price)
            setDiscount('')
        }
    }

    const planPrice = selectedPlan?.price || 0
    const numDiscount = discount === '' ? 0 : Number(discount)
    const finalTotal = Math.max(0, planPrice - numDiscount)
    const numPaid = amountPaid === '' ? 0 : Number(amountPaid)
    const calculatedDue = Math.max(0, finalTotal - numPaid)

    const handleDiscountChange = (valStr: string) => {
        if(valStr === '') {
            setDiscount('')
            setAmountPaid(planPrice)
        } else {
            const valNum = Number(valStr)
            setDiscount(valNum)
            const calculatedTotal = Math.max(0, planPrice - valNum)
            setAmountPaid(calculatedTotal)
        }
    }

    // Optimized with useMemo so it doesn't recalculate on every keystroke/render
    const getTodayString = useCallback(() => {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }, [])

    const calculatedStartDate = useMemo(() => {
        const latestSub = member.subscriptions?.[0]
        const rawEndDate = latestSub?.end_date || member.valid_till

        if (rawEndDate) {
            const currentEndDate = new Date(rawEndDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if(currentEndDate >= today) {
                const yyyy = currentEndDate.getFullYear()
                const mm = String(currentEndDate.getMonth() + 1).padStart(2, '0')
                const dd = String(currentEndDate.getDate()).padStart(2, '0')
                return `${yyyy}-${mm}-${dd}`
            }
        }
        return getTodayString()
    }, [member, getTodayString])

    const isAdvanceRenewal = calculatedStartDate !== getTodayString()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)
        formData.append('member_id', member.id)
        formData.append('total_amount', String(planPrice))
        formData.append('discount', String(numDiscount))
        formData.append('amount_paid', String(numPaid))

        if(selectedPlan) {
            formData.append('duration_months', String(selectedPlan.duration_months))
        }

        try {
            await renewMemberSubscription(formData)
            
            // Refresh server component data so renewed member vanishes instantly
            router.refresh() 

            setIsOpen(false)
            alert('Membership renewed successfully!')
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Failed to renew membership')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger 
                title="Renew Membership" 
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
                <RefreshCw className="w-4 h-4" />
                {showText && <span>Renew</span> }
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                <DialogHeader className="text-left pr-8 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Renew Membership
                    </DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Member: <span className="font-semibold text-slate-800 dark:text-slate-200">{member.full_name}</span>
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
                    {/* Select Plan */}
                    <div className="space-y-1">
                        <label 
                            htmlFor="plan_id"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select New Plan *
                        </label>
                        <select 
                            name="plan_id" 
                            id="plan_id"
                            value={selectedPlanId}
                            disabled={loading}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            required
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer font-medium disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id} className="bg-white dark:bg-slate-900">
                                    {plan.plan_name} - ₹{plan.price} ({plan.duration_months} mo)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center mb-1">
                            <label 
                                htmlFor="start_date"
                                className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Renewal Start Date *
                            </label>
                            {isAdvanceRenewal && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    Advance Renewal (Exact Expiry Date)
                                </span>
                            )}
                        </div>
                        <input 
                            type="date" 
                            id="start_date"
                            name="start_date"
                            defaultValue={calculatedStartDate}
                            key={calculatedStartDate}
                            disabled={loading}
                            required
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Payment Summary Box */}
                    {selectedPlanId && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Payment Summary
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label 
                                        htmlFor="discount"
                                        className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
                                    >
                                        Discount (₹)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="discount"
                                        id="discount"
                                        min="0"
                                        disabled={loading}
                                        placeholder="0"
                                        value={discount}
                                        onChange={(e) => {
                                            handleDiscountChange(e.target.value)
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label 
                                        htmlFor="amount_paid"
                                        className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 shrink-0"
                                    >
                                        Amount Paid (₹) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="amount_paid"
                                        id="amount_paid"
                                        min="0"
                                        disabled={loading}
                                        placeholder="0"
                                        value={amountPaid}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setAmountPaid(val === "" ? "" : Number(val))
                                        }}
                                        required
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 items-center">
                                <div>
                                    <label 
                                        htmlFor="payment_method"
                                        className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
                                    >
                                        Payment Method
                                    </label>
                                    <select 
                                        name="payment_method" 
                                        id="payment_method"
                                        disabled={loading}
                                        defaultValue="upi"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="upi">UPI</option>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>

                                <div className="flex flex-col justify-end text-right space-y-1">
                                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                                        Final Total: <span className="font-bold text-slate-900 dark:text-white">₹{finalTotal}</span>
                                    </div>
                                    <div className="text-xs font-black text-slate-600 dark:text-slate-300">
                                        Pending Due:{" "}
                                        <span className={`font-bold ${calculatedDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                            ₹{calculatedDue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <DialogFooter className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                            className="w-1/2 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Renewing...</span>
                                </>
                            ) : (
                                "Confirm Renewal"
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}