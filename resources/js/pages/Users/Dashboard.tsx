import Navbar from '@/components/User/navbar'
import React, { useEffect, useState } from 'react'
import {
    FileText,
    Hourglass,
    CheckCircle,
    XCircle,
    FileSignature,
    Clock,
    Globe,
    BarChart3,
    TrendingUp,
    Activity,
} from 'lucide-react';

const statCards = [
    {
        key: 'totalDocuments',
        label: 'Total Documents',
        icon: <FileText className="text-4xl text-red-700" />,
        color: 'text-red-700',
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        hover: 'hover:border-red-300',
    },
    {
        key: 'pendingDocuments',
        label: 'Pending Documents',
        icon: <Hourglass className="text-4xl text-yellow-600" />,
        color: 'text-yellow-600',
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        hover: 'hover:border-yellow-300',
    },
    {
        key: 'completedDocuments',
        label: 'Completed Documents',
        icon: <CheckCircle className="text-4xl text-green-600" />,
        color: 'text-green-600',
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        hover: 'hover:border-green-300',
    },
    {
        key: 'publishedDocuments',
        label: 'Published Documents',
        icon: <Globe className="text-4xl text-blue-600" />,
        color: 'text-blue-600',
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        hover: 'hover:border-blue-300',
    },
]

const statusIcon = {
    approved: <CheckCircle className="text-green-600" />,
    rejected: <XCircle className="text-red-600" />,
    pending: <Hourglass className="text-yellow-600" />,
    forwarded: <FileSignature className="text-blue-600" />,
    returned: <Clock className="text-gray-500" />,
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'returned':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'in_review':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch('/dashboard/data')
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-600 mt-1">Monitor your document activities and statistics</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {statCards.map(card => (
                            <div key={card.key} className={`rounded-2xl shadow-lg p-8 flex flex-col items-center ${card.bg} border ${card.border} ${card.hover} transition-all duration-200 hover:scale-105 hover:shadow-xl`}>
                                <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">{card.label}</h3>
                                {loading ? (
                                    <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-lg" />
                                ) : (
                                    <p className={`text-4xl font-bold ${card.color}`}>{stats?.[card.key] || 0}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="h-10 w-10 bg-gray-200 rounded-full mr-4" />
                                            <div className="flex-1">
                                                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
                                                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : stats?.recentActivities?.length ? (
                                    stats.recentActivities.map((activity: any, idx: number) => (
                                        <div key={idx} className="flex items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                                            <div className="mr-4 p-2 bg-white rounded-lg shadow-sm">
                                                <div className="text-2xl">
                                                    {statusIcon[activity.status as keyof typeof statusIcon] || <FileText className="text-gray-400" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold text-gray-900 text-lg">
                                                        Document #{activity.document_id}: {activity.title}
                                                    </p>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    {activity.comments && (
                                                        <p className="text-sm text-gray-600 italic">
                                                            "{activity.comments}"
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {activity.responded_at ? new Date(activity.responded_at).toLocaleString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium text-lg">No recent activities found.</p>
                                        <p className="text-gray-400 text-sm mt-2">Your document activities will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    {!loading && stats && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Performance Overview</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-emerald-700">Completion Rate</span>
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-emerald-800">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.completedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-emerald-600 mt-1">
                                            {stats.completedDocuments} of {stats.totalDocuments} documents completed
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-blue-700">Publication Rate</span>
                                            <Globe className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-blue-800">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.publishedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            {stats.publishedDocuments} documents published publicly
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-amber-700">Pending Items</span>
                                            <Hourglass className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-amber-800">
                                            {stats.pendingDocuments}
                                        </p>
                                        <p className="text-sm text-amber-600 mt-1">
                                            Documents awaiting action
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Dashboard
