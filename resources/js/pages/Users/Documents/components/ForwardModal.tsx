import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const ForwardModal: React.FC<ForwardModalProps> = ({
    isOpen,
    onClose,
    processing,
    users,
    documentId
}) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [comments, setComments] = useState('');
    const [files, setFiles] = useState<File[]>([]);

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
            files: files
        });
    }, [selectedUser, comments, files, setData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files) as File[];
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
            setFiles([]);
        }
    }, [isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
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
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                        {files.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <span className="text-sm truncate flex-1">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            className="ml-2"
                                        >
                                            Remove
                                        </Button>
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
