import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { useForm } from '@inertiajs/react';
import { User } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type FormData = {
    title: string;
    description: string;
    files: File[];
    status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'returned';
    recipient_id: number | null;
}

interface Props {
    auth: {
        user: User;
    };
    offices: Array<{
        id: number;
        name: string;
        contact_person: {
            id: number;
            name: string;
            role: string;
        } | null;
    }>;
}

const CreateDocument = ({ auth, offices }: Props) => {
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        files: [],
        status: 'draft',
        recipient_id: null
    });

    console.log('offices', offices);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users/documents', {
            onSuccess: () => {
                window.location.href = '/documents';
            }
        });
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        e.preventDefault();
        setData('status', 'draft');
        post('/users/documents', {
            onSuccess: () => {
                window.location.href = '/documents';
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setData('files', files);

            // Create previews for image files
            const previews = files.map(file => {
                if (file.type.startsWith('image/')) {
                    return URL.createObjectURL(file);
                }
                return '';
            });
            setFilePreviews(previews);
        }
    };

    // Cleanup preview URLs when component unmounts
    React.useEffect(() => {
        return () => {
            filePreviews.forEach(preview => {
                if (preview) URL.revokeObjectURL(preview);
            });
        };
    }, [filePreviews]);

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Create New Document</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <Input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <Textarea
                                name="description"
                                id="description"
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                        </div>

                        <div>
                            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                                Send To
                            </label>
                            <Select
                                value={data.recipient_id?.toString()}
                                onValueChange={(value) => setData('recipient_id', parseInt(value))}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select recipient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {offices.map((office) => (
                                        office.contact_person && (
                                            <SelectItem key={office.contact_person.id} value={office.contact_person.id.toString()}>
                                                {office.contact_person.name} - {office.name}
                                            </SelectItem>
                                        )
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.recipient_id && <div className="text-red-500 text-sm mt-1">{errors.recipient_id}</div>}
                        </div>

                        <div>
                            <label htmlFor="files" className="block text-sm font-medium text-gray-700">
                                Upload Documents
                            </label>
                            <Input
                                type="file"
                                name="files"
                                id="files"
                                multiple
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-red-50 file:text-red-700
                                    hover:file:bg-red-100"
                                onChange={handleFileChange}
                            />
                            {errors.files && <div className="text-red-500 text-sm mt-1">{errors.files}</div>}

                            {/* File Previews */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {filePreviews.map((preview, index) => (
                                    preview && (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <div className="absolute top-2 right-2 max-w-1/2 truncate bg-black/70 bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                                {data.files[index]?.name}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                onClick={() => setData('status', 'pending')}
                                disabled={processing}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit Document'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateDocument;
