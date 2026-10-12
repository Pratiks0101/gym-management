'use client'

import { useState } from "react"
import { renewMemberSubscription } from "@/app/actions/members"
import { RefreshCw } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"

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
}

export default function RenewMemberModal({member, plans}: RenewMemberModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '')

    const selectedPlan = plans.find((p) => p.id === selectedPlanId)

    const [discount, setDiscount] = useState<number | ''>(0)
    const [amountPaid, setAmountPaid] = useState<number | ''>(selectedPlan?.price || 0)

    const handlePlanChange = (planId: string) => {
        setSelectedPlanId(planId)
        const p = plans.find((item) => item.id === planId)
        if(p) {
            const numDiscount = typeof discount === 'number' ? discount : 0
            setAmountPaid(Math.max(0, p.price - numDiscount))
        }
    }

    const planPrice = selectedPlan?.price || 0
    const numDiscount = typeof discount === 'number' ? discount : 0
    const numAmountPaid = typeof amountPaid === 'number' ? amountPaid : 0

    const finalPrice = Math.max(0, planPrice - numDiscount)
    const calculatedDue = Math.max(0, finalPrice - numAmountPaid)

    const getTodayString = () => {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() +1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }

    const calculateDefaultStartDate = () => {
        const latestSub = member.subscriptions?.[0]
        const rawEndDate = latestSub?.end_date || member.valid_till

        if (rawEndDate) {
            const currentEndDate = new Date(rawEndDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if(currentEndDate >= today) {
                const nextStartDate = new Date(currentEndDate)
                nextStartDate.setDate(nextStartDate.getDate() + 1)

                const yyyy = nextStartDate.getFullYear()
                const mm = String(nextStartDate.getMonth() +1).padStart(2, '0')
                const dd = String(nextStartDate.getDate()).padStart(2, '0')
                return `${yyyy}-${mm}-${dd}`
            }
        }
        return getTodayString()
    }

    const calculatedStartDate = calculateDefaultStartDate()
    const isAdvanceRenewal = calculatedStartDate !== getTodayString()

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)
        formData.append('member_id', member.id)
        formData.append('total_amount', String(planPrice))
        formData.append('discount', String(numDiscount))
        formData.append('amount_paid', String(numAmountPaid))

        if(selectedPlan) {
            formData.append('duration_months', String(selectedPlan.duration_months))
        }

        try {
            await renewMemberSubscription(formData)
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
            <DialogTrigger title="Renew Membership" className=" flex gap-2 p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
                    <RefreshCw className="w-4 h-4" />
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg p-6 rounded-2xl bg-white shadow-xl">
                <DialogHeader className="text-left pr-8 pb-2 border-b">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Renew Membership
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Member: <span className="font-semibold text-gray-800">{member.full_name}</span>
                        </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
                            <div className="space-y-1">
                                <label 
                                    htmlFor="plan_id"
                                    className="block text-sm font-medium text-gray-700">
                                    Select New Plan *
                                </label>
                                <select 
                                    name="plan_id" 
                                    id="plan_id"
                                    value={selectedPlanId}
                                    onChange={(e) => handlePlanChange(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2  focus:ring-black focus:border-black outline-none transition-all cursor-pointer font-medium"
                                >
                                    {plans.map((plan) => (
                                        <option 
                                            key={plan.id} 
                                            value={plan.id}
                                        >
                                            {plan.plan_name} - ₹{plan.price} ({plan.duration_months} mo)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                    <label 
                                        htmlFor="start_date"
                                        className="block text-sm font-semibold text-gray-700">
                                        Renewal Start Date *
                                    </label>
                                    {isAdvanceRenewal && (
                                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            Advance Renewal (+1 Day)
                                        </span>
                                )}
                                </div>
                                    <input 
                                        type="date" 
                                        id="start_date"
                                        name="start_date"
                                        defaultValue={calculatedStartDate}
                                        key={calculatedStartDate}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label 
                                        htmlFor="disocunt"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Discount (₹)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="discount"
                                        id="discount"
                                        value={discount}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setDiscount(val === '' ? '' : Number(val))
                                        }}
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label 
                                        htmlFor="amount_paid"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Amount Paid (₹) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="amount_paid"
                                        id="amount_paid"
                                        value={amountPaid}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setAmountPaid(val === '' ? '' : Number(val))
                                        }}
                                        required
                                        min='0'
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            {calculatedDue > 0 && (
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex justify-between items-center text-xs font-semibold text-amber-800">
                                    <span>Pending Due Balance:</span>
                                    <span className="text-sm font-bold text-amber-900">{calculatedDue}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label 
                                    htmlFor="payment_method" 
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Payment Method
                                </label>
                                <select 
                                    name="payment_method" 
                                    id="payment_method"
                                    defaultValue="upi"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                                >
                                    <option value="upi">UPI</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>

                            <DialogFooter className="pt-4 flex gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-1/2 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-1/2 bg-black text-white py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Renewing...' : "Confirm Renewal"}
                                </button>
                            </DialogFooter>
                        </form>
            </DialogContent>
        </Dialog>
    )
}