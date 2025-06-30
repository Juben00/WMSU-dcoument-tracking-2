import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Mail, MapPin, Shield, User as UserIcon, Building } from "lucide-react"
import type { User } from "@/types"

interface Props {
    user: User
}

const AccountDetailsCard: React.FC<Props> = ({ user }) => {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-red-400 to-red-500 text-white">
                        {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                {user.first_name} {user.last_name}
                            </h2>
                            <p className="text-lg text-gray-600 mt-1">{user.position}</p>
                        </div>
                        <Badge
                            variant="outline"
                            className={`px-4 py-2 text-sm font-semibold ${user.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                        >
                            {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Mail className="mr-3 h-5 w-5" />
                        <span className="text-base">{user.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">ID: {user.id}</p>
                </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Account Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Role Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Role</p>
                                <p className="text-xl font-bold text-gray-900 capitalize mt-1">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Department Information */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg">
                                <Building className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Department</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{user.department?.name || "Not assigned"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Email Status */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email Status</p>
                                <div className="mt-2">
                                    <Badge
                                        variant="outline"
                                        className={`px-3 py-1.5 text-sm font-semibold ${user.email_verified_at ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                                    >
                                        {user.email_verified_at ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
                                <CalendarDays className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Member Since</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg">
                        <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Account Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-3">
                        <span className="font-semibold text-blue-800">Full Name:</span>
                        <span className="text-blue-900">{user.first_name} {user.middle_name} {user.last_name} {user.suffix}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="font-semibold text-blue-800">Gender:</span>
                        <span className="text-blue-900 capitalize">{user.gender}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountDetailsCard
