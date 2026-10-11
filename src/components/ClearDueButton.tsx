'use client'

import { useState } from "react"
import { clearMemberDue } from "@/app/actions/members"
import { Button } from "./ui/button"
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type ClearDueButtonProps = {
    subscriptionId: string
    memberId: string
    memberName: string
    dueAmount: number
}

export default function ClearDueButton({subscriptionId, memberId, memberName, dueAmount}: ClearDueButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('upi')

    const handleClear = async () => {
        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('subscription_id', subscriptionId)
            formData.append('member_id', memberId)
            formData.append('member_name', memberName)
            formData.append('amount_paid', dueAmount.toString())
            formData.append('payment_method', paymentMethod)

            await clearMemberDue(formData)
            setOpen(false)
            alert("Due amount cleared successfully!")
        } catch (err: any) {
            alert(err.message || "Failed to clear due amount")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md font-medium px-2 h-7 text-xs border border-amber-500/80 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Pay Due
            </DialogTrigger>
            
            {/* 🟢 Dialog Content with Dark Mode Support */}
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white font-bold text-lg">
                        Clear Pending Due
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        Are you receiving the pending due payment of{' '}
                        <strong className="text-slate-900 dark:text-white font-bold">
                            ₹{dueAmount}
                        </strong>{' '}
                        from{' '}
                        <strong className="text-slate-900 dark:text-white font-bold">
                            {memberName}
                        </strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 flex flex-col gap-1.5">
                    <label 
                        htmlFor="payment_method"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                        Payment Method
                    </label>
                    <select 
                        name="payment_method" 
                        id="payment_method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    >
                        <option value="upi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">UPI</option>
                        <option value="cash" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cash</option>
                        <option value="card" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Card</option>
                    </select>
                </div>

                <DialogFooter className="pt-4 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="w-1/2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={handleClear}
                        className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                    >
                        {loading ? "Processing..." : `Confirm ₹${dueAmount} Received`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}