import React, { useState, useEffect } from 'react';
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
import { FileText, FileCheck, Users, Hash, User as UserIcon, Building, Calendar, Upload, ArrowLeft } from 'lucide-react';

type FormData = {
    subject: string;
    order_number: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    description: string;
    files: File[];
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'returned';
    recipient_ids: number[];
    initial_recipient_id: number | null;
    through_user_ids: number[];
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
        initial_recipient_id: null,
        through_user_ids: []
    });
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetch('/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(() => setNotifications([]));
    }, []);

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

            // Check if through users include the main recipient
            if (data.through_user_ids.includes(sendToId)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Selection',
                    text: 'The main recipient cannot be selected as a through user.',
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
            if (data.through_user_ids.length > 0) {
                formData.append('initial_recipient_id', data.through_user_ids[0].toString());
                // Add all through user IDs to the form data
                data.through_user_ids.forEach((id, idx) => {
                    formData.append(`through_user_ids[${idx}]`, id.toString());
                });
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
            onError: (errors) => {
                setIsSubmitting(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Submit Document',
                    text: errors.message,
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
            <Navbar notifications={notifications} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Document</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">Fill out the form below to send a new document</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </div>
                    </div>

                    {/* Document Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Information</h2>
                            </div>

                            <form id="create-doc-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Document Type and Order Number */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <label htmlFor="document_type" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            Document Type <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={data.document_type}
                                            onValueChange={(value: 'special_order' | 'order' | 'memorandum' | 'for_info') =>
                                                setData('document_type', value)
                                            }
                                        >
                                            <SelectTrigger className="mt-2 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition truncate bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
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

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <label htmlFor="order_number" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            Order Number <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            name="order_number"
                                            id="order_number"
                                            required
                                            className="mt-2 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={data.order_number}
                                            onChange={e => setData('order_number', e.target.value)}
                                        />
                                        {errors.order_number && <div className="text-red-500 text-xs mt-1">{errors.order_number}</div>}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                    <label htmlFor="subject" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Subject <span className="text-red-500">*</span></label>
                                    <Input
                                        type="text"
                                        name="subject"
                                        id="subject"
                                        required
                                        className="mt-2 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                    />
                                    {errors.subject && <div className="text-red-500 text-xs mt-1">{errors.subject}</div>}
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                    <label htmlFor="description" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Description <span className="text-red-500">*</span></label>
                                    <Textarea
                                        name="description"
                                        id="description"
                                        rows={4}
                                        className="mt-2 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Recipients Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recipients</h2>
                            </div>

                            {data.document_type === 'for_info' ? (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                    <label className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
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
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <label className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" />
                                            Send To <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={sendToId ? sendToId.toString() : ''}
                                            onValueChange={(value) => {
                                                setSendToId(value ? parseInt(value) : null);
                                            }}
                                        >
                                            <SelectTrigger className="mt-2 block w-full rounded-lg border-red-300 dark:border-red-600 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition truncate bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
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

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <label className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Send Through <span className="text-gray-400 dark:text-gray-500">(optional)</span>
                                        </label>
                                        <MultiSelect
                                            options={recipientOptions}
                                            selected={data.through_user_ids}
                                            onChange={(selected) => {
                                                setData('through_user_ids', selected);
                                            }}
                                            placeholder="Select optional through users"
                                        />
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                            Document will be sent to the first selected through user, then to the main recipient.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Documents</h2>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                <label htmlFor="files" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Select Files <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="file"
                                    name="files"
                                    id="files"
                                    multiple
                                    required
                                    className="mt-2 block w-full text-sm text-gray-500 dark:text-gray-400 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-900/20 file:text-red-700 dark:file:text-red-400 hover:file:bg-red-100 dark:hover:file:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-200 transition bg-white dark:bg-gray-800"
                                    onChange={handleFileChange}
                                />
                                {errors.files && <div className="text-red-500 text-xs mt-1">{errors.files}</div>}
                            </div>

                            {/* File Previews */}
                            {filePreviews.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        File Previews
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {filePreviews.map((preview, index) => (
                                            preview && (
                                                <div key={index} className="relative group rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-200">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-3 text-sm font-medium">
                                                        {data.files[index]?.name}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Document</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    disabled={isSubmitting || processing}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="create-doc-form"
                                    disabled={isSubmitting || processing}
                                    className="px-8 py-3 rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                                >
                                    {isSubmitting || processing ? (<><span>Submitting...</span><Spinner /></>) : 'Submit Document'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateDocument;
