import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Admin } from '@/types';
import { toast } from 'sonner';
import InputError from '../input-error';

interface EditAdminProps {
    admin: Admin;
    offices: {
        id: number;
        name: string;
        description: string;
    }[];
    setIsEditDialogOpen: (value: boolean) => void;
}

export default function EditAdmin({ admin, offices, setIsEditDialogOpen }: EditAdminProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: admin.first_name,
        last_name: admin.last_name,
        middle_name: admin.middle_name || '',
        suffix: admin.suffix || '',
        gender: admin.gender,
        position: admin.position,
        office_id: admin.office?.id?.toString() || '',
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
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        value={data.first_name}
                        onChange={e => setData('first_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.first_name} />
                </div>
                <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                        id="last_name"
                        value={data.last_name}
                        onChange={e => setData('last_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.last_name} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                        id="middle_name"
                        value={data.middle_name}
                        onChange={e => setData('middle_name', e.target.value)}
                    />
                    <InputError message={errors.middle_name} />
                </div>
                <div>
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                        id="suffix"
                        value={data.suffix}
                        onChange={e => setData('suffix', e.target.value)}
                    />
                    <InputError message={errors.suffix} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                        value={data.gender}
                        onValueChange={value => setData('gender', value)}
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
                <div>
                    <Label htmlFor="office_id">Office</Label>
                    <Select
                        value={data.office_id}
                        onValueChange={value => setData('office_id', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select office" />
                        </SelectTrigger>
                        <SelectContent>
                            {offices.map(office => (
                                <SelectItem key={office.id} value={office.id.toString()}>
                                    {office.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.office_id} />
                </div>
            </div>
            <div>
                <Label htmlFor="position">Position</Label>
                <Input
                    id="position"
                    value={data.position}
                    onChange={e => setData('position', e.target.value)}
                    required
                />
                <InputError message={errors.position} />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    required
                />
                <InputError message={errors.email} />
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

