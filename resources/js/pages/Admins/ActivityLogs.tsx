import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Logs',
        href: '/Admins/activity-logs',
    },
];

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    description: string;
    ip_address: string;
    created_at: string;
    user: User;
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: any[];
}

interface Props {
    logs: PaginatedLogs;
    filters: {
        user_id: string;
        action: string;
        date_from: string;
        date_to: string;
    };
    users: User[];
}

const actions = [
    'login',
    'logout',
    'user_created',
    'user_updated',
    'user_deleted',
    'department_created',
    'department_updated',
    'department_deleted',
    'document_created',
    'document_updated',
    'document_deleted',
    'document_sent',
];

export default function ActivityLogs({ logs, filters, users }: Props) {
    const [localFilters, setLocalFilters] = useState({
        user_id: filters.user_id || '',
        action: filters.action || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilterChange = (name: string, value: string) => {
        const newFilters = { ...localFilters, [name]: value };
        setLocalFilters(newFilters);

        // Remove empty filters
        const params: any = {};
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val) params[key] = val;
        });

        router.get('/Admin/activity-logs', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        const params: any = { page };
        Object.entries(localFilters).forEach(([key, val]) => {
            if (val) params[key] = val;
        });

        router.get('/Admin/activity-logs', params, {
            preserveState: true,
            replace: true,
        });
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                        <p className="text-muted-foreground">
                            Monitor user activities and system events
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">User</Label>
                            <Select
                                value={localFilters.user_id || "all"}
                                onValueChange={(value) => handleFilterChange('user_id', value === "all" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.first_name} {user.last_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="action">Action</Label>
                            <Select
                                value={localFilters.action || "all"}
                                onValueChange={(value) => handleFilterChange('action', value === "all" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {actions.map(action => (
                                        <SelectItem key={action} value={action}>
                                            {formatAction(action)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_from">From Date</Label>
                            <Input
                                type="date"
                                name="date_from"
                                value={localFilters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_to">To Date</Label>
                            <Input
                                type="date"
                                name="date_to"
                                value={localFilters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {logs && logs.data && logs.data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Date/Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {log.user ? `${log.user.first_name} ${log.user.last_name}` : `User ID: ${log.user_id}`}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                {formatAction(log.action)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate" title={log.description}>
                                            {log.description}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {log.ip_address}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Card className="p-6">
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No activity logs found.</p>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {logs && logs.data && logs.data.length > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                            Showing {((logs.current_page - 1) * logs.per_page) + 1} to {Math.min(logs.current_page * logs.per_page, logs.total)} of {logs.total} results
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={logs.current_page === 1}
                                onClick={() => handlePageChange(logs.current_page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                disabled={logs.current_page === logs.last_page}
                                onClick={() => handlePageChange(logs.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
