import { 
        getMembershipPlans, 
        createMembershipPlan,
        togglePlanStatus,
        deleteMembershipPlan
    } from "@/app/actions/plans";

export default async function PlansPage() {
    const result = await getMembershipPlans()
    const plans = result.data || []

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage pricing packages and subsription durations for your gym.
                </p>
            </div>  

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Add new plan</h2>

                    <form action={createMembershipPlan} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700">
                                Plan Name
                            </label>
                            <input 
                                type="text" 
                                id="name"
                                name="name"
                                placeholder="e.g. Monthly Standard"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium mb-1.5 text-gray-700">
                                Price (₹)
                            </label>
                            <input 
                                type="number" 
                                id="price"
                                name="price"
                                placeholder="1000"
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label htmlFor="duration_months" className="block text-sm font-medium mb-1.5 text-gray-700">
                                Duration (Months)
                            </label>
                            <input 
                                type="number"
                                id="duration_months"
                                name="duration_months"
                                placeholder="1"
                                min="1"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-medium py-2.5 rounded-lg text-sm hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Save Plan
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Active Plans</h2>

                    {plans.length === 0 ? (
                        <div className="border border-dashed rounded-xl p-8 text-center bg-gray-50 text-gray-500">
                            No Plans created yet. Add your first membership plan using the form!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.map((plan: any) => {
                                const isActive = plan.is_active ?? true
                                return (
                                    <div 
                                        key={plan.id}
                                        className={`bg-white p-5 rounded-xl border shadow-sm space-y-4 transition-all ${!isActive ? 'opacity-60 bg-gray-50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                                    {plan.plan_name}
                                                    {!isActive && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-2xl font-extrabold text-black mt-1">
                                                    ₹{plan.price}
                                                </p>
                                            </div>
                                            <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-2.5 py-1 rounded-full">
                                                {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t text-xs gap-2">
                                            <form action={togglePlanStatus.bind(null, plan.id, isActive)}>
                                                <button
                                                    type="submit"
                                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                                                        isActive 
                                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                                >
                                                    {isActive ? 'Mark Inactive' : 'Mark Active'}
                                                </button>
                                            </form>

                                            <div className="flex items-center gap-2">
                                                    <form action={deleteMembershipPlan.bind(null, plan.id)}>
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium cursor-pointer    transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </form>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}