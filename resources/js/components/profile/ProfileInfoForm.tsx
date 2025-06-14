import React from 'react';
import { Input } from '@/components/ui/input';

interface Props {
    data: any;
    errors: any;
    processing: boolean;
    onChange: (field: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ProfileInfoForm: React.FC<Props> = ({ data, errors, processing, onChange, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <Input type="text" value={data.first_name} onChange={e => onChange('first_name', e.target.value)} required />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <Input type="text" value={data.last_name} onChange={e => onChange('last_name', e.target.value)} required />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <Input type="text" value={data.middle_name} onChange={e => onChange('middle_name', e.target.value)} />
                {errors.middle_name && <p className="mt-1 text-sm text-red-600">{errors.middle_name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Suffix</label>
                <Input type="text" value={data.suffix} onChange={e => onChange('suffix', e.target.value)} />
                {errors.suffix && <p className="mt-1 text-sm text-red-600">{errors.suffix}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select value={data.gender} onChange={e => onChange('gender', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <Input type="text" value={data.position} onChange={e => onChange('position', e.target.value)} required />
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input type="email" value={data.email} onChange={e => onChange('email', e.target.value)} required />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
        </div>
        <div className="flex justify-end">
            <button type="submit" disabled={processing} className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors duration-200 disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    </form>
);

export default ProfileInfoForm;
