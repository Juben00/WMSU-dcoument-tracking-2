import React from 'react';
import { User } from '@/types';
import {
    UserCircle,
    Mail,
    BadgeInfo,
    UserCog,
    Building2,
    CheckCircle,
    XCircle,
    Calendar,
} from 'lucide-react';

interface Props {
    user: User;
}

const AccountDetailsCard: React.FC<Props> = ({ user }) => (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg p-8 max-w-xl mx-auto transition-shadow hover:shadow-2xl">
        <div className="flex items-center space-x-8 mb-8">
            <div className="relative h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center shadow-md border-4 border-white">
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                    <UserCircle className="text-gray-300" size={96} />
                )}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1"><BadgeInfo className="text-gray-400" size={18} /> ID: {user.id}</p>
                <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail className="text-gray-400" size={18} /> {user.email}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
                <UserCog className="text-blue-400" size={18} />
                <span className="font-medium">Role:</span>
                <span className="ml-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="text-purple-400" size={18} />
                <span className="font-medium">Office:</span>
                <span className="ml-1">{user.office?.name || 'Not assigned'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                {user.is_active ? (
                    <CheckCircle className="text-green-500" size={18} />
                ) : (
                    <XCircle className="text-red-500" size={18} />
                )}
                <span className="font-medium">Status:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                {user.email_verified_at ? (
                    <CheckCircle className="text-green-500" size={18} />
                ) : (
                    <XCircle className="text-yellow-500" size={18} />
                )}
                <span className="font-medium">Email Status:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${user.email_verified_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.email_verified_at ? 'Verified' : 'Unverified'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 col-span-1 sm:col-span-2">
                <Calendar className="text-pink-400" size={18} />
                <span className="font-medium">Member since:</span>
                <span className="ml-1">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
);

export default AccountDetailsCard;
