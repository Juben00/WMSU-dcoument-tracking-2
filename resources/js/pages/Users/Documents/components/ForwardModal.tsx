import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from '@inertiajs/react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    department?: {
        id: number;
        name: string;
    };
}

interface ForwardModalProps {
    isOpen: boolean;
    onClose: () => void;
    processing: boolean;
    users: User[];
    documentId: number;
    nextThroughUser?: {
        user: {
            id: number;
            first_name: string;
            last_name: string;
            department_id: number;
        };
        id: number;
    } | null;
}

interface FormData {
    forward_to_id: string;
    comments: string;
    files: File[];
    [key: string]: any;
}

interface FileWithPreview {
    file: File;
    preview?: string;
    id: string;
}

const ForwardModal: React.FC<ForwardModalProps> = ({
    isOpen,
    onClose,
    processing,
    users,
    documentId,
    nextThroughUser
}) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { post, processing: isProcessing, setData, reset, data } = useForm<FormData>({
        forward_type: 'user',
        forward_to_id: '',
        comments: '',
        files: []
    });

    // Update form data whenever state changes
    useEffect(() => {
        setData({
            forward_type: 'user',
            forward_to_id: selectedUser,
            comments: comments,
            files: files.map(f => f.file)
        });
    }, [selectedUser, comments, files, setData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files) as File[];
            const filesWithPreviews: FileWithPreview[] = newFiles.map(file => {
                const fileWithPreview: FileWithPreview = {
                    file,
                    id: Math.random().toString(36).substr(2, 9)
                };

                // Create preview for image files
                if (file.type.startsWith('image/')) {
                    fileWithPreview.preview = URL.createObjectURL(file);
                }

                return fileWithPreview;
            });

            setFiles(prevFiles => [...prevFiles, ...filesWithPreviews]);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prevFiles => {
            const fileToRemove = prevFiles.find(f => f.id === id);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prevFiles.filter(f => f.id !== id);
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImageFile = (file: File) => {
        return file.type.startsWith('image/');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting || processing) {
            return;
        }

        if (!selectedUser) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Please select a recipient'
            });
            return;
        }

        // Set submitting state to prevent multiple clicks
        setIsSubmitting(true);
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to forward this document?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('documents.forward', documentId), {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        onClose();
                        reset();
                        setSelectedUser('');
                        setComments('');
                        // Clean up preview URLs
                        files.forEach(fileWithPreview => {
                            if (fileWithPreview.preview) {
                                URL.revokeObjectURL(fileWithPreview.preview);
                            }
                        });
                        setFiles([]);
                        setIsSubmitting(false);
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Document forwarded successfully',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: (errors: any) => {
                        setIsSubmitting(false);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: errors.message
                        });
                    }
                });
            }
        });
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSelectedUser('');
            setComments('');
            setIsSubmitting(false);
            // Clean up preview URLs
            files.forEach(fileWithPreview => {
                if (fileWithPreview.preview) {
                    URL.revokeObjectURL(fileWithPreview.preview);
                }
            });
            setFiles([]);
        } else if (nextThroughUser) {
            // Pre-select the next through user if available
            setSelectedUser(nextThroughUser.user.id.toString());
        }
    }, [isOpen, reset, nextThroughUser]);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            files.forEach(fileWithPreview => {
                if (fileWithPreview.preview) {
                    URL.revokeObjectURL(fileWithPreview.preview);
                }
            });
        };
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">Forward Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="dark:text-gray-200">Select Recipient</Label>
                        <Select
                            value={selectedUser}
                            onValueChange={setSelectedUser}
                        >
                            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                                <SelectValue placeholder="Select a recipient" className="dark:text-gray-400" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                                {users.length > 0 ? users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()} className="dark:text-gray-100 dark:hover:bg-gray-700">
                                        <span className="truncate max-w-[320px] block">{user.first_name} {user.last_name} | {user.department?.name || 'No Department'} | {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                                    </SelectItem>
                                )) : <SelectItem value="no-users" className="dark:text-gray-100 dark:hover:bg-gray-700">No users found</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-gray-200">Comments (Optional)</Label>
                        <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add any comments about forwarding this document..."
                            className="min-h-[100px] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-gray-200">Response Attachments (Optional)</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">These files will be added as response attachments to the document.</p>
                        <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            className="cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 file:dark:bg-gray-700 file:dark:text-gray-100 file:dark:border-gray-600"
                        />

                        {files.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files:</h4>
                                {files.map((fileWithPreview) => (
                                    <div key={fileWithPreview.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div className="flex-shrink-0">
                                            {isImageFile(fileWithPreview.file) ? (
                                                <ImageIcon className="h-8 w-8 text-blue-500" />
                                            ) : (
                                                <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                                    {fileWithPreview.file.name}
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(fileWithPreview.id)}
                                                    className="ml-2 h-6 w-6 p-0 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(fileWithPreview.file.size)}
                                            </p>

                                            {/* Image Preview */}
                                            {fileWithPreview.preview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={fileWithPreview.preview}
                                                        alt={fileWithPreview.file.name}
                                                        className="max-w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing || isSubmitting}
                            className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedUser || processing || isSubmitting}
                            className="dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {processing || isSubmitting ? 'Forwarding...' : 'Forward'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForwardModal;
