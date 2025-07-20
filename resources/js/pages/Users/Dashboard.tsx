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
    Users,
} from 'lucide-react';
import TabHeader from '@/components/User/tab-header';

const statCards = [
    {
        key: 'totalDocuments',
        label: 'Total Documents',
        icon: <FileText className="w-6 h-6 text-white" />,
        color: 'text-gray-900 dark:text-white',
        bg: 'bg-gray-100 dark:bg-gray-700',
        iconBg: 'bg-red-500',
    },
    {
        key: 'pendingDocuments',
        label: 'Pending Documents',
        icon: <Hourglass className="w-6 h-6 text-white" />,
        color: 'text-gray-900 dark:text-white',
        bg: 'bg-gray-100 dark:bg-gray-700',
        iconBg: 'bg-red-500',
    },
    {
        key: 'completedDocuments',
        label: 'Completed Documents',
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        color: 'text-gray-900 dark:text-white',
        bg: 'bg-gray-100 dark:bg-gray-700',
        iconBg: 'bg-red-500',
    },
    {
        key: 'publishedDocuments',
        label: 'Published Documents',
        icon: <Globe className="w-6 h-6 text-white" />,
        color: 'text-gray-900 dark:text-white',
        bg: 'bg-gray-100 dark:bg-gray-700',
        iconBg: 'bg-red-500',
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <TabHeader title="Dashboard" description="Monitor your document activities and statistics" />
                        </div>
                    </div>
                    {/* Main Dashboard Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="p-6">
                            {/* Header */}
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map(card => (
                                    <div key={card.key} className={`${card.bg} rounded-lg p-4 flex items-center gap-3`}>
                                        <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            {card.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-red-700 font-medium text-sm">{card.label}</p>
                                            {loading ? (
                                                <div className="h-6 w-8 bg-gray-200 dark:bg-gray-600 animate-pulse rounded mt-1" />
                                            ) : (
                                                <p className={`text-2xl font-bold ${card.color}`}>{stats?.[card.key] || 0}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-lg mr-4" />
                                            <div className="flex-1">
                                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                                                <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-500 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : stats?.recentActivities?.length ? (
                                    stats.recentActivities.map((activity: any, idx: number) => (
                                        <div key={idx} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                                                <div className="text-lg">
                                                    {statusIcon[activity.status as keyof typeof statusIcon] || <FileText className="text-gray-400" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                        Order No. {activity.order_number} : {activity.subject}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)} flex-shrink-0`}>
                                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {activity.created_at ? new Date(activity.created_at).toLocaleString() : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <Activity className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activities found.</p>
                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your document activities will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Performance Overview Card */}
                    {!loading && stats && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Overview</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-red-700">Completion Rate</span>
                                            <CheckCircle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.completedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {stats.completedDocuments} of {stats.totalDocuments} documents completed
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-red-700">Publication Rate</span>
                                            <Globe className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.totalDocuments > 0
                                                ? Math.round((stats.publishedDocuments / stats.totalDocuments) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {stats.publishedDocuments} documents published publicly
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-red-700">Pending Items</span>
                                            <Hourglass className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.pendingDocuments}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
