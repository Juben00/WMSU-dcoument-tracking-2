import React from 'react';
import { Input } from '@/components/ui/input';

interface Props {
    data: any;
    errors: any;
    processing: boolean;
    onChange: (field: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ChangePasswordForm: React.FC<Props> = ({ data, errors, processing, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl mx-auto">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <Input type="password" value={data.current_password} onChange={e => onChange('current_password', e.target.value)} required />
                {errors.current_password && <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <Input type="password" value={data.password} onChange={e => onChange('password', e.target.value)} required />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <Input type="password" value={data.password_confirmation} onChange={e => onChange('password_confirmation', e.target.value)} required />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>
            <div className="text-sm text-gray-600 mb-4">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                </ul>
            </div>
        </div>
        <div className="flex justify-end">
            <button type="submit" disabled={processing} className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors duration-200 disabled:opacity-50">
                {processing ? 'Updating...' : 'Update Password'}
            </button>
        </div>
    </form>
);

export default ChangePasswordForm;
