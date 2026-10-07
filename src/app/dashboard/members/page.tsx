import { getMembers, deleteMembers } from "@/app/actions/members";
import { getMembershipPlans } from "@/app/actions/plans";
import RegisterMemberForm from "@/components/RegisterMemberForm";
import { getMemberStatus } from "@/lib/subscription";
import RenewMemberModal from "@/components/RenewMemberModal";
import ClearDueButton from "@/components/ClearDueButton";
import { AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function MembersPage() {
    const { data: members = [] } = await getMembers()
    const { data: plans = [] } = await getMembershipPlans()

    const activePlans = plans.filter((p: any) => p.is_active !== false)

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Members</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Register new gym members and view active subscriptions.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Form Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Register New Member</h2>

                    {activePlans.length === 0 ? (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-900">
                            Please create at least one active <strong>Membership Plan</strong> before registering members.
                        </div>
                    ) : (
                        <RegisterMemberForm plans={activePlans} />
                    )} 
                </div>

                {/* Registered Members Table Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Registered Members</h2>

                    {members.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                            No members registered yet. Add your first member!
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Member</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Phone</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Active Plan</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Valid Till</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {members.map((member: any) => {
                                        const sortedSubs = [...(member.subscriptions || [])].sort((a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime())
                                        const latestSub = sortedSubs[0]
                                        const planName = latestSub?.membership_plans?.plan_name || 'N/A'
                                        const rawEndDate = latestSub?.end_date || member.valid_till
                                        const endDate = rawEndDate  
                                        ? new Date(rawEndDate).toLocaleDateString('en-IN') 
                                        : 'N/A'
                                        
                                        const statusInfo = getMemberStatus(rawEndDate)
                                        const dueAmount = Number(latestSub?.due_amount || 0)

                                        return (
                                            <TableRow key={member.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                                <TableCell className="font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                                                    {member.photo_url ? (
                                                        <Image 
                                                            src={member.photo_url}
                                                            alt={member.full_name}
                                                            width={36}
                                                            height={36}
                                                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center uppercase">
                                                            {member.full_name?.slice(0, 2) || 'MB'}
                                                        </div>
                                                    )}
                                                    <span>{member.full_name}</span>
                                                </TableCell>

                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                    {member.phone}
                                                </TableCell>
                                                <TableCell className="text-slate-800 dark:text-slate-200 font-medium">
                                                    {planName}
                                                </TableCell>
                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                    {endDate}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeColor}`}>
                                                            {statusInfo.badgeText}
                                                        </span>

                                                        {dueAmount > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                                                                <AlertCircle className="w-3 h-3" />
                                                                Due: ₹{dueAmount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-1.5">
                                                    {dueAmount > 0 && latestSub && (
                                                        <ClearDueButton 
                                                            subscriptionId={latestSub.id}
                                                            memberId={member.id}
                                                            memberName={member.full_name}
                                                            dueAmount={dueAmount}
                                                        />
                                                    )}
                                                    <RenewMemberModal member={member} plans={activePlans} />

                                                    <form action={deleteMembers.bind(null, member.id)}>
                                                        <button 
                                                            type="submit"
                                                            title="Delete Member"
                                                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}