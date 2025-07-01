import Navbar from '@/components/User/navbar'
import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Users, Building, UserPlus, User } from 'lucide-react'
import InputError from '@/components/input-error'
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

    console.log(auth.user);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{auth.user.department?.name || "Department"}</h1>
                                    <p className="text-gray-600 mt-1">Manage the users within your department.</p>
                                </div>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                                        <UserPlus className="h-5 w-5" />
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
                                            <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold">
                                                Create User
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Department Stats Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Department Overview</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-700">Total Users</p>
                                            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-700">Regular Users</p>
                                            <p className="text-2xl font-bold text-emerald-900">{users.filter(user => user.role === 'user').length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                                            <UserPlus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-amber-700">Receivers</p>
                                            <p className="text-2xl font-bold text-amber-900">{users.filter(user => user.role === 'receiver').length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Department Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <TableHead className="font-semibold text-gray-700 py-4">Name</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">Gender</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">Position</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">Role</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? users.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50 transition-all duration-200 border-b border-gray-100">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{user.first_name} {user.middle_name} {user.last_name} {user.suffix}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                                                        {user.gender}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-700">{user.email}</TableCell>
                                                <TableCell className="py-4 text-gray-700">{user.position}</TableCell>
                                                <TableCell className="py-4">
                                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border capitalize ${user.role === 'receiver'
                                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                                        : 'bg-blue-100 text-blue-800 border-blue-200'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
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
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                                            <Users className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 font-medium text-lg">No users found in this department.</p>
                                                            <p className="text-gray-400 text-sm mt-1">Create your first user to get started.</p>
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
                                    <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold">
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
