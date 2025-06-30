import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { useForm, router } from '@inertiajs/react';
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
    subject: string;
    order_number: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
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
    departments: Array<{
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

const CreateDocument = ({ auth, departments }: Props) => {
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [sendThroughId, setSendThroughId] = useState<number | null>(null);
    const [sendToId, setSendToId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, post, processing, errors } = useForm<FormData>({
        subject: '',
        order_number: '',
        document_type: 'for_info',
        description: '',
        files: [],
        status: 'pending',
        recipient_ids: [],
        initial_recipient_id: null
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting || processing) {
            return;
        }

        // Validate required fields
        if (!data.subject || !data.order_number || !data.document_type || !data.description) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Required Fields',
                text: 'Please fill out all required fields.',
                confirmButtonColor: '#b91c1c',
            });
            return;
        }

        if (data.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Files Selected',
                text: 'Please upload at least one file.',
                confirmButtonColor: '#b91c1c',
            });
            return;
        }

        setIsSubmitting(true);

        // For 'for_info', must have at least one recipient
        if (data.document_type === 'for_info') {
            if (data.recipient_ids.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Recipients Selected',
                    text: 'Please select at least one recipient.',
                    confirmButtonColor: '#b91c1c',
                });
                setIsSubmitting(false);
                return;
            }
        } else {
            // For other types, must have a main recipient
            if (!sendToId) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Main Recipient Selected',
                    text: 'Please select the main recipient (Send To).',
                    confirmButtonColor: '#b91c1c',
                });
                setIsSubmitting(false);
                return;
            }
        }

        // Always use FormData for submission
        const formData = new FormData();
        formData.append('subject', data.subject);
        formData.append('order_number', data.order_number);
        formData.append('document_type', data.document_type);
        formData.append('description', data.description);
        formData.append('status', 'pending');

        // Recipients
        if (data.document_type === 'for_info') {
            data.recipient_ids.forEach((id, idx) => {
                formData.append(`recipient_ids[${idx}]`, id.toString());
            });
            // Set initial_recipient_id if available
            if (data.initial_recipient_id) {
                formData.append('initial_recipient_id', data.initial_recipient_id.toString());
            }
        } else {
            // Only one recipient for these types
            formData.append('recipient_ids[0]', sendToId!.toString());
            if (sendThroughId) {
                formData.append('initial_recipient_id', sendThroughId.toString());
            }
        }

        // Files
        data.files.forEach((file, idx) => {
            formData.append(`files[${idx}]`, file);
        });

        router.post(route('users.documents.send'), formData, {
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
            },
            onError: () => {
                setIsSubmitting(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Submit Document',
                    text: 'Failed to submit document. Please try again.',
                    confirmButtonColor: '#b91c1c',
                });
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

    const recipientOptions = departments
        .filter((department) => department.contact_person)
        .map((department) => {
            const role = department.contact_person!.role;
            const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
            return {
                value: department.contact_person!.id,
                label: `${department.contact_person!.name} | ${department.name} | ${capitalizedRole}`,
                name: department.contact_person!.name,
                department: department.name,
                role: capitalizedRole,
            };
        });

    const documentTypeOptions = [
        { value: 'special_order', label: 'Special Order' },
        { value: 'order', label: 'Order' },
        { value: 'memorandum', label: 'Memorandum' },
        { value: 'for_info', label: 'For Info' },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-gray-100 py-12 px-2">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create New Document</h1>
                        <p className="text-gray-500 text-base">Fill out the form below to send a new document to one or more offices.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form id="create-doc-form" onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="subject"
                                        id="subject"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                    />
                                    {errors.subject && <div className="text-red-500 text-xs mt-1">{errors.subject}</div>}
                                </div>
                                <div>
                                    <label htmlFor="order_number" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Order Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="order_number"
                                        id="order_number"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                        value={data.order_number}
                                        onChange={e => setData('order_number', e.target.value)}
                                    />
                                    {errors.order_number && <div className="text-red-500 text-xs mt-1">{errors.order_number}</div>}
                                </div>

                                <div>
                                    <label htmlFor="document_type" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Document Type <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={data.document_type}
                                        onValueChange={(value: 'special_order' | 'order' | 'memorandum' | 'for_info') =>
                                            setData('document_type', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition truncate">
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.document_type && <div className="text-red-500 text-xs mt-1">{errors.document_type}</div>}
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

                            <div className="grid grid-cols-1  gap-8">
                                <div>
                                    {data.document_type === 'for_info' ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <div className='grid grid-cols-1 gap-8'>
                                            <div className='grid grid-cols-1'>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Send Through <span className="text-gray-400">(optional)</span>
                                                </label>
                                                <Select
                                                    value={sendThroughId ? sendThroughId.toString() : ''}
                                                    onValueChange={(value) => {
                                                        setSendThroughId(value && value !== '' ? parseInt(value) : null);
                                                    }}
                                                >
                                                    <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition truncate">
                                                        <SelectValue placeholder="Select optional through user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {recipientOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                                <span>{option.label}</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className='grid grid-cols-1'>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Send To <span className="text-red-500">*</span>
                                                </label>
                                                <Select
                                                    value={sendToId ? sendToId.toString() : ''}
                                                    onValueChange={(value) => {
                                                        setSendToId(value ? parseInt(value) : null);
                                                    }}
                                                >
                                                    <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition truncate">
                                                        <SelectValue placeholder="Select main recipient" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {recipientOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                                <span>{option.label}</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!sendToId && (
                                                    <div className="text-red-500 text-xs mt-1">Main recipient is required.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                    disabled={isSubmitting || processing}
                                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || processing}
                                    className="px-6 py-2 rounded-lg shadow text-sm font-semibold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition"
                                >
                                    {isSubmitting || processing ? (<><span>Submitting...</span><Spinner /></>) : 'Submit Document'}
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
