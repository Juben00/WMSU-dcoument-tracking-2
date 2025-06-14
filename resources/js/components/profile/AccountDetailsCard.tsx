import React from 'react';
import { User } from '@/types';

interface Props {
    user: User;
}

const AccountDetailsCard: React.FC<Props> = ({ user }) => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto">
        <div className="flex items-center space-x-6 mb-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                    <span className="text-3xl text-gray-500">👤</span>
                )}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-600">ID: {user.id}</p>
                <p className="text-gray-600">{user.email}</p>
            </div>
        </div>
        <div className="space-y-2">
            <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Office:</span> {user.office?.name || 'Not assigned'}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></p>
            <p className="text-sm text-gray-600"><span className="font-medium">Email Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${user.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{user.email_verified_at ? 'Verified' : 'Unverified'}</span></p>
            <p className="text-sm text-gray-600"><span className="font-medium">Member since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
    </div>
);

export default AccountDetailsCard;
