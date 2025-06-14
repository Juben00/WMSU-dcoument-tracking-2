import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Navbar from '@/components/User/navbar';
import { User } from '@/types';
import Tabs from '@/components/profile/Tabs';
import ProfileInfoForm from '@/components/profile/ProfileInfoForm';
import AccountDetailsCard from '@/components/profile/AccountDetailsCard';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';

interface Props {
    user: User;
}

interface ProfileFormData {
    [key: string]: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    gender: string;
    position: string;
    email: string;
}

interface PasswordFormData {
    [key: string]: string;
    current_password: string;
    password: string;
    password_confirmation: string;
}


const Profile = ({ user }: Props) => {
    const [activeTab, setActiveTab] = useState(0);

    const { data: profileData, setData: setProfileData, patch, processing: profileProcessing, errors: profileErrors } = useForm<ProfileFormData>({
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name || '',
        suffix: user.suffix || '',
        gender: user.gender,
        position: user.position,
        email: user.email,
    });

    const { data: passwordData, setData: setPasswordData, put, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm<PasswordFormData>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('users.profile'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile updated successfully',
                });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                });
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            onSuccess: () => {
                resetPassword();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password updated successfully',
                });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                });
            },
        });
    };

    return (
        <>
            <Head title="Profile Settings" />
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>
                <Tabs
                    tabs={["Account Details", "Profile Info", "Change Password"]}
                    current={activeTab}
                    onChange={setActiveTab}
                />
                <div className="bg-white rounded-lg shadow-md p-6">
                    {activeTab === 0 && (
                        <AccountDetailsCard user={user} />
                    )}
                    {activeTab === 1 && (
                        <ProfileInfoForm
                            data={profileData}
                            errors={profileErrors}
                            processing={profileProcessing}
                            onChange={setProfileData}
                            onSubmit={handleProfileSubmit}
                        />
                    )}
                    {activeTab === 2 && (
                        <ChangePasswordForm
                            data={passwordData}
                            errors={passwordErrors}
                            processing={passwordProcessing}
                            onChange={setPasswordData}
                            onSubmit={handlePasswordSubmit}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;
