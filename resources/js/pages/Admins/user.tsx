import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { Eye, Lock, Trash2, Unlock } from 'lucide-react'
import { useState } from 'react'
import { BreadcrumbItem, User } from '@/types'
import AddNewAdmin from '@/components/Admin/add-new-admin'
import { getFullName } from '@/lib/utils'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface Props {
    users: User[];
    auth: {
        user: {
            id: number;
        };
    };
}

const Users = ({ users, auth }: Props) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleDeleteUser = (user: User) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${user.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">User Management</h1>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{getFullName(user)}</TableCell>
                                    <TableCell>{user.position}</TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="View User Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                                disabled={!user.is_active && user.id === auth.user.id}
                                            >
                                                {user.is_active ? (
                                                    <Lock className="h-4 w-4" />
                                                ) : (
                                                    <Unlock className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteUser(user)}
                                                title="Delete User"
                                                disabled={user.id === auth.user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </AppLayout>
    )
}

export default Users