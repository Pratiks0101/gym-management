import { getMembers } from "@/app/actions/members";
import { getMembershipPlans } from "@/app/actions/plans";
import RegisterMemberForm from "@/components/RegisterMemberForm";
import MembersTableList from "@/components/MembersTableList";

export default async function MembersPage() {
    // Fetch members and membership plans in parallel
    const [membersRes, plansRes] = await Promise.all([
        getMembers(),
        getMembershipPlans()
    ])

    const members = membersRes.data || []
    const plans = plansRes.data || []
    const activePlans = plans.filter((p: any) => p.is_active !== false)

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Members
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                    Register new gym members and view active subscriptions.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Form Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                        Register New Member
                    </h2>

                    {activePlans.length === 0 ? (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-sm rounded-lg border border-amber-200 dark:border-amber-900/60">
                            Please create at least one active <strong className="font-semibold">Membership Plan</strong> before registering members.
                        </div>
                    ) : (
                        <RegisterMemberForm plans={activePlans} />
                    )} 
                </div>

                {/* Registered Members Table Section with Duration Filters & GetInitials */}
                <div className="lg:col-span-2">
                    <MembersTableList 
                        initialMembers={members} 
                        activePlans={activePlans} 
                    />
                </div>
            </div>
        </div>
    )
}