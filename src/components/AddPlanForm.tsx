'use client'

import { useState } from "react"
import { createMembershipPlan } from "@/app/actions/plans"
import { Loader2 } from "lucide-react"

export function AddPlanForm() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setLoading(true)

        const formData = new FormData(form)

        try {
            await createMembershipPlan(formData)
            form.reset()
        } catch (error: any) {
            alert(error.message || 'Failed to create plan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Plan Name
                </label>
                <input 
                    type="text" 
                    id="name"
                    name="name"
                    placeholder="e.g. Monthly Standard"
                    required
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Price (₹)
                </label>
                <input 
                    type="number" 
                    id="price"
                    name="price"
                    placeholder="1000"
                    required
                    min="0"
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
            </div>

            <div>
                <label htmlFor="duration_months" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    Duration (Months)
                </label>
                <input 
                    type="number"
                    id="duration_months"
                    name="duration_months"
                    placeholder="1"
                    min="1"
                    required
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving Plan...</span>
                    </>
                ) : (
                    <span>Save Plan</span>
                )}
            </button>
        </form>
    )
}