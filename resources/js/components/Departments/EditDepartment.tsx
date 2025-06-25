import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Departments } from '@/types';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Props {
    department: Departments;
    setIsEditDialogOpen: (value: boolean) => void;
}

export default function EditDepartment({ department, setIsEditDialogOpen }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: department.name,
        description: department.description,
        type: department.type,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('departments.update', department.id), {
            onSuccess: () => {
                toast.success('Department updated successfully');
                setIsEditDialogOpen(false);
                reset();
            },
            onError: (errors) => {
                toast.error('Failed to update department. Please try again.');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter department name"
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Enter department description"
                />
                <InputError message={errors.description} />
            </div>

            {/* department type */}
            <div className="space-y-2">
                <Label htmlFor="type">Department Type</Label>
                <Select
                    value={data.type}
                    onValueChange={(value) => setData('type', value as 'office' | 'college')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select department type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                </Select>
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
                    {processing ? 'Updating...' : 'Update Department'}
                </Button>
            </div>
        </form>
    );
}
