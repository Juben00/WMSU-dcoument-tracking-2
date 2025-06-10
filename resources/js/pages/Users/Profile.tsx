import React from 'react';
import Navbar from '@/components/User/navbar';

const Profile = () => {
    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-3xl text-gray-500">👤</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
                            <p className="text-gray-600">Student ID: 2024-0001</p>
                            <p className="text-gray-600">john.doe@wmsu.edu.ph</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="john.doe@wmsu.edu.ph"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="+63 912 345 6789"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Course</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="Bachelor of Science in Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year Level</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="4th Year"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        value="College of Computing Studies"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors duration-200">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
