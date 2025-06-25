import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Users,
    FileText,
    Building2,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserCheck,
    UserX,
    Shield,
    User,
    Activity,
    Calendar
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        users: {
            total: number;
            active: number;
            inactive: number;
            admins: number;
            regular: number;
        };
        documents: {
            total: number;
            draft: number;
            pending: number;
            in_review: number;
            approved: number;
            rejected: number;
            returned: number;
            cancelled: number;
            public: number;
        };
        departments: {
            total: number;
            with_users: number;
        };
    };
    recentActivities: Array<{
        id: number;
        document_title: string;
        document_owner: string;
        recipient: string;
        status: string;
        comments: string;
        responded_at: string;
        created_at: string;
    }>;
    monthlyTrends: Array<{
        month: string;
        count: number;
    }>;
    topDepartments: Array<{
        id: number;
        name: string;
        user_count: number;
        document_count: number;
    }>;
    statusDistribution: Record<string, number>;
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        department: string;
        is_active: boolean;
        created_at: string;
    }>;
}

export default function Dashboard({
    stats,
    recentActivities,
    monthlyTrends,
    topDepartments,
    statusDistribution,
    recentUsers
}: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'returned':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'user':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of system statistics and recent activities
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Users Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.users.active} active, {stats.users.inactive} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.documents.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.documents.public} public documents
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.departments.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.departments.with_users} with users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.documents.pending}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.documents.in_review} in review
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Active Users</span>
                                </div>
                                <Badge variant="secondary">{stats.users.active}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserX className="h-4 w-4 text-red-600" />
                                    <span className="text-sm">Inactive Users</span>
                                </div>
                                <Badge variant="secondary">{stats.users.inactive}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">Admins</span>
                                </div>
                                <Badge variant="secondary">{stats.users.admins}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">Regular Users</span>
                                </div>
                                <Badge variant="secondary">{stats.users.regular}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Document Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Approved</span>
                                </div>
                                <Badge variant="secondary">{stats.documents.approved}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm">Rejected</span>
                                </div>
                                <Badge variant="secondary">{stats.documents.rejected}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm">Returned</span>
                                </div>
                                <Badge variant="secondary">{stats.documents.returned}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Cancelled</span>
                                </div>
                                <Badge variant="secondary">{stats.documents.cancelled}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Document Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {monthlyTrends.slice(-3).map((trend, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{trend.month}</span>
                                        <Badge variant="outline">{trend.count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Offices and Recent Users */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Offices */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Top Departments by Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Documents</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topDepartments.map((department) => (
                                        <TableRow key={department.id}>
                                            <TableCell className="font-medium">{department.name}</TableCell>
                                            <TableCell>{department.user_count}</TableCell>
                                            <TableCell>{department.document_count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Recent Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.department}</p>
                                            </div>
                                        </div>
                                        <Badge className={getRoleColor(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activities
                        </CardTitle>
                        <CardDescription>
                            Latest document activities and responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivities.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="font-medium">
                                            {activity.document_title}
                                        </TableCell>
                                        <TableCell>{activity.document_owner}</TableCell>
                                        <TableCell>{activity.recipient}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(activity.status)}>
                                                {activity.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(activity.responded_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
