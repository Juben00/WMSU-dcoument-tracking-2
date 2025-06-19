import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { Link, useForm } from '@inertiajs/react';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import ForwardModal from './components/ForwardModal';
import { Download } from 'lucide-react';

interface DocumentFile {
    id: number;
    original_filename: string;
    file_size: number;
    upload_type: string;
    uploaded_by: number;
}

interface DocumentRecipient {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        office_id: number;
    };
    status: string;
    comments?: string;
    responded_at?: string;
}

interface Document {
    id: number;
    title: string;
    description?: string;
    status: string;
    created_at: string;
    owner: {
        first_name: string;
        last_name: string;
    };
    files: DocumentFile[];
    recipients: DocumentRecipient[];
    is_final_approver: boolean;
    can_respond: boolean;
    recipient_status: string | null;
}

interface Office {
    id: number;
    name: string;
    contact_person: {
        id: number;
        name: string;
        role: string;
    } | null;
}

interface Props {
    document: Document;
    auth: {
        user: {
            id: number;
        };
    };
    offices?: Array<{
        id: number;
        name: string;
        contact_person: {
            id: number;
            name: string;
            role: string;
        } | null;
    }>;
    users?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        office_id: number;
        role: string;
    }>;
}

const ViewDocument = ({ document, auth, offices, users }: Props) => {
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('');
    const [comments, setComments] = useState('');
    const [revisionFile, setRevisionFile] = useState<File | null>(null);
    const [approveFile, setApproveFile] = useState<File | null>(null);

    const { post, processing, setData } = useForm({
        status: '',
        comments: '',
        revision_file: null as File | null,
        forward_to_id: null as number | null,
    });


    console.log(document);
    // Check if current user is an active recipient
    const currentRecipient = document.recipients.find(
        (r: DocumentRecipient) => r.user.id === auth.user.id
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'returned':
                return 'bg-orange-100 text-orange-800';
            case 'in_review':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Group files by upload type
    const originalFiles = document.files.filter(file => file.upload_type === 'original');
    const responseFiles = document.files.filter(file => file.upload_type === 'response');

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Document Details</h1>
                    <Link href="/documents" className="text-red-700 hover:text-red-900">
                        Back to Documents
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Title</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{document.title}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                                                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {document.owner.first_name} {document.owner.last_name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date Created</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(document.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    {document.description && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{document.description}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Files</h2>
                                <div className="space-y-4">
                                    {/* Original Files Section */}
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Files</h2>
                                    <div className="space-y-4 mb-8">
                                        {originalFiles.map((file) => (
                                            <div key={file.id} className="flex items-center gap-3 truncate justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3 truncate">
                                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="flex flex-col truncate">
                                                        <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={route('documents.download', { document: document.id, file: file.id })}
                                                    download={file.original_filename}
                                                    className="inline-flex items-center gap-1 text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-200"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Response Files Section */}
                                    {responseFiles.length > 0 && (
                                        <>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Files</h2>
                                            <div className="space-y-4">
                                                {responseFiles.map((file) => (
                                                    <div key={file.id} className="flex items-center gap-3 truncate justify-between p-4 bg-blue-50 rounded-lg">
                                                        <div className="flex items-center space-x-3 truncate">
                                                            <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <div className="flex flex-col truncate">
                                                                <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                                                                <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={route('documents.download', { document: document.id, file: file.id })}
                                                            download={file.original_filename}
                                                            className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Actions</h2>
                            <div className="flex space-x-4">
                                {/* Document Actions */}
                                {document.can_respond && (
                                    <>
                                        <button
                                            onClick={() => setIsApproveModalOpen(true)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setIsRejectModalOpen(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {currentRecipient && document.recipient_status === 'approved' && (
                                    <button
                                        onClick={() => setIsForwardModalOpen(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Forward to Office
                                    </button>
                                )}
                            </div>
                        </div>

                        {document.recipients.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Chain</h2>
                                <div className="space-y-4">
                                    {document.recipients.map((recipient) => (
                                        <div key={recipient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {recipient.user.first_name} {recipient.user.last_name}
                                                </p>
                                                {recipient.comments && (
                                                    <p className="text-sm text-gray-500 mt-1">{recipient.comments}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(recipient.status)}`}>
                                                    {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                                                </span>
                                                {recipient.responded_at && (
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(recipient.responded_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ApproveModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                documentId={document.id}
            />

            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                documentId={document.id}
            />

            <ForwardModal
                isOpen={isForwardModalOpen}
                onClose={() => setIsForwardModalOpen(false)}
                processing={processing}
                users={users || []}
                documentId={document.id}
            />
        </>
    );
};

export default ViewDocument;
