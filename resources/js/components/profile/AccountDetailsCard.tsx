import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarDays, Mail, Shield, UserIcon, Building, CheckCircle, XCircle } from "lucide-react"
import type { User } from "@/types"

interface Props {
  user?: User | null
}

const AccountDetailsCard: React.FC<Props> = ({ user }) => {
  // Show a minimal placeholder (or skeleton component) while the user data loads
  if (!user) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading account details…</span>
      </div>
    )
  }

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
      {/* Profile Header Card */}
      <Card className="border-red-100 dark:border-red-900/30 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-red-100 dark:border-red-900/50 shadow-xl ring-4 ring-red-50 dark:ring-red-950/50">
                <AvatarImage src={user.avatar ?? "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-red-500 to-red-600 text-white">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-lg font-medium text-red-600 dark:text-red-400">{user.position}</p>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Badge
                    variant="outline"
                    className={`px-4 py-2 text-sm font-semibold border-2 ${
                      user.is_active
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Card */}
        <Card className="border-red-100 dark:border-red-900/30 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize mt-1">{user.role}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Department Card */}
        <Card className="border-red-100 dark:border-red-900/30 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {user.department?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Email Status Card */}
        <Card className="border-red-100 dark:border-red-900/30 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email Status
                </p>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1.5 text-sm font-semibold border-2 ${
                      user.email_verified_at
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                    }`}
                  >
                    {user.email_verified_at ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Member Since Card */}
        <Card className="border-red-100 dark:border-red-900/30 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Account Information Card */}
      <Card className="border-red-100 dark:border-red-900/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Account Information</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Full Name
                </span>
                <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {user.first_name} {user.middle_name} {user.last_name} {user.suffix}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gender
                </span>
                <span className="text-base font-medium text-gray-900 dark:text-gray-100 capitalize">{user.gender}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountDetailsCard
