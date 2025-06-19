import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Check } from "lucide-react"

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
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="font-semibold text-gray-500">Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current_password">
            Current Password <span className="text-red-600">*</span>
          </Label>
          <Input
            id="current_password"
            type="password"
            value={data.current_password}
            onChange={(e) => onChange("current_password", e.target.value)}
            className={errors.current_password ? "border-red-500" : ""}
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
        <div className="space-y-2">
          <Label htmlFor="password">
            New Password <span className="text-red-600">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => onChange("password", e.target.value)}
            className={errors.password ? "border-red-500" : ""}
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
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">
            Confirm New Password <span className="text-red-600">*</span>
          </Label>
          <Input
            id="password_confirmation"
            type="password"
            value={data.password_confirmation}
            onChange={(e) => onChange("password_confirmation", e.target.value)}
            className={errors.password_confirmation ? "border-red-500" : ""}
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

        {/* Password Requirements */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Password Requirements:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              At least one uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              At least one lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              At least one number
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              At least one special character
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={processing} className="min-w-[160px] bg-red-700 hover:bg-red-800 text-white">
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
