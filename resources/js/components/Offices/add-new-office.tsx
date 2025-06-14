import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import InputError from '../input-error';

interface Props {
    setIsCreateDialogOpen: (value: boolean) => void;
}

export default function AddNewOffice({ setIsCreateDialogOpen }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('offices.store'), {
            onSuccess: () => {
                toast.success('Office created successfully');
                setIsCreateDialogOpen(false);
                reset();
            },
            onError: (errors) => {
                toast.error('Failed to create office. Please try again.');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Office Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter office name"
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
                    placeholder="Enter office description"
                />
                <InputError message={errors.description} />
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
                    {processing ? 'Creating...' : 'Create Office'}
                </Button>
            </div>
        </form>
    );
}
