import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Pencil, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EditDepartment from '@/components/Departments/EditDepartment';
import type { Departments } from '@/types';
import AddDepartment from '@/components/Departments/AddDepartment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/departments',
    },
];

interface Props {
    departments: Departments[];
    auth: {
        user: {
            id: number;
        };
    };
}

export default function Departments({ departments, auth }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<Departments | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleDeleteOffice = (department: Departments) => {
        if (confirm('Are you sure you want to delete this office?')) {
            router.delete(route('departments.destroy', department.id), {
                onSuccess: () => {
                    toast.success('Department deleted successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to delete department. Please try again.');
                }
            });
        }
    };

    const handleViewOffice = (department: Departments) => {
        setSelectedOffice(department);
        setIsViewDialogOpen(true);
    };

    const handleEditOffice = (department: Departments) => {
        setSelectedOffice(department);
        setIsEditDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Departments Management</h1>
                            <p className="text-muted-foreground">
                                Manage all departments
                            </p>
                        </div>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                            </DialogHeader>
                            <AddDepartment setIsCreateDialogOpen={setIsCreateDialogOpen} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell>{department.name}</TableCell>
                                    <TableCell>{department.description}</TableCell>
                                    <TableCell>{department.type}</TableCell>
                                    <TableCell>{format(new Date(department.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewOffice(department)}
                                                title="View Department Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditOffice(department)}
                                                title="Edit Department"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteOffice(department)}
                                                title="Delete Department"
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

                {/* View Office Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Department Details</DialogTitle>
                        </DialogHeader>
                        {selectedOffice && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Department Name</Label>
                                    <p className="text-sm">{selectedOffice.name}</p>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <p className="text-sm">{selectedOffice.description}</p>
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <p className="text-sm capitalize">{selectedOffice.type}</p>
                                </div>
                                <div>
                                    <Label>Created At</Label>
                                    <p className="text-sm">{format(new Date(selectedOffice.created_at), 'MMMM d, yyyy h:mm a')}</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Office Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Department</DialogTitle>
                        </DialogHeader>
                        {selectedOffice && (
                            <EditDepartment
                                department={selectedOffice}
                                setIsEditDialogOpen={setIsEditDialogOpen}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
