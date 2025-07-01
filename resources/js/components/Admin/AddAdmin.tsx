import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Lock, Unlock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import InputError from '../input-error';

interface Department {
    id: number;
    name: string;
    description: string;
    type: 'office' | 'college';
}

interface FormData {
    [key: string]: string | null | File;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    gender: string;
    position: string;
    department_id: string | null;
    avatar: File | null;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
}

const AddNewAdmin = ({ setIsCreateDialogOpen, departments }: { setIsCreateDialogOpen: (isOpen: boolean) => void, departments: Department[] }) => {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        first_name: '',
        last_name: '',
        middle_name: null,
        suffix: null,
        gender: '',
        position: '',
        department_id: null,
        avatar: null,
        email: '',
        role: 'admin',
        password: 'password',
        password_confirmation: 'password',
    });

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admins.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
                toast.success('Admin created successfully');
            },
            forceFormData: true,
            onError: (errors) => {
                const errorMessages = Object.values(errors).join('\n');
                toast.error(errorMessages);
            }
        });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                            id="first_name"
                            value={data.first_name}
                            onChange={e => setData('first_name', e.target.value)}
                            placeholder='Enter first name'
                            required
                        />
                        <InputError message={errors.first_name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                            id="last_name"
                            value={data.last_name}
                            onChange={e => setData('last_name', e.target.value)}
                            placeholder='Enter last name'
                            required
                        />
                        <InputError message={errors.last_name} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                            id="middle_name"
                            value={data.middle_name || ''}
                            onChange={e => setData('middle_name', e.target.value || null)}
                            placeholder='Enter middle name'
                        />
                        <InputError message={errors.middle_name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suffix">Suffix</Label>
                        <Input
                            id="suffix"
                            value={data.suffix || ''}
                            onChange={e => setData('suffix', e.target.value || null)}
                            placeholder='Enter suffix if any'
                        />
                        <InputError message={errors.suffix} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={data.gender}
                            onValueChange={value => setData('gender', value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.gender} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={e => setData('avatar', e.target.files?.[0] || null)}
                        />
                        <InputError message={errors.avatar} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                        value={data.department_id || ''}
                        onValueChange={value => setData('department_id', value || null)}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.name}
                                </SelectItem>
                            ))}
                            <SelectItem value=" ">None</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.department_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                        id="position"
                        value={data.position}
                        onChange={e => setData('position', e.target.value)}
                        placeholder='Enter position'
                        required
                    />
                    <InputError message={errors.position} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        placeholder='Enter email'
                        required
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        Create Admin
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
};

export default AddNewAdmin;
