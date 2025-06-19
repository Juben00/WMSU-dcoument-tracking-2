import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Mail, MapPin, Shield } from "lucide-react"
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
        <div className="space-y-6">
            <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback className="text-lg font-semibold bg-gray-200 text-gray-500">
                        {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                            {user.first_name} {user.last_name}
                        </h2>
                        <Badge
                            variant="outline"
                            className={`${user.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                        >
                            {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        <span className="text-sm">{user.email}</span>
                    </div>
                    <p className="text-sm text-gray-600">ID: {user.id}</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <Shield className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Role</p>
                            <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Office</p>
                            <p className="font-semibold text-gray-800">{user.office?.name || "Not assigned"}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <Mail className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Email Status</p>
                            <Badge
                                variant="outline"
                                className={`mt-1 ${user.email_verified_at ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                            >
                                {user.email_verified_at ? "Verified" : "Unverified"}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <CalendarDays className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Member Since</p>
                            <p className="font-semibold text-gray-800">{formatDate(user.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountDetailsCard