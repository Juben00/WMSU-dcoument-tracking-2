import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, User, Mail, Calendar, MapPin } from "lucide-react"

interface ProfileFormData {
    first_name: string
    last_name: string
    middle_name: string
    suffix: string
    gender: string
    position: string
    email: string
}

interface Props {
    data: ProfileFormData
    errors: Partial<Record<keyof ProfileFormData, string>>
    processing: boolean
    onChange: (field: keyof ProfileFormData, value: string) => void
    onSubmit: (e: React.FormEvent) => void
}

const ProfileInfoForm: React.FC<Props> = ({ data, errors, processing, onChange, onSubmit }) => {
    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        onChange(field, value)
    }

    return (
        <div className="w-full mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Personal Information</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Update your personal information and professional details.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Basic Information</h3>
                    </div>

                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                First Name <span className="text-red-600 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={(e) => handleInputChange("first_name", e.target.value)}
                                className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.first_name ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                                placeholder="Enter your first name"
                                required
                            />
                            {errors.first_name && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.first_name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Last Name <span className="text-red-600 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={(e) => handleInputChange("last_name", e.target.value)}
                                className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.last_name ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                                placeholder="Enter your last name"
                                required
                            />
                            {errors.last_name && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.last_name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Name & Suffix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                            <Label htmlFor="middle_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Middle Name
                            </Label>
                            <Input
                                id="middle_name"
                                value={data.middle_name}
                                onChange={(e) => handleInputChange("middle_name", e.target.value)}
                                className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.middle_name ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                                placeholder="Enter your middle name"
                            />
                            {errors.middle_name && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.middle_name}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="suffix" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Suffix
                            </Label>
                            <Input
                                id="suffix"
                                value={data.suffix}
                                onChange={(e) => handleInputChange("suffix", e.target.value)}
                                className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.suffix ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                                placeholder="Jr., Sr., III, etc."
                            />
                            {errors.suffix && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.suffix}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Professional Information</h3>
                    </div>

                    {/* Gender & Position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="gender" className="text-sm font-semibold text-red-800 dark:text-red-200">
                                Gender <span className="text-red-600 dark:text-red-400">*</span>
                            </Label>
                            <Select value={data.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                                <SelectTrigger className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${errors.gender ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}>
                                    <SelectValue placeholder="Select your gender" className="dark:text-gray-400" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                                    <SelectItem value="Male" className="dark:text-gray-100 dark:hover:bg-gray-700">Male</SelectItem>
                                    <SelectItem value="Female" className="dark:text-gray-100 dark:hover:bg-gray-700">Female</SelectItem>
                                    <SelectItem value="Other" className="dark:text-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                                    <SelectItem value="Prefer not to say" className="dark:text-gray-100 dark:hover:bg-gray-700">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.gender}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="position" className="text-sm font-semibold text-red-800 dark:text-red-200">
                                Position <span className="text-red-600 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => handleInputChange("position", e.target.value)}
                                className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.position ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                                placeholder="Enter your position"
                                required
                            />
                            {errors.position && (
                                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.position}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Contact Information</h3>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-red-800 dark:text-red-200">
                            Email Address <span className="text-red-600 dark:text-red-400">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : "focus:border-red-500 focus:ring-red-200 dark:focus:border-red-400 dark:focus:ring-red-800"}`}
                            placeholder="Enter your email address"
                            required
                        />
                        {errors.email && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                {errors.email}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="min-w-[160px] h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ProfileInfoForm
