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

interface Office {
    id: number;
    name: string;
    description: string;
}

interface FormData {
    [key: string]: string | null | File;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    gender: string;
    position: string;
    office_id: string | null;
    avatar: File | null;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
}

const AddNewAdmin = ({ setIsCreateDialogOpen, offices }: { setIsCreateDialogOpen: (isOpen: boolean) => void, offices: Office[] }) => {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        first_name: '',
        last_name: '',
        middle_name: null,
        suffix: null,
        gender: '',
        position: '',
        office_id: null,
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
                        {errors.first_name && (
                            <p className="text-sm text-red-500">{errors.first_name}</p>
                        )}
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
                        {errors.last_name && (
                            <p className="text-sm text-red-500">{errors.last_name}</p>
                        )}
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
                        {errors.middle_name && (
                            <p className="text-sm text-red-500">{errors.middle_name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suffix">Suffix</Label>
                        <Input
                            id="suffix"
                            value={data.suffix || ''}
                            onChange={e => setData('suffix', e.target.value || null)}
                            placeholder='Enter suffix if any'
                        />
                        {errors.suffix && (
                            <p className="text-sm text-red-500">{errors.suffix}</p>
                        )}
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
                        {errors.gender && (
                            <p className="text-sm text-red-500">{errors.gender}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={e => setData('avatar', e.target.files?.[0] || null)}
                        />
                        {errors.avatar && (
                            <p className="text-sm text-red-500">{errors.avatar}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="office">Office</Label>
                    <Select
                        value={data.office_id || ''}
                        onValueChange={value => setData('office_id', value || null)}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select office" />
                        </SelectTrigger>
                        <SelectContent>
                            {offices.map((office) => (
                                <SelectItem key={office.id} value={office.id.toString()}>
                                    {office.name}
                                </SelectItem>
                            ))}
                            <SelectItem value=" ">None</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.office_id && (
                        <p className="text-sm text-red-500">{errors.office_id}</p>
                    )}
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
                    {errors.position && (
                        <p className="text-sm text-red-500">{errors.position}</p>
                    )}
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
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                    )}
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
