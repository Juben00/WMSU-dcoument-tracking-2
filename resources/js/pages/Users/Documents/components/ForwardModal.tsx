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
}

interface ForwardModalProps {
    isOpen: boolean;
    onClose: () => void;
    processing: boolean;
    users: User[];
    documentId: number;
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
    documentId
}) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState<FileWithPreview[]>([]);

    const { post, processing: isProcessing, setData, reset } = useForm<FormData>({
        forward_to_id: '',
        comments: '',
        files: []
    });

    // Update form data whenever state changes
    useEffect(() => {
        setData({
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

        if (!selectedUser) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Please select a recipient'
            });
            return;
        }

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
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Document forwarded successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (errors: any) => {
                let errorMessage = 'An error occurred while forwarding the document';

                if (errors.message) {
                    errorMessage = errors.message;
                } else if (errors.forward_to_id) {
                    errorMessage = errors.forward_to_id;
                } else if (errors.files) {
                    errorMessage = errors.files;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: errorMessage
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
            // Clean up preview URLs
            files.forEach(fileWithPreview => {
                if (fileWithPreview.preview) {
                    URL.revokeObjectURL(fileWithPreview.preview);
                }
            });
            setFiles([]);
        }
    }, [isOpen, reset]);

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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Forward Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Recipient</Label>
                        <Select
                            value={selectedUser}
                            onValueChange={setSelectedUser}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a recipient" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.length > 0 ? users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.first_name} {user.last_name} ({user.role})
                                    </SelectItem>
                                )) : <SelectItem value="no-users">No users found</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Comments (Optional)</Label>
                        <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add any comments about forwarding this document..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Response Attachments (Optional)</Label>
                        <p className="text-sm text-gray-500 mb-2">These files will be added as response attachments to the document.</p>
                        <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />

                        {files.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                                {files.map((fileWithPreview) => (
                                    <div key={fileWithPreview.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            {isImageFile(fileWithPreview.file) ? (
                                                <ImageIcon className="h-8 w-8 text-blue-500" />
                                            ) : (
                                                <FileText className="h-8 w-8 text-gray-500" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {fileWithPreview.file.name}
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(fileWithPreview.id)}
                                                    className="ml-2 h-6 w-6 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(fileWithPreview.file.size)}
                                            </p>

                                            {/* Image Preview */}
                                            {fileWithPreview.preview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={fileWithPreview.preview}
                                                        alt={fileWithPreview.file.name}
                                                        className="max-w-full h-32 object-cover rounded border"
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
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedUser || processing}
                        >
                            {processing ? 'Forwarding...' : 'Forward'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForwardModal;
