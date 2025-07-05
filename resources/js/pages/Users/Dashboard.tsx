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
        icon: <FileText className="text-4xl text-red-600" />,
        color: 'text-red-600',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:border-red-300 dark:hover:border-red-700',
    },
    {
        key: 'pendingDocuments',
        label: 'Pending Documents',
        icon: <Hourglass className="text-4xl text-red-600" />,
        color: 'text-red-600',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:border-red-300 dark:hover:border-red-700',
    },
    {
        key: 'completedDocuments',
        label: 'Completed Documents',
        icon: <CheckCircle className="text-4xl text-red-600" />,
        color: 'text-red-600',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:border-red-300 dark:hover:border-red-700',
    },
    {
        key: 'publishedDocuments',
        label: 'Published Documents',
        icon: <Globe className="text-4xl text-red-600" />,
        color: 'text-red-600',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:border-red-300 dark:hover:border-red-700',
    },
]

const statusIcon = {
    approved: <CheckCircle className="text-red-600" />,
    rejected: <XCircle className="text-red-600" />,
    pending: <Hourglass className="text-red-600" />,
    forwarded: <FileSignature className="text-red-600" />,
    returned: <Clock className="text-red-600" />,
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        case 'returned':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
        case 'in_review':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
};

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])

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

    useEffect(() => {
        fetch('/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(() => setNotifications([]))
    }, [])

    return (
        <>
            <Navbar notifications={notifications} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor your document activities and statistics</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {statCards.map(card => (
                            <div key={card.key} className={`rounded-2xl shadow-lg p-8 flex flex-col items-center ${card.bg} border ${card.border} ${card.hover} transition-all duration-200 hover:scale-105 hover:shadow-xl`}>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">{card.label}</h3>
                                {loading ? (
                                    <div className="h-12 w-24 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-lg" />
                                ) : (
                                    <p className={`text-4xl font-bold ${card.color}`}>{stats?.[card.key] || 0}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 animate-pulse">
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full mr-4" />
                                            <div className="flex-1">
                                                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-3" />
                                                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-500 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : stats?.recentActivities?.length ? (
                                    stats.recentActivities.map((activity: any, idx: number) => (
                                        <div key={idx} className="flex items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md">
                                            <div className="mr-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                                <div className="text-2xl">
                                                    {statusIcon[activity.status as keyof typeof statusIcon] || <FileText className="text-gray-400" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                                        Order No. {activity.order_number} : {activity.subject}
                                                    </p>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No recent activities found.</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Your document activities will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    {!loading && stats && (
                        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Overview</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Completion Rate</span>
                                            <CheckCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.completedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            {stats.completedDocuments} of {stats.totalDocuments} documents completed
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Publication Rate</span>
                                            <Globe className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.publishedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            {stats.publishedDocuments} documents published publicly
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Pending Items</span>
                                            <Hourglass className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                                            {stats.pendingDocuments}
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
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
