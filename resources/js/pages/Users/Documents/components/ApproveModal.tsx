import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Textarea } from "@/components/ui/textarea";
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface ApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: number;
}

interface FormData {
    status: string;
    comments: string;
    attachment_file: File | null;
    forward_to_id: number | null;
    is_final_approver: boolean;
    [key: string]: any;
}

interface PageProps {
    auth: {
        user: {
            role: string;
        };
    };
    [key: string]: any;
}

const ApproveModal: React.FC<ApproveModalProps> = ({ isOpen, onClose, documentId }) => {
    const [comments, setComments] = useState('');
    const [approveFile, setApproveFile] = useState<File | null>(null);
    const { auth } = usePage<PageProps>().props;

    const { post, processing, setData, data } = useForm<FormData>({
        status: 'approved',
        comments: '',
        attachment_file: null,
        forward_to_id: null,
        is_final_approver: auth.user.role === 'admin' ? true : false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData({
            status: 'approved',
            comments: comments,
            attachment_file: approveFile,
            forward_to_id: null,
            is_final_approver: auth.user.role === 'admin'
        });

        post(route('documents.respond', documentId), {
            onSuccess: () => {
                onClose();
                setComments('');
                setApproveFile(null);
                toast.success('Document approved successfully');
            },
            onError: (errors: any) => {
                if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('An error occurred while approving the document');
                }
            }
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                onClose();
                setComments('');
                setApproveFile(null);
            }}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">Document Approval Form</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comments</label>
                            <Textarea
                                value={comments}
                                onChange={(e) => {
                                    setComments(e.target.value);
                                    setData('comments', e.target.value);
                                }}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
                            <input
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setApproveFile(file);
                                    setData('attachment_file', file);
                                }}
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-green-50 file:text-green-700
                                    hover:file:bg-green-100"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    setComments('');
                                    setApproveFile(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Approve'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ApproveModal;
