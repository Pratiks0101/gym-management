import { getMembers, deleteMembers } from "@/app/actions/members";
import { getMembershipPlans } from "@/app/actions/plans";
import RegisterMemberForm from "@/components/RegisterMemberForm";
import { Trash2 } from "lucide-react";
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
                <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Register new gym members and view active subscriptions.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Register New Member</h2>

                    {activePlans.length === 0 ? (
                        <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
                            Please create at least one active <strong>Membership Plan</strong> before registering members.
                        </div>
                    ) : (
                        <RegisterMemberForm plans={activePlans} />
                    )} 
                </div>

                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Registered Members</h2>

                    {members.length === 0 ? (
                        <div className="border border-dashed rounded-xl p-8 text-center bg-gray-50 text-gray-500">
                            No members registered yet. Add your first member!
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Member</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Active Plan</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Valid Till</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member: any) => {
                                        const latestSub = member.subscriptions?.[0]
                                        const planName = latestSub.membership_plans?.plan_name || 'N/A'
                                        const endDate = latestSub.end_date 
                                        ? new Date(latestSub.end_date).toLocaleDateString('en-IN') 
                                        : 'N/A'

                                        return (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-semibold text-gray-900 flex items-center gap-3">
                                                    {member.photo_url ? (
                                                        <Image 
                                                            src={member.photo_url}
                                                            alt={member.full_name}
                                                            width={36}
                                                            height={36}
                                                            className="w-9 h-9 rounded-full object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gray-100 border text-gray-700 font-bold text-xs flex items-center justify-center uppercase">
                                                            {member.full_name?.slice(0, 2) || 'MB'}
                                                        </div>
                                                    )}
                                                    <span>{member.full_name}</span>
                                                </TableCell>

                                                <TableCell className="text-gray-600">
                                                    {member.phone}
                                                </TableCell>
                                                <TableCell className="text-gray-800 font-medium">
                                                    {planName}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {endDate}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                                                        Active
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <form action={deleteMembers.bind(null, member.id)}>
                                                        <button 
                                                            type="submit"
                                                            title="Delete Member"
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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