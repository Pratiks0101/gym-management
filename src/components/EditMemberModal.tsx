// 'use client'

// import { useState } from "react"
// import { Pencil, Loader2, X } from "lucide-react"
// import { updateMember } from "@/app/actions/members"

// type EditMemberModalProps = {
//     member: {
//         id: string
//         full_name: string
//         phone: string
//     }
// }

// export default function EditMemberModal({ member }: EditMemberModalProps) {
//     const [isOpen, setIsOpen] = useState(false)
//     const [isLoading, setIsLoading] = useState(false)
//     const [fullName, setFullName] = useState(member.full_name || '')
//     const [phone, setPhone] = useState(member.phone || '')

//     const handleSubmit = async (e: React.SubmitEvent) => {
//         e.preventDefault()
//         setIsLoading(true)

//         const formData = new FormData()
//         formData.append('full_name', fullName)
//         formData.append('phone', phone)

//         try {
//             await updateMember(member.id, formData)
//             setIsLoading(false)
//             setIsOpen(false)
//         } catch (error) {
//             console.error('Failed to update member:', error)
//             setIsLoading(false)
//         }
//     }

//     return (
//         <>
//             {/* Edit Trigger Button */}
//             <button
//                 type="button"
//                 onClick={() => setIsOpen(true)}
//                 title="Edit Member"
//                 className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-all cursor-pointer"
//             >
//                 <Pencil className="w-4 h-4" />
//             </button>

//             {/* Popup Modal */}
//             {isOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
//                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        
//                         {/* Close Button */}
//                         <button
//                             type="button"
//                             onClick={() => setIsOpen(false)}
//                             className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
//                         >
//                             <X className="w-5 h-5" />
//                         </button>

//                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
//                             Edit Member Details
//                         </h3>
//                         <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
//                             Update the name or phone number for {member.full_name}
//                         </p>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                                     Full Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={fullName}
//                                     onChange={(e) => setFullName(e.target.value)}
//                                     required
//                                     className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                                     Phone Number
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     maxLength={10}
//                                     value={phone}
//                                     onChange={(e) => {
//                                         const val = e.target.value.replace(/\D/g, '')
//                                         if (val.length <= 10) setPhone(val)
//                                     }}
//                                     required
//                                     className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
//                                 />
//                             </div>

//                             <div className="flex items-center justify-end gap-2 pt-2">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsOpen(false)}
//                                     className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                                             <span>Saving...</span>
//                                         </>
//                                     ) : (
//                                         <span>Save Changes</span>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </>
//     )
// }

'use client'

import { useState } from "react"
import { Pencil, Loader2, X } from "lucide-react"
import { updateMember } from "@/app/actions/members"
import PhotoUpload from "./PhotoUpload" // 🟢 PhotoUpload component import kiya

type EditMemberModalProps = {
    member: {
        id: string
        full_name: string
        phone: string
        email?: string | null
        gender?: string | null
        photo_url?: string | null
    }
}

export default function EditMemberModal({ member }: EditMemberModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    // Form States
    const [fullName, setFullName] = useState(member.full_name || '')
    const [phone, setPhone] = useState(member.phone || '')
    const [email, setEmail] = useState(member.email || '')
    const [gender, setGender] = useState(member.gender || 'male')
    
    // Photo state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('full_name', fullName)
        formData.append('phone', phone)
        formData.append('email', email)
        formData.append('gender', gender)
        
        // Agar nayi photo select/capture ki hai toh append karein
        if (selectedFile) {
            formData.append('photo', selectedFile)
        }
        if (member.photo_url) {
            formData.append('existing_photo_url', member.photo_url)
        }

        try {
            await updateMember(member.id, formData)
            setIsLoading(false)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to update member:', error)
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Edit Member Details"
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-all cursor-pointer"
            >
                <Pencil className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="text-left">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Edit Member Profile
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Update details for {member.full_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 pt-3 my-1 flex-1 text-left">
                            
                            {/* 🟢 Integrated PhotoUpload Component */}
                            <PhotoUpload 
                                onImageSelected={(file) => setSelectedFile(file)} 
                            />

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Full Name *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Phone Number *</label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        if (val.length <= 10) setPhone(val)
                                    }}
                                    required
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="male" className="bg-white dark:bg-slate-900">Male</option>
                                    <option value="female" className="bg-white dark:bg-slate-900">Female</option>
                                    <option value="other" className="bg-white dark:bg-slate-900">Other</option>
                                </select>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}