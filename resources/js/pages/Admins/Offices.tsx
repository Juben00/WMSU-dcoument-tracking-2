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
import AddNewOffice from '@/components/Offices/add-new-office';
import EditOffice from '@/components/Offices/edit-office';
import { Office } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Offices',
        href: '/offices',
    },
];

interface Props {
    offices: Office[];
    auth: {
        user: {
            id: number;
        };
    };
}

export default function Offices({ offices, auth }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleDeleteOffice = (office: Office) => {
        if (confirm('Are you sure you want to delete this office?')) {
            router.delete(route('offices.destroy', office.id), {
                onSuccess: () => {
                    toast.success('Office deleted successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to delete office. Please try again.');
                }
            });
        }
    };

    const handleViewOffice = (office: Office) => {
        setSelectedOffice(office);
        setIsViewDialogOpen(true);
    };

    const handleEditOffice = (office: Office) => {
        setSelectedOffice(office);
        setIsEditDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Offices Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Offices Management</h1>
                            <p className="text-muted-foreground">
                                Manage all offices
                            </p>
                        </div>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Office
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Office</DialogTitle>
                            </DialogHeader>
                            <AddNewOffice setIsCreateDialogOpen={setIsCreateDialogOpen} />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offices.map((office) => (
                                <TableRow key={office.id}>
                                    <TableCell>{office.name}</TableCell>
                                    <TableCell>{office.description}</TableCell>
                                    <TableCell>{format(new Date(office.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewOffice(office)}
                                                title="View Office Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditOffice(office)}
                                                title="Edit Office"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteOffice(office)}
                                                title="Delete Office"
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
                            <DialogTitle>Office Details</DialogTitle>
                        </DialogHeader>
                        {selectedOffice && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Office Name</Label>
                                    <p className="text-sm">{selectedOffice.name}</p>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <p className="text-sm">{selectedOffice.description}</p>
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
                            <DialogTitle>Edit Office</DialogTitle>
                        </DialogHeader>
                        {selectedOffice && (
                            <EditOffice
                                office={selectedOffice}
                                setIsEditDialogOpen={setIsEditDialogOpen}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
