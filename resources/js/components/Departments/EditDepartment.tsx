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
        code: department.code,
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
                <Label htmlFor="name" className="dark:text-gray-200">Department Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter department name"
                    required
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <InputError message={errors.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Department Code</Label>
                <Input
                    id="code"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    placeholder="Enter department code"
                    required
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <InputError message={errors.code} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
                <Textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Enter department description"
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <InputError message={errors.description} />
            </div>

            {/* department type */}
            <div className="space-y-2">
                <Label htmlFor="type" className="dark:text-gray-200">Department Type</Label>
                <Select
                    value={data.type}
                    onValueChange={(value) => setData('type', value as 'office' | 'college')}
                >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Select department type" className="dark:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="office" className="dark:text-gray-100 dark:hover:bg-gray-700">Office</SelectItem>
                        <SelectItem value="college" className="dark:text-gray-100 dark:hover:bg-gray-700">College</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.type} />
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
                    {processing ? 'Updating...' : 'Update Department'}
                </Button>
            </div>
        </form>
    );
}
