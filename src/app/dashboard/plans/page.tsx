// import { 
//     getMembershipPlans, 
//     togglePlanStatus
// } from "@/app/actions/plans";
// import { DeletePlanButton } from "@/components/DeletePlanButton";
// import { AddPlanForm } from "@/components/AddPlanForm";

// export default async function PlansPage() {
//     const result = await getMembershipPlans()
//     const plans = result.data || []

//     return (
//         <div className="p-6 space-y-8 max-w-6xl mx-auto">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Membership Plans</h1>
//                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
//                     Manage pricing packages and subscription durations for your gym.
//                 </p>
//             </div>  

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Form Section */}
//                 <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
//                     <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add new plan</h2>
                    
//                     {/* 🟢 Using the AddPlanForm component with loading state */}
//                     <AddPlanForm />
//                 </div>

//                 {/* Plans List Section */}
//                 <div className="lg:col-span-2">
//                     <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Plans</h2>

//                     {plans.length === 0 ? (
//                         <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
//                             No Plans created yet. Add your first membership plan using the form!
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             {plans.map((plan: any) => {
//                                 const isActive = plan.is_active ?? true
//                                 return (
//                                     <div 
//                                         key={plan.id}
//                                         className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all ${
//                                             !isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : ''
//                                         }`}
//                                     >
//                                         <div className="flex justify-between items-start">
//                                             <div>
//                                                 <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
//                                                     {plan.plan_name}
//                                                     {!isActive && (
//                                                         <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-full font-medium">
//                                                             Inactive
//                                                         </span>
//                                                     )}
//                                                 </h3>
//                                                 <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
//                                                     ₹{plan.price}
//                                                 </p>
//                                             </div>
//                                             <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
//                                                 {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
//                                             </span>
//                                         </div>

//                                         <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
//                                             <form action={togglePlanStatus.bind(null, plan.id, isActive)}>
//                                                 <button
//                                                     type="submit"
//                                                     className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
//                                                         isActive 
//                                                             ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200/60 dark:border-amber-900/50'
//                                                             : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/60 dark:border-emerald-900/50'
//                                                     }`}
//                                                 >
//                                                     {isActive ? 'Mark Inactive' : 'Mark Active'}
//                                                 </button>
//                                             </form>

//                                             <DeletePlanButton planId={plan.id} planName={plan.plan_name} />
//                                         </div>
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }

import { 
    getMembershipPlans, 
    togglePlanStatus
} from "@/app/actions/plans";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { AddPlanForm } from "@/components/AddPlanForm";

export default async function PlansPage() {
    const result = await getMembershipPlans()
    const plans = result.data || []

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Membership Plans</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Manage pricing packages and subscription durations for your gym.
                </p>
            </div>  

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add new plan</h2>
                    
                    {/* Using the AddPlanForm component with loading state */}
                    <AddPlanForm />
                </div>

                {/* Plans List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Plans</h2>

                    {plans.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                            No Plans created yet. Add your first membership plan using the form!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plans.map((plan: any) => {
                                const isActive = plan.is_active ?? true
                                return (
                                    <div 
                                        key={plan.id}
                                        className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all ${
                                            !isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                    {plan.plan_name}
                                                    {!isActive && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-full font-medium">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                                                    ₹{plan.price}
                                                </p>
                                            </div>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">

                                            <form action={async () => { await togglePlanStatus(plan.id, isActive); }}>
                                                <button
                                                    type="submit"
                                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                                                        isActive 
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200/60 dark:border-amber-900/50'
                                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/60 dark:border-emerald-900/50'
                                                    }`}
                                                >
                                                    {isActive ? 'Mark Inactive' : 'Mark Active'}
                                                </button>
                                            </form>

                                            <DeletePlanButton planId={plan.id} planName={plan.plan_name} />
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