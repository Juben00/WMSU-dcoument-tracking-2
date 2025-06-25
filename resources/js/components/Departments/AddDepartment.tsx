import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    setIsCreateDialogOpen: (value: boolean) => void;
}

export default function AddDepartment({ setIsCreateDialogOpen }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        type: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('departments.store'), {
            onSuccess: () => {
                toast.success('Department created successfully');
                setIsCreateDialogOpen(false);
                reset();
            },
            onError: (errors) => {
                toast.error('Failed to create department. Please try again.');
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
                    value={data.description}
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
                    onValueChange={(value) => setData('type', value)}
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
                    onClick={() => setIsCreateDialogOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Department'}
                </Button>
            </div>
        </form>
    );
}
