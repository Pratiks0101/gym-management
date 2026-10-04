'use client'

import { useState } from "react"
import PhotoUpload from "./PhotoUpload"
import { addMember } from "@/app/actions/members"

type RegisterMemberFormProp = {
    plans: any[]
}

export default function RegisterMemberForm({plans}: RegisterMemberFormProp) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploadKey, setUploadKey] = useState(0)

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

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-medium py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {loading ? 'Registering...' :'Register Member'}
                </button>
        </form>
    )
}