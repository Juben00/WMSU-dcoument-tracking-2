import Navbar from '@/components/User/navbar'
import React from 'react'

const Home = () => {
    return (
        <>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Documents</h3>
                        <p className="text-3xl font-bold text-red-700">24</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Documents</h3>
                        <p className="text-3xl font-bold text-yellow-600">5</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed Documents</h3>
                        <p className="text-3xl font-bold text-green-600">19</p>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">Document #1234 was approved</p>
                                <p className="text-sm text-gray-600">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">New document submitted</p>
                                <p className="text-sm text-gray-600">5 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">Document #1233 was rejected</p>
                                <p className="text-sm text-gray-600">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
