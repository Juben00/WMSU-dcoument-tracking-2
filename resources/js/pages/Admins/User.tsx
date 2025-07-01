import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Plus, Trash2, Lock, Unlock, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AddNewAdmin from '@/components/Admin/AddAdmin';
import EditAdmin from '@/components/Admin/EditAdmin';
import { Admin } from '@/types';
import { getFullName } from '@/lib/utils';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admins',
        href: '/admins',
    },
];


interface Props {
    admins: Admin[];
    departments: {
        id: number;
        name: string;
        description: string;
        type: 'office' | 'college';
    }[];
    auth: {
        user: {
            id: number;
        };
    };
}

export default function Admins({ admins, departments, auth }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleToggleStatus = (admin: Admin) => {
        const action = admin.is_active ? 'deactivate' : 'activate';
        Swal.fire({
            title: 'Are you sure?',
            text: `You won\'t be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admins.toggle-status', admin.id), {}, {
                    onSuccess: () => {
                        toast.success(`Admin ${action}d successfully`);
                        router.reload({ only: ['admins'] });
                    },
                    onError: (errors) => {
                        toast.error(`Failed to ${action} admin. Please try again.`);
                    }
                });
            }
        });
    };

    const handleDeleteAdmin = (admin: Admin) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admins.destroy', admin.id), {
                    onSuccess: () => {
                        toast.success('Admin deleted successfully');
                        router.reload({ only: ['admins'] });
                    },
                    onError: (errors) => {
                        toast.error('Failed to delete admin. Please try again.');
                    }
                });
            }
        });
    };

    const handleViewAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsViewDialogOpen(true);
    };

    const handleEditAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsEditDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                            <p className="text-muted-foreground">
                                Manage all users
                            </p>
                        </div>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create User
                            </Button>
                        </DialogTrigger>
                        <AddNewAdmin setIsCreateDialogOpen={setIsCreateDialogOpen} departments={departments} />
                    </Dialog>
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
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell>{getFullName(admin)}</TableCell>
                                    <TableCell>{admin.position}</TableCell>
                                    <TableCell>{admin.department?.name || 'N/A'}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {admin.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{format(new Date(admin.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewAdmin(admin)}
                                                title="View Admin Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditAdmin(admin)}
                                                title="Edit Admin"
                                                disabled={admin.id === auth.user.id}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleStatus(admin)}
                                                title={admin.is_active ? 'Deactivate Admin' : 'Activate Admin'}
                                                disabled={!admin.is_active && admin.id === auth.user.id}
                                            >
                                                {admin.is_active ? (
                                                    <Lock className="h-4 w-4" />
                                                ) : (
                                                    <Unlock className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteAdmin(admin)}
                                                title="Delete Admin"
                                                disabled={admin.id === auth.user.id}
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

                {/* Admin Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Admin Details</DialogTitle>
                        </DialogHeader>
                        {selectedAdmin && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>First Name</Label>
                                        <p className="text-sm">{selectedAdmin.first_name}</p>
                                    </div>
                                    <div>
                                        <Label>Last Name</Label>
                                        <p className="text-sm">{selectedAdmin.last_name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Middle Name</Label>
                                        <p className="text-sm">{selectedAdmin.middle_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label>Suffix</Label>
                                        <p className="text-sm">{selectedAdmin.suffix || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Gender</Label>
                                        <p className="text-sm">{selectedAdmin.gender}</p>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <p className="text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${selectedAdmin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {selectedAdmin.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label>Department</Label>
                                    <p className="text-sm">{selectedAdmin.department?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label>Position</Label>
                                    <p className="text-sm">{selectedAdmin.position}</p>
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <p className="text-sm">{selectedAdmin.email}</p>
                                </div>
                                <div>
                                    <Label>Created At</Label>
                                    <p className="text-sm">{format(new Date(selectedAdmin.created_at), 'MMMM d, yyyy h:mm a')}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Admin Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Admin</DialogTitle>
                        </DialogHeader>
                        {selectedAdmin && (
                            <EditAdmin
                                admin={selectedAdmin}
                                departments={departments}
                                setIsEditDialogOpen={setIsEditDialogOpen}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}