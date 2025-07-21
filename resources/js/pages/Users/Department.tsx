import Navbar from '@/components/User/navbar'
import React, { useState, useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Users, Building, UserPlus, User } from 'lucide-react'
import InputError from '@/components/input-error'
import Swal from 'sweetalert2'
import TabHeader from '@/components/User/tab-header'
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
import { User as UserType } from '@/types'

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
        user: UserType;
    };
    users: UserType[];
}

const Offices = ({ auth, users }: Props) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
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

    const handleEditUser = (user: UserType) => {
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
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this user!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('users.destroy', userId), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'User deleted successfully',
                            icon: 'success',
                            timer: 1500
                        });
                    },
                    onError: (errors) => {
                        console.error(errors);
                    }
                });
            }
        });
    };

    console.log(auth.user);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <TabHeader title={auth.user.department?.name || "Department"} description="Manage the users within your department." />
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
                                        <span className="hidden md:block">Create User</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">Create New User</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateUser} className="space-y-5 mt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    value={data.first_name}
                                                    onChange={e => setData('first_name', e.target.value)}
                                                    placeholder='Enter first name'
                                                    required
                                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <InputError message={errors.first_name} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-200">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    value={data.last_name}
                                                    onChange={e => setData('last_name', e.target.value)}
                                                    placeholder='Enter last name'
                                                    required
                                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <InputError message={errors.last_name} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="middle_name" className="text-gray-700 dark:text-gray-200">Middle Name</Label>
                                                <Input
                                                    id="middle_name"
                                                    value={data.middle_name || ''}
                                                    onChange={e => setData('middle_name', e.target.value)}
                                                    placeholder='Enter middle name'
                                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <InputError message={errors.middle_name} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="suffix" className="text-gray-700 dark:text-gray-200">Suffix</Label>
                                                <Input
                                                    id="suffix"
                                                    value={data.suffix || ''}
                                                    onChange={e => setData('suffix', e.target.value)}
                                                    placeholder='Enter suffix'
                                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <InputError message={errors.suffix} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="gender" className="text-gray-700 dark:text-gray-200">Gender</Label>
                                                <Select
                                                    value={data.gender}
                                                    onValueChange={value => setData('gender', value)}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                                                <Label htmlFor="position" className="text-gray-700 dark:text-gray-200">Position</Label>
                                                <Input
                                                    id="position"
                                                    value={data.position}
                                                    onChange={e => setData('position', e.target.value)}
                                                    placeholder='Enter position'
                                                    required
                                                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <InputError message={errors.position} />
                                            </div>
                                        </div>
                                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="role" className="text-gray-700 dark:text-gray-200">Role</Label>
                                                <Select
                                                    value={data.role}
                                                    onValueChange={value => setData('role', value)}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                                        </div> */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder='Enter email'
                                                required
                                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold">
                                                Create User
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className={`flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-gray-200 dark:border-gray-600`}>
                                    <div className={`w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Total Users</p>
                                            <p className="text-2xl font-bold text-red-900 dark:text-red-300">{users.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Department Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Name</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Gender</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Email</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Position</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Role</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? users.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-gray-100 dark:border-gray-600">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{user.first_name} {user.middle_name} {user.last_name} {user.suffix}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                                                        {user.gender}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                                                <TableCell className="py-4 text-gray-700 dark:text-gray-300">{user.position}</TableCell>
                                                <TableCell className="py-4">
                                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border capitalize ${user.role === 'receiver'
                                                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="hover:bg-red-600 transition-all duration-200"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                                                            <Users className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No users found in this department.</p>
                                                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first user to get started.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-lg rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">Edit User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdateUser} className="space-y-5 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_first_name" className="text-gray-700 dark:text-gray-200">First Name</Label>
                                        <Input
                                            id="edit_first_name"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            placeholder='Enter first name'
                                            required
                                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_last_name" className="text-gray-700 dark:text-gray-200">Last Name</Label>
                                        <Input
                                            id="edit_last_name"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            placeholder='Enter last name'
                                            required
                                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_middle_name" className="text-gray-700 dark:text-gray-200">Middle Name</Label>
                                        <Input
                                            id="edit_middle_name"
                                            value={data.middle_name || ''}
                                            onChange={e => setData('middle_name', e.target.value)}
                                            placeholder='Enter middle name'
                                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                        <InputError message={errors.middle_name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_suffix" className="text-gray-700 dark:text-gray-200">Suffix</Label>
                                        <Input
                                            id="edit_suffix"
                                            value={data.suffix || ''}
                                            onChange={e => setData('suffix', e.target.value)}
                                            placeholder='Enter suffix'
                                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                        <InputError message={errors.suffix} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_gender" className="text-gray-700 dark:text-gray-200">Gender</Label>
                                        <Select
                                            value={data.gender}
                                            onValueChange={value => setData('gender', value)}
                                        >
                                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                                        <Label htmlFor="edit_position" className="text-gray-700 dark:text-gray-200">Position</Label>
                                        <Input
                                            id="edit_position"
                                            value={data.position}
                                            onChange={e => setData('position', e.target.value)}
                                            placeholder='Enter position'
                                            required
                                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                        <InputError message={errors.position} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_email" className="text-gray-700 dark:text-gray-200">Email</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder='Enter email'
                                        required
                                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                {/* <div className="space-y-1.5">
                                    <Label htmlFor="edit_role" className="text-gray-700 dark:text-gray-200">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={value => setData('role', value)}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                                </div> */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold">
                                        Update User
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    )
}

export default Offices
