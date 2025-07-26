import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { toast } from 'sonner';
import InputError from '../input-error';

interface EditAdminProps {
    admin: User;
    departments: {
        id: number;
        name: string;
        description: string;
    }[];
    setIsEditDialogOpen: (value: boolean) => void;
}

export default function EditAdmin({ admin, departments, setIsEditDialogOpen }: EditAdminProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: admin.first_name,
        last_name: admin.last_name,
        middle_name: admin.middle_name || '',
        suffix: admin.suffix || '',
        gender: admin.gender,
        position: admin.position,
        department_id: admin.department?.id?.toString() || '',
        email: admin.email,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admins.update', admin.id), {
            onSuccess: () => {
                toast.success('Admin updated successfully');
                setIsEditDialogOpen(false);
            },
            onError: (errors) => {
                toast.error('Failed to update admin. Please try again.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="first_name" className="dark:text-gray-200">First Name</Label>
                    <Input
                        id="first_name"
                        value={data.first_name}
                        onChange={e => setData('first_name', e.target.value)}
                        required
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <InputError message={errors.first_name} />
                </div>
                <div>
                    <Label htmlFor="last_name" className="dark:text-gray-200">Last Name</Label>
                    <Input
                        id="last_name"
                        value={data.last_name}
                        onChange={e => setData('last_name', e.target.value)}
                        required
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <InputError message={errors.last_name} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="middle_name" className="dark:text-gray-200">Middle Name</Label>
                    <Input
                        id="middle_name"
                        value={data.middle_name}
                        onChange={e => setData('middle_name', e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <InputError message={errors.middle_name} />
                </div>
                <div>
                    <Label htmlFor="suffix" className="dark:text-gray-200">Suffix</Label>
                    <Input
                        id="suffix"
                        value={data.suffix}
                        onChange={e => setData('suffix', e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <InputError message={errors.suffix} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="gender" className="dark:text-gray-200">Gender</Label>
                    <Select
                        value={data.gender}
                        onValueChange={value => setData('gender', value)}
                    >
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                            <SelectValue placeholder="Select gender" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectItem value="Male" className="dark:text-gray-100 dark:hover:bg-gray-700">Male</SelectItem>
                            <SelectItem value="Female" className="dark:text-gray-100 dark:hover:bg-gray-700">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.gender} />
                </div>
                <div>
                    <Label htmlFor="department_id" className="dark:text-gray-200">Department</Label>
                    <Select
                        value={data.department_id}
                        onValueChange={value => setData('department_id', value)}
                    >
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                            <SelectValue placeholder="Select department" className="dark:text-gray-400" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            {departments.map(department => (
                                <SelectItem key={department.id} value={department.id.toString()} className="dark:text-gray-100 dark:hover:bg-gray-700">
                                    {department.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.department_id} />
                </div>
            </div>
            <div>
                <Label htmlFor="position" className="dark:text-gray-200">Position</Label>
                <Input
                    id="position"
                    value={data.position}
                    onChange={e => setData('position', e.target.value)}
                    required
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
                <InputError message={errors.position} />
            </div>
            <div>
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    required
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
                <InputError message={errors.email} />
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

