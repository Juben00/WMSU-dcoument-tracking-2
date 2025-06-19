import Navbar from '@/components/User/navbar'
import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import InputError from '@/components/input-error'
import { User } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface FormData {
    [key: string]: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    gender: string;
    position: string;
    role: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface Props {
    auth: {
        user: User;
    };
    users: User[];
}

const Offices = ({ auth, users }: Props) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm<FormData>({
        first_name: '',
        last_name: '',
        middle_name: null,
        suffix: null,
        gender: '',
        position: '',
        role: '',
        email: '',
        password: 'password',
        password_confirmation: 'password',
    });

    // Check if there's already a receiver in the office
    const hasReceiver = users.some(user => user.role === 'receiver');

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setData({
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: user.middle_name,
            suffix: user.suffix,
            gender: user.gender,
            position: user.position,
            role: user.role,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                reset();
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('users.destroy', userId), {
                onSuccess: () => {
                    // The page will automatically refresh with the updated data
                },
                onError: (errors) => {
                    console.error(errors);
                }
            });
        }
    };

    console.log(users);

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Office Users</h1>
                        <p className="text-base text-gray-500 mt-1">Manage the users within your office.</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Create User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg rounded-xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Create New User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-5 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
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
                                    <div className="space-y-1.5">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name || ''}
                                            onChange={e => setData('middle_name', e.target.value)}
                                            placeholder='Enter middle name'
                                        />
                                        <InputError message={errors.middle_name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="suffix">Suffix</Label>
                                        <Input
                                            id="suffix"
                                            value={data.suffix || ''}
                                            onChange={e => setData('suffix', e.target.value)}
                                            placeholder='Enter suffix'
                                        />
                                        <InputError message={errors.suffix} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select
                                            value={data.gender}
                                            onValueChange={value => setData('gender', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.gender} />
                                    </div>
                                    <div className="space-y-1.5">
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={value => setData('role', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="receiver" disabled={hasReceiver}>
                                                    Receiver {hasReceiver && "(Already exists)"}
                                                </SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.role} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
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
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="bg-primary text-white font-semibold">
                                        Create User
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-x-auto border border-gray-100">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                                <TableHead className="font-semibold text-gray-700">Position</TableHead>
                                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50 transition-all">
                                    <TableCell className="py-3">
                                        <span className="font-medium text-gray-900">{user.first_name} {user.middle_name} {user.last_name} {user.suffix}</span>
                                    </TableCell>
                                    <TableCell className="py-3">{user.gender}</TableCell>
                                    <TableCell className="py-3">{user.email}</TableCell>
                                    <TableCell className="py-3">{user.position}</TableCell>
                                    <TableCell className='capitalize py-3'>{user.role}</TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-300 hover:border-primary hover:text-primary"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="hover:bg-red-600"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 00-4-4V7a4 4 0 018 0v2a4 4 0 00-4 4z" /></svg>
                                            <span className="text-gray-400 text-lg">No users found in this office.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-lg rounded-xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateUser} className="space-y-5 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_first_name">First Name</Label>
                                    <Input
                                        id="edit_first_name"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        placeholder='Enter first name'
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_last_name">Last Name</Label>
                                    <Input
                                        id="edit_last_name"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        placeholder='Enter last name'
                                        required
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_middle_name">Middle Name</Label>
                                    <Input
                                        id="edit_middle_name"
                                        value={data.middle_name || ''}
                                        onChange={e => setData('middle_name', e.target.value)}
                                        placeholder='Enter middle name'
                                    />
                                    <InputError message={errors.middle_name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_suffix">Suffix</Label>
                                    <Input
                                        id="edit_suffix"
                                        value={data.suffix || ''}
                                        onChange={e => setData('suffix', e.target.value)}
                                        placeholder='Enter suffix'
                                    />
                                    <InputError message={errors.suffix} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_gender">Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={value => setData('gender', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_position">Position</Label>
                                    <Input
                                        id="edit_position"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                        placeholder='Enter position'
                                        required
                                    />
                                    <InputError message={errors.position} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_email">Email</Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder='Enter email'
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_role">Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={value => setData('role', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="receiver"
                                            disabled={hasReceiver && selectedUser?.role !== 'receiver'}
                                        >
                                            Receiver {hasReceiver && selectedUser?.role !== 'receiver' && "(Already exists)"}
                                        </SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary text-white font-semibold">
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default Offices
