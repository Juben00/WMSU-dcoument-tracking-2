import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Check, Lock, Shield, Key } from "lucide-react"

interface PasswordFormData {
    current_password: string
    password: string
    password_confirmation: string
}

interface Props {
    data: PasswordFormData
    errors: Partial<Record<keyof PasswordFormData, string>>
    processing: boolean
    onChange: (field: keyof PasswordFormData, value: string) => void
    onSubmit: (e: React.FormEvent) => void
}

const ChangePasswordForm: React.FC<Props> = ({ data, errors, processing, onChange, onSubmit }) => {
    return (
        <div className="w-full mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                </div>
                <p className="text-gray-600 font-medium">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                {/* Password Fields Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg">
                            <Key className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Password Information</h3>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-3 mb-6">
                        <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">
                            Current Password <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="current_password"
                            type="password"
                            value={data.current_password}
                            onChange={(e) => onChange("current_password", e.target.value)}
                            className={`h-12 ${errors.current_password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "focus:border-blue-500 focus:ring-blue-200"}`}
                            placeholder="Enter your current password"
                            required
                        />
                        {errors.current_password && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {errors.current_password}
                            </div>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-3 mb-6">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                            New Password <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => onChange("password", e.target.value)}
                            className={`h-12 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "focus:border-blue-500 focus:ring-blue-200"}`}
                            placeholder="Enter your new password"
                            required
                        />
                        {errors.password && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-3">
                        <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                            Confirm New Password <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => onChange("password_confirmation", e.target.value)}
                            className={`h-12 ${errors.password_confirmation ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "focus:border-blue-500 focus:ring-blue-200"}`}
                            placeholder="Confirm your new password"
                            required
                        />
                        {errors.password_confirmation && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {errors.password_confirmation}
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Requirements Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-900">Password Requirements</h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-emerald-800 font-medium">Your password must meet the following criteria:</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                At least 8 characters long
                            </li>
                            <li className="flex items-center gap-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                At least one uppercase letter (A-Z)
                            </li>
                            <li className="flex items-center gap-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                At least one lowercase letter (a-z)
                            </li>
                            <li className="flex items-center gap-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                At least one number (0-9)
                            </li>
                            <li className="flex items-center gap-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                </div>
                                At least one special character (!@#$%^&*)
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="min-w-[180px] h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ChangePasswordForm
