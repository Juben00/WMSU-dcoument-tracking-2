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
} from 'lucide-react';

const statCards = [
    {
        key: 'totalDocuments',
        label: 'Total Documents',
        icon: <FileText className="text-4xl text-red-700" />,
        color: 'text-red-700',
        bg: 'bg-red-50',
    },
    {
        key: 'pendingDocuments',
        label: 'Pending Documents',
        icon: <Hourglass className="text-4xl text-yellow-600" />,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
    },
    {
        key: 'completedDocuments',
        label: 'Completed Documents',
        icon: <CheckCircle className="text-4xl text-green-600" />,
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        key: 'publishedDocuments',
        label: 'Published Documents',
        icon: <Globe className="text-4xl text-blue-600" />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
]

const statusIcon = {
    approved: <CheckCircle className="text-green-600" />,
    rejected: <XCircle className="text-red-600" />,
    pending: <Hourglass className="text-yellow-600" />,
    forwarded: <FileSignature className="text-blue-600" />,
    returned: <Clock className="text-gray-500" />,
}

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Dashboard</h1>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {statCards.map(card => (
                        <div key={card.key} className={`rounded-2xl shadow-lg p-8 flex flex-col items-center ${card.bg} transition-transform hover:scale-105`}>
                            {card.icon}
                            <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">{card.label}</h3>
                            {loading ? (
                                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
                            ) : (
                                <p className={`text-4xl font-bold ${card.color}`}>{stats?.[card.key]}</p>
                            )}
                        </div>
                    ))}
                </div>
                {/* Recent Activities */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="text-blue-500" /> Recent Activities
                    </h2>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg animate-pulse">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full mr-4" />
                                    <div className="flex-1">
                                        <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                                        <div className="h-3 w-1/4 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : stats?.recentActivities?.length ? (
                            stats.recentActivities.map((activity: any, idx: number) => (
                                <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="mr-4 text-2xl">
                                        {statusIcon[activity.status as keyof typeof statusIcon] || <FileText className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                            Document #{activity.document_id}: {activity.title}
                                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700 capitalize">{activity.status}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            {activity.comments && <span className="italic text-gray-500">"{activity.comments}"</span>}
                                            <span className="ml-auto">{activity.responded_at ? new Date(activity.responded_at).toLocaleString() : ''}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center py-8">No recent activities found.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
