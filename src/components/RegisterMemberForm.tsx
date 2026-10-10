'use client'

import { useState, useEffect } from "react"
import PhotoUpload from "./PhotoUpload"
import { addMember } from "@/app/actions/members"

type RegisterMemberFormProp = {
    plans: any[]
}

export default function RegisterMemberForm({ plans }: RegisterMemberFormProp) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploadKey, setUploadKey] = useState(0)
    const [selectedPlanId, setSelectedPlanId] = useState<string>("")
    const [planPrice, setPlanPrice] = useState<number>(0)
    const [discount, setDiscount] = useState<number | string>("")
    const [amountPaid, setAmountPaid] = useState<number | string>("")

    useEffect(() => {
        const foundPlan = plans.find((p) => p.id === selectedPlanId)
        if (foundPlan) {
            const price = Number(foundPlan.price || 0)
            setPlanPrice(price)
            setAmountPaid(price)
            setDiscount("")
        } else {
            setPlanPrice(0)
            setAmountPaid("")
            setDiscount("")
        }
    }, [selectedPlanId, plans])

    const numDiscount = Number(discount || 0)
    const finalTotal = Math.max(0, planPrice - numDiscount)
    const numPaid = amountPaid === "" ? 0 : Number(amountPaid)
    const calculatedDue = Math.max(0, finalTotal - numPaid)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)

        if (selectedFile) {
            formData.append('avatar_file', selectedFile)
        }

        try {
            await addMember(formData)
            form.reset()
            setSelectedFile(null)
            setSelectedPlanId("")
            setPlanPrice(0)
            setDiscount("")
            setAmountPaid("")
            setUploadKey((prevKey) => prevKey + 1)
            alert('Member registered successfully!')
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Failed to register member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PhotoUpload 
                key={uploadKey}
                onImageSelected={(file) => setSelectedFile(file)} 
            />

            {/* Full Name */}
            <div>
                <label htmlFor="full_name" className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Full Name *
                </label>
                <input 
                    type="text" 
                    id="full_name"
                    name="full_name"
                    placeholder="Pratik Sharma"
                    required
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
            </div>

            {/* Phone Number */}
            <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Phone Number *
                </label>
                <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="9876543210"
                    required
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
            </div>

            {/* Email & Gender */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Email (Optional)
                    </label>
                    <input 
                        type="email"
                        id="email"
                        name="email"
                        placeholder="pratik@gmail.com"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                        Gender
                    </label>
                    <select 
                        name="gender" 
                        id="gender"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            
            {/* Plan Selection */}
            <div>
                <label 
                    htmlFor="plan_id" 
                    className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300"
                >
                    Select Plan *
                </label>
                <select 
                    name="plan_id" 
                    id="plan_id" 
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                    <option value="">Select a plan...</option>
                    {plans.map((plan: any) => (
                        <option key={plan.id} value={plan.id}>
                            {plan.plan_name} - ₹{plan.price} ({plan.duration_months} mo)
                        </option>
                    ))}
                </select>
            </div>

            {/* Joining Date */}
            <div>
                <label 
                    htmlFor="start_date" 
                    className="block text-xs sm:text-sm font-medium mb-1 text-slate-700 dark:text-slate-300"
                >
                    Joining Date
                </label>
                <input 
                    type="date" 
                    id="start_date"
                    name="start_date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
            </div>

            {/* Payment Breakdown Card */}
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
                                placeholder="0"
                                onChange={(e) => {
                                    const val = e.target.value
                                    setDiscount(val === "" ? "" : Number(val))
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="amount_paid"
                                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
                            >
                                Amount Paid (₹) *
                            </label>
                            <input 
                                type="number" 
                                name="amount_paid"
                                id="amount_paid"
                                min="0"
                                placeholder="0"
                                value={amountPaid}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setAmountPaid(val === "" ? "" : Number(val))
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
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
                                defaultValue="upi"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            >
                                <option value="upi">UPI</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                            </select>
                        </div>

                        <div className="flex flex-col justify-end text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Final Total: <span className="font-bold text-slate-900 dark:text-white">₹{finalTotal}</span>
                            </div>
                            <div className="text-xs font-bold mt-0.5">
                                Pending Due:{" "}
                                <span className={calculatedDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                                    ₹{calculatedDue}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
                {loading ? 'Registering...' : 'Register Member'}
            </button>
        </form>
    )
}