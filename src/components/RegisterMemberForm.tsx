'use client'

import { useState, useEffect } from "react"
import PhotoUpload from "./PhotoUpload"
import { addMember } from "@/app/actions/members"

type RegisterMemberFormProp = {
    plans: any[]
}

export default function RegisterMemberForm({plans}: RegisterMemberFormProp) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploadKey, setUploadKey] = useState(0)
    const [selectedPlanId, setSelectedPlanId] = useState<string>("")
    const [planPrice, setPlanPrice] = useState<number>(0)
    const [discount, setDiscount] = useState<number | string>("")
    const [amountPaid, setAmountPaid] = useState<number | string>("")

    useEffect(() => {
        const foundPlan = plans.find((p) => p.id === selectedPlanId)
        if(foundPlan) {
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

    const handleSubmit = async(e:React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)

        if(selectedFile) {
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

                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium mb-1 text-gray-700">
                        Full Name *
                    </label>
                    <input 
                        type="text" 
                        id="full_name"
                        name="full_name"
                        placeholder="Pratik Sharma"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">
                        Phone Number *
                    </label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="9876543210"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                        Email (Optional)
                    </label>
                    <input 
                        type="email"
                        id="email"
                        name="email"
                        placeholder="pratik@gmail.com"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-sm font-medium mb-1 text-gray-700">
                        Gender
                    </label>
                    <select 
                        name="gender" 
                        id="gender"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                </div>
                
                <div>
                    <label 
                        htmlFor="plan_id" 
                        className="block text-sm font-medium mb-1 text-gray-700"
                    >
                        Select Plan *
                    </label>
                    <select 
                        name="plan_id" 
                        id="plan_id" 
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="">Select a plan...</option>
                        {plans.map((plan: any) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.plan_name} - ₹{plan.price} ({plan.duration_months} mo)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label 
                        htmlFor="start_date" 
                        className="block text-sm font-medium mb-1 text-gray-700"
                    >
                        Joining Date
                    </label>
                    <input 
                        type="date" 
                        id="start_date"
                        name="start_date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                </div>

                {selectedPlanId && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 scroll-py-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Payment Summary
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label 
                                    htmlFor="discount"
                                    className="block text-xs font-medium scrollbar-track-gray-600 mb-1"
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
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label 
                                    htmlFor="amount_paid"
                                    className="block text-xs font-medium text-gray-600 mb-1"
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
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label 
                                    htmlFor="payment_method"
                                    className="block text-xs font-medium text-gray-600 mb-1"
                                >
                                    Payment Method
                                </label>
                                <select 
                                    name="payment_method" 
                                    id="payment_method"
                                    defaultValue="upi"
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="upi">UPI</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="text-xs text-gray-500">
                                    Total: <span className="font-semibold text-gray-900">{finalTotal}</span>
                                </div>
                                <div className="text-xs">
                                    Pending Due:{" "}
                                    <span>
                                        ₹{calculatedDue}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-medium py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {loading ? 'Registering...' : 'Register Member'}
                </button>
        </form>
    )
}