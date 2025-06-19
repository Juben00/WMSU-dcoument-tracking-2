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
import { MultiSelect } from '@/components/ui/multi-select';
import Swal from 'sweetalert2';

type FormData = {
    title: string;
    description: string;
    files: File[];
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'returned';
    recipient_ids: number[];
    initial_recipient_id: number | null;
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

// Spinner for submit button
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white inline-block ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
);

const CreateDocument = ({ auth, offices }: Props) => {
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        files: [],
        status: 'pending',
        recipient_ids: [],
        initial_recipient_id: null
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.recipient_ids.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Recipients Selected',
                text: 'Please select at least one recipient.',
                confirmButtonColor: '#b91c1c',
            });
            return;
        }
        setData('status', 'pending');
        setTimeout(() => {
            post(route('users.documents.send'), {
                forceFormData: true,
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Document Submitted!',
                        text: 'Your document has been sent successfully.',
                        confirmButtonColor: '#b91c1c',
                    }).then(() => {
                        window.location.href = '/documents';
                    });
                }
            });
        }, 0);
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

    const recipientOptions = offices
        .filter((office) => office.contact_person)
        .map((office) => ({
            value: office.contact_person!.id,
            label: `${office.contact_person!.name} - ${office.name}`,
        }));

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 py-12 px-2">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create New Document</h1>
                        <p className="text-gray-500 text-base">Fill out the form below to send a new document to one or more offices.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form id="create-doc-form" onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="title"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                    {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="description"
                                        id="description"
                                        rows={4}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Send To <span className="text-red-500">*</span>
                                    </label>
                                    <MultiSelect
                                        options={recipientOptions}
                                        selected={data.recipient_ids}
                                        onChange={(selected) => {
                                            setData('recipient_ids', selected);
                                            setData('initial_recipient_id', selected[0] ?? null);
                                        }}
                                        placeholder="Select recipients"
                                    />
                                    {errors.recipient_ids && (
                                        <div className="text-red-500 text-xs mt-1">{errors.recipient_ids}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="files" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Upload Documents <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="file"
                                        name="files"
                                        id="files"
                                        multiple
                                        required
                                        className="mt-1 block w-full text-sm text-gray-500 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                                        onChange={handleFileChange}
                                    />
                                    {errors.files && <div className="text-red-500 text-xs mt-1">{errors.files}</div>}
                                </div>
                            </div>

                            {/* File Previews */}
                            {filePreviews.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">File Previews</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {filePreviews.map((preview, index) => (
                                            preview && (
                                                <div key={index} className="relative group rounded-lg overflow-hidden shadow border border-gray-200 bg-gray-50">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-2 text-xs truncate">
                                                        {data.files[index]?.name}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 rounded-lg shadow text-sm font-semibold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 flex items-center justify-center transition"
                                >
                                    {processing ? (<><span>Submitting...</span><Spinner /></>) : 'Submit Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateDocument;
