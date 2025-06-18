import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="font-semibold text-gray-500">Update your personal information and professional details.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name <span className="text-red-600">*</span></Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              className={errors.first_name ? "border-red-500" : ""}
              placeholder="Enter your first name"
              required
            />
            {errors.first_name && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.first_name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name <span className="text-red-600">*</span></Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              className={errors.last_name ? "border-red-500" : ""}
              placeholder="Enter your last name"
              required
            />
            {errors.last_name && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.last_name}
              </div>
            )}
          </div>
        </div>

        {/* Middle Name & Suffix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              value={data.middle_name}
              onChange={(e) => handleInputChange("middle_name", e.target.value)}
              className={errors.middle_name ? "border-red-500" : ""}
              placeholder="Enter your middle name"
            />
            {errors.middle_name && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.middle_name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              value={data.suffix}
              onChange={(e) => handleInputChange("suffix", e.target.value)}
              className={errors.suffix ? "border-red-500" : ""}
              placeholder="Jr., Sr., III, etc."
            />
            {errors.suffix && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.suffix}
              </div>
            )}
          </div>
        </div>

        {/* Gender & Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-red-600">*</span></Label>
            <Select value={data.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.gender}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position <span className="text-red-600">*</span></Label>
            <Input
              id="position"
              value={data.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className={errors.position ? "border-red-500" : ""}
              placeholder="Enter your position"
              required
            />
            {errors.position && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.position}
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
            placeholder="Enter your email address"
            required
          />
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={processing} className="min-w-[140px] bg-red-700 hover:bg-red-800 text-white">
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
