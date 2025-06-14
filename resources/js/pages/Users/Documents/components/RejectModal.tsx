import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Textarea } from "@/components/ui/textarea";
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface RejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReject: (comments: string, file: File | null) => void;
    processing: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onReject, processing }) => {
    const [comments, setComments] = useState('');
    const [rejectFile, setRejectFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onReject(comments, rejectFile);
        setComments('');
        setRejectFile(null);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                onClose();
                setComments('');
                setRejectFile(null);
            }}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">Document Rejection Form</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comments</label>
                            <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="mt-1"
                                rows={3}
                                placeholder="Please provide a reason for rejection..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
                            <input
                                type="file"
                                onChange={(e) => setRejectFile(e.target.files?.[0] || null)}
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-red-50 file:text-red-700
                                    hover:file:bg-red-100"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    setComments('');
                                    setRejectFile(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !comments.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Reject'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default RejectModal;
