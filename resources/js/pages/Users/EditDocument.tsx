import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { useForm, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Swal from 'sweetalert2';
import { Download } from 'lucide-react';

interface DocumentFile {
    id: number;
    original_filename: string;
    file_size: number;
    file_path?: string;
}

interface Document {
    id: number;
    subject: string;
    description: string;
    files: DocumentFile[];
    status: string;
    order_number: string;
}

interface InvolvedDepartment {
    id: number;
    name: string;
    type: 'sent_to' | 'sent_through';
}

interface Props {
    document: Document;
    involvedDepartments: InvolvedDepartment[];
}

// FileCard for file preview and download (adapted from View.tsx)
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard = ({ file, documentId, color = 'red', onDelete }: { file: any, documentId: number, color?: 'red' | 'blue', onDelete: (fileId: number) => void }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col items-center border ${color === 'red' ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500' : 'border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'}`}>
        <div className={`w-full h-32 flex items-center justify-center ${color === 'red' ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'} rounded-lg mb-4 overflow-hidden`}>
            <a
                href={file.file_path ? `/storage/${file.file_path}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex items-center justify-center"
                tabIndex={-1}
            >
                {file.original_filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                        src={file.file_path ? `/storage/${file.file_path}` : '#'}
                        alt={file.original_filename}
                        className="object-contain w-full h-full"
                    />
                ) : file.original_filename.match(/\.(pdf)$/i) ? (
                    <embed
                        src={file.file_path ? `/storage/${file.file_path}` : '#'}
                        type="application/pdf"
                        className="w-full h-full"
                    />
                ) : (
                    <div className={`flex flex-col items-center justify-center ${color === 'red' ? 'text-gray-400 dark:text-gray-500' : 'text-red-400 dark:text-red-500'}`}>
                        <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}
            </a>
        </div>
        <div className="w-full text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1" title={file.original_filename}>{file.original_filename}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">{formatFileSize(file.file_size)}</p>
            <button
                type="button"
                className="text-xs cursor-pointer text-red-600 dark:text-red-400 hover:underline ml-2"
                onClick={() => onDelete(file.id)}
            >
                Delete
            </button>
        </div>
    </div>
);

const EditDocument = ({ document, involvedDepartments }: Props) => {
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingFiles, setExistingFiles] = useState<DocumentFile[]>(document.files || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
    const { data, setData, post, processing, errors } = useForm({
        order_number: document.order_number || '',
        subject: document.subject || '',
        description: document.description || '',
        files: [] as File[],
        selected_department_id: null as number | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewFiles(files);
            setNewFilePreviews(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || processing) return;
        if (!data.subject) {
            Swal.fire({ icon: 'warning', title: 'Missing Subject', text: 'Please enter a subject.' });
            return;
        }
        if (!data.selected_department_id) {
            Swal.fire({ icon: 'warning', title: 'Missing Department', text: 'Please select a department to send the document to.' });
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('subject', data.subject);
        formData.append('description', data.description);
        formData.append('order_number', data.order_number);
        formData.append('selected_department_id', data.selected_department_id.toString());
        formData.append('_method', 'PUT');
        newFiles.forEach((file, idx) => {
            formData.append(`files[${idx}]`, file);
        });
        router.post(route('users.documents.update', { document: document.id }), formData, {
            forceFormData: true,
            onSuccess: () => {
                setNewFiles([]);
                setNewFilePreviews([]);
                Swal.fire({
                    icon: 'success',
                    title: 'Document Updated!',
                    text: 'Your document has been updated successfully.',
                    confirmButtonColor: '#b91c1c',
                });
            },
            onError: () => {
                setIsSubmitting(false);
                Swal.fire({ icon: 'error', title: 'Failed to Update', text: 'Failed to update document. Please try again.' });
            }
        });
    };

    const handleDeleteFile = (fileId: number) => {
        Swal.fire({
            title: 'Delete File?',
            text: 'Are you sure you want to delete this file?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.documents.files.delete', { document: document.id, file: fileId }), {
                    onSuccess: () => {
                        setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                        Swal.fire('Deleted!', 'File has been deleted.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Error', 'Failed to delete file.', 'error');
                    }
                });
            }
        });
    };

    const handleDeleteNewFile = (index: number) => {
        Swal.fire({
            title: 'Remove File?',
            text: 'Are you sure you want to remove this file from the upload?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove the file from newFiles array
                const updatedFiles = newFiles.filter((_, i) => i !== index);
                setNewFiles(updatedFiles);

                // Remove the corresponding preview URL
                const updatedPreviews = newFilePreviews.filter((_, i) => i !== index);
                setNewFilePreviews(updatedPreviews);

                Swal.fire('Removed!', 'File has been removed from upload.', 'success');
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit & Resend Document</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Order Number</label>
                                <Input
                                    type="text"
                                    value={data.order_number}
                                    onChange={e => setData('order_number', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Subject</label>
                                <Input
                                    type="text"
                                    value={data.subject}
                                    onChange={e => setData('subject', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Description</label>
                                <Textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Send To Department <span className="text-red-500">*</span></label>
                                <Select
                                    value={data.selected_department_id?.toString() || ''}
                                    onValueChange={(value) => setData('selected_department_id', value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Select a department to send the document to" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {involvedDepartments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{dept.name}</span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({dept.type === 'sent_to' ? 'Sent To' : 'Sent Through'})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.selected_department_id && (
                                    <div className="text-red-500 text-xs mt-1">{errors.selected_department_id}</div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Add New Files (optional)</label>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                                {/* Show original files */}
                                {existingFiles.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Original Files</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {existingFiles.map(file => (
                                                <FileCard key={file.id} file={file} documentId={document.id} color="red" onDelete={handleDeleteFile} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Preview new files */}
                                {newFilePreviews.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">New Files to Add</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {newFiles.map((file, idx) => (
                                                <div key={idx} className="flex flex-col items-center">
                                                    <div className="relative">
                                                        <img src={newFilePreviews[idx]} alt="Preview" className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600 mb-1" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteNewFile(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
                                                            title="Remove file"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <span className="text-xs text-gray-700 dark:text-gray-300">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
                                disabled={isSubmitting || processing}
                            >
                                {isSubmitting || processing ? 'Updating...' : 'Update & Resend'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditDocument;
