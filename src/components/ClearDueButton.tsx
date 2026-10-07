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

            const formData = new FormData
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
        <Dialog open={open} onOpenChange= {setOpen} >
            <DialogTrigger className="inline-flex items-center justify-center rounded-md font-medium px-2 h-7 text-xs border border-amber-500 text-amber-700 hover:bg-amber-50 bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Pay Due
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Clear Pending Due</DialogTitle>
                    <DialogDescription>
                        Are you receiving the pending due payment of <strong className="text-gray-900">₹{dueAmount}</strong> from <strong>{memberName}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 flex flex-col gap-1.5">
                    <label 
                        htmlFor="payment_method"
                        className="text-xs font-medium text-gray-700"
                    >
                        Payment Method
                    </label>
                    <select 
                        name="payment_method" 
                        id="payment_method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                    </select>
                </div>
                <DialogFooter className="pt-4 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="w-1/2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={handleClear}
                        className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {loading ? "Processing..." : `Confirm ${dueAmount} Received`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}