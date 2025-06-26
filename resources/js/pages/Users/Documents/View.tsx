import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { Link, useForm } from '@inertiajs/react';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import ForwardModal from './components/ForwardModal';
import { Download, FileText, FileCheck, Users, QrCode } from 'lucide-react';
import Swal from 'sweetalert2';

interface DocumentFile {
    id: number;
    original_filename: string;
    file_size: number;
    upload_type: string;
    uploaded_by: number;
    file_path?: string;
}

interface DocumentRecipient {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        department_id: number;
    };
    status: string;
    comments?: string;
    responded_at?: string;
    sequence?: number;
    forwarded_by?: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
    is_final_approver?: boolean;
}

interface Document {
    id: number;
    title: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
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
    final_recipient_id: number | null;
    can_respond: boolean;
    recipient_status: string | null;
    owner_id: number;
    is_public: boolean;
    barcode_path?: string;
    department_id: number;
    final_recipient?: {
        id: number;
        first_name: string;
        last_name: string;
        department_id: number;
    } | null;
}

interface Department {
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
    departments?: Array<{
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
        department_id: number;
        role: string;
    }>;
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};




// FileCard component for previewing and downloading files
const FileCard = ({ file, documentId, color = 'red' }: { file: any, documentId: number, color?: 'red' | 'blue' }) => (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col items-center border ${color === 'red' ? 'border-gray-100' : 'border-blue-100'}`}>
        <div className={`w-full h-48 flex items-center justify-center ${color === 'red' ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg mb-3 overflow-hidden`}>
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
                    <div className={`flex flex-col items-center justify-center ${color === 'red' ? 'text-gray-400' : 'text-blue-400'}`}>
                        <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">No Preview</span>
                    </div>
                )}
            </a>
        </div>
        <div className="w-full text-center">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.original_filename}>{file.original_filename}</p>
            <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.file_size)}</p>
            <a
                href={route('documents.download', { document: documentId, file: file.id })}
                download={file.original_filename}
                className={`inline-flex text-xs items-center gap-1 text-white ${color === 'red' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200'} px-2 py-2 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 mt-2`}
            >
                <Download className="w-4 h-4" />
                Download
            </a>
        </div>
    </div>
);

const ViewDocument = ({ document, auth, departments, users }: Props) => {
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('');
    const [comments, setComments] = useState('');
    const [revisionFile, setRevisionFile] = useState<File | null>(null);
    const [approveFile, setApproveFile] = useState<File | null>(null);

    const { post, delete: destroy, processing, setData } = useForm({
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

    const getDocumentTypeColor = (documentType: string) => {
        switch (documentType) {
            case 'special_order':
                return 'bg-purple-100 text-purple-800';
            case 'order':
                return 'bg-blue-100 text-blue-800';
            case 'memorandum':
                return 'bg-green-100 text-green-800';
            case 'for_info':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDocumentTypeDisplayName = (documentType: string) => {
        switch (documentType) {
            case 'special_order':
                return 'Special Order';
            case 'order':
                return 'Order';
            case 'memorandum':
                return 'Memorandum';
            case 'for_info':
                return 'For Info';
            default:
                return 'Unknown';
        }
    };

    // Group files by upload type
    const originalFiles = document.files.filter(file => file.upload_type === 'original');
    const responseFiles = document.files.filter(file => file.upload_type === 'response');

    // Use approval_chain if available, else fallback to recipients
    const approvalChain = (document as any).approval_chain || document.recipients;

    // Find through and to recipients for non-for_info documents
    const throughRecipient = document.document_type !== 'for_info' && approvalChain.length >= 1 ? approvalChain[0] : null;
    // The 'to' user is not yet a recipient if approvalChain.length < 2
    const toRecipientUserId = (document as any).to_user_id; // You may need to pass this from backend or infer from context
    const toRecipientExists = approvalChain.length >= 2;
    const isThroughUser = throughRecipient && throughRecipient.user.id === auth.user.id;

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Document Details</h1>
                    <Link href="/documents" className="ml-auto text-red-700 hover:text-red-900 font-semibold">Back to Documents</Link>
                </div>

                {/* Document Information Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                    <div className={`p-8 ${document.is_public && document.barcode_path ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FileCheck className="w-5 h-5 text-gray-500" />
                                <h2 className="text-xl font-semibold text-gray-900">Document Information</h2>
                            </div>
                            <dl className="space-y-5">
                                {/* document type information */}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentTypeColor(document.document_type)}`}>
                                            {getDocumentTypeDisplayName(document.document_type)}
                                        </span>
                                    </dd>
                                </div>
                                {/* Document Through Information */}
                                {document.document_type !== 'for_info' && (
                                    <>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Sent To</dt>
                                            <dd className="mt-1">
                                                {document.final_recipient ? (
                                                    <span className="text-gray-900 font-medium">
                                                        {document.final_recipient.first_name} {document.final_recipient.last_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">None</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Sent Through</dt>
                                            <dd className="mt-1">
                                                {throughRecipient
                                                    ? `${throughRecipient.user.first_name} ${throughRecipient.user.last_name}`
                                                    : <span className="text-gray-400">None</span>}
                                            </dd>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                                    <dd className="mt-1 text-base text-gray-900 font-semibold">{document.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>{document.status.charAt(0).toUpperCase() + document.status.slice(1)}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                    <dd className="mt-1 text-base text-gray-900">{document.owner.first_name} {document.owner.last_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Date Created</dt>
                                    <dd className="mt-1 text-base text-gray-900">{new Date(document.created_at).toLocaleDateString()}</dd>
                                </div>
                                {document.description && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                                        <dd className="mt-1 text-base text-gray-900">{document.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        {/* QR Code Section */}
                        {document.is_public && document.barcode_path && (
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <QrCode className="w-5 h-5 text-gray-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">Scan to View</h2>
                                </div>
                                <img src={`/storage/${document.barcode_path}`} alt="QR Code" className="w-40 h-40 mb-2" />
                                <span className="text-xs text-gray-500">Scan this QR code to access the document online.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Files Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">Files</h2>
                        </div>
                        <div className="space-y-8">
                            {/* Original Files Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Original Files</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {originalFiles.length === 0 && (
                                        <div className="col-span-full text-center text-gray-400">No original files uploaded.</div>
                                    )}
                                    {originalFiles.map((file) => (
                                        <div key={file.id} className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center border border-gray-200">
                                            <a
                                                href={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full"
                                                tabIndex={-1}
                                            >
                                                <div className="w-full h-40 flex items-center justify-center bg-white rounded-lg mb-3 overflow-hidden border border-gray-100">
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
                                                        <div className="flex flex-col items-center justify-center text-gray-300">
                                                            <FileText className="h-12 w-12 mb-2" />
                                                            <span className="text-xs">No Preview</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </a>
                                            <div className="w-full text-center">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={file.original_filename}>{file.original_filename}</p>
                                                <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.file_size)}</p>
                                                <a
                                                    href={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                    download={file.original_filename}
                                                    className="inline-flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-200 mt-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Response Files Section */}
                            {responseFiles.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Response Files</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {responseFiles.map((file) => (
                                            <div key={file.id} className="bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center border border-blue-200">
                                                <a
                                                    href={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full"
                                                    tabIndex={-1}
                                                >
                                                    <div className="w-full h-40 flex items-center justify-center bg-white rounded-lg mb-3 overflow-hidden border border-blue-100">
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
                                                            <div className="flex flex-col items-center justify-center text-blue-300">
                                                                <FileText className="h-12 w-12 mb-2" />
                                                                <span className="text-xs">No Preview</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </a>
                                                <div className="w-full text-center">
                                                    <p className="text-sm font-medium text-gray-900 truncate" title={file.original_filename}>{file.original_filename}</p>
                                                    <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.file_size)}</p>
                                                    <a
                                                        href={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                        download={file.original_filename}
                                                        className="inline-flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 mt-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <FileCheck className="w-5 h-5 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">Document Actions</h2>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {document.can_respond && document.document_type === 'for_info' && (
                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Are you sure?',
                                            text: 'Do you want to mark this document as received?',
                                            icon: 'question',
                                            showCancelButton: true,
                                            confirmButtonColor: '#16a34a',
                                            cancelButtonColor: '#d1d5db',
                                            confirmButtonText: 'Yes, mark it as received!',
                                            cancelButtonText: 'Cancel'
                                        });
                                        if (result.isConfirmed) {
                                            post(route('documents.received', { document: document.id }), {
                                                onSuccess: () => {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Received!',
                                                        text: 'The document has been marked as received.',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    }).then(() => window.location.reload());
                                                },
                                                onError: (errors: any) => {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Error',
                                                        text: errors?.message || 'An error occurred while marking the document as received.'
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow"
                                >
                                    Received
                                </button>
                            )}


                            {document.can_respond === false && document.document_type === 'for_info' && document.final_recipient_id !== auth.user.id && (
                                <button
                                    onClick={() => setIsForwardModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Forward to Office
                                </button>
                            )}


                            {document.can_respond && document.document_type !== 'for_info' && document.final_recipient_id === auth.user.id && (
                                <>
                                    <button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'Do you want to approve this document?',
                                                icon: 'question',
                                                showCancelButton: true,
                                                confirmButtonColor: '#16a34a',
                                                cancelButtonColor: '#d1d5db',
                                                confirmButtonText: 'Yes, approve it!',
                                                cancelButtonText: 'Cancel'
                                            });
                                            if (result.isConfirmed) {
                                                setIsApproveModalOpen(true);
                                            }
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'Do you want to reject this document?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#b91c1c',
                                                cancelButtonColor: '#d1d5db',
                                                confirmButtonText: 'Yes, reject it!',
                                                cancelButtonText: 'Cancel'
                                            });
                                            if (result.isConfirmed) {
                                                setIsRejectModalOpen(true);
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold shadow"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {/* Show Forward button only for through user and if toRecipient does not exist */}
                            {isThroughUser && !toRecipientExists && (
                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Forward Document',
                                            text: 'Do you want to forward this document to the next recipient?',
                                            icon: 'info',
                                            showCancelButton: true,
                                            confirmButtonColor: '#2563eb',
                                            cancelButtonColor: '#d1d5db',
                                            confirmButtonText: 'Yes, forward it!',
                                            cancelButtonText: 'Cancel'
                                        });
                                        if (result.isConfirmed) {
                                            setData('forward_to_id', toRecipientUserId);
                                            setData('comments', '');
                                            post(route('documents.forward', { document: document.id }), {
                                                onSuccess: () => {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Forwarded!',
                                                        text: 'The document has been forwarded.',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    }).then(() => window.location.reload());
                                                },
                                                onError: (errors: any) => {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Error',
                                                        text: errors?.message || 'An error occurred while forwarding the document.'
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow"
                                >
                                    Forward to Next Recipient
                                </button>
                            )}
                        </div>
                        {/* Publish Publicly Button for Owner */}
                        {document.status === 'approved' && !document.is_public && document.owner_id === auth.user.id && (
                            <div className="mt-4">
                                <button
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold shadow"
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Are you sure?',
                                            text: 'Do you want to publish this document publicly?',
                                            icon: 'info',
                                            showCancelButton: true,
                                            confirmButtonColor: '#6366f1',
                                            cancelButtonColor: '#d1d5db',
                                            confirmButtonText: 'Yes, publish it!',
                                            cancelButtonText: 'Cancel'
                                        });
                                        if (result.isConfirmed) {
                                            post(route('documents.publish', { document: document.id }), {
                                                onSuccess: () => {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Published!',
                                                        text: 'The document is now public.',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    }).then(() => window.location.reload());
                                                },
                                                onError: (errors) => {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Error',
                                                        text: errors?.message || 'An error occurred while publishing the document.'
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    disabled={processing}
                                >
                                    Publish Publicly
                                </button>
                            </div>
                        )}


                        {/* Cancel Document Button for Owner */}
                        {document.owner_id === auth.user.id && ['pending', 'in_review', 'approved'].includes(document.status) && (
                            <div className="mt-4">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold shadow"
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: 'Are you sure?',
                                            text: 'Do you really want to cancel this document?',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#d33',
                                            cancelButtonColor: '#3085d6',
                                            confirmButtonText: 'Yes, cancel it!',
                                            cancelButtonText: 'No, keep it'
                                        });
                                        if (result.isConfirmed) {
                                            destroy(route('documents.destroy', { document: document.id }), {
                                                onSuccess: () => {
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Deleted!',
                                                        text: 'The document has been deleted.',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    }).then(() => window.location.href = route('users.documents'));
                                                },
                                                onError: (errors: any) => {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Error',
                                                        text: errors?.message || 'An error occurred while cancelling the document.'
                                                    });
                                                }
                                            });
                                        }
                                    }}
                                    disabled={processing}
                                >
                                    Cancel Document
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Approval Chain Timeline */}
                {approvalChain.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="w-5 h-5 text-gray-500" />
                                <h2 className="text-xl font-semibold text-gray-900">Approval Chain</h2>
                            </div>
                            <div className="relative ml-4">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full" style={{ zIndex: 0 }}></div>
                                <div className="space-y-8">
                                    {approvalChain.map((recipient: DocumentRecipient, idx: number) => (
                                        <div key={recipient.id} className="relative flex items-start gap-4">
                                            <div className="z-10">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusColor(recipient.status)} bg-white`}></div>
                                            </div>
                                            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-base font-medium text-gray-900">
                                                        {recipient.user.first_name} {recipient.user.last_name}
                                                        {recipient.forwarded_by && (
                                                            <span className="ml-2 text-xs text-gray-500">(Sent through: {recipient.forwarded_by.first_name} {recipient.forwarded_by.last_name})</span>
                                                        )}
                                                    </p>
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(recipient.status)}`}>
                                                        {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                                                    </span>
                                                </div>
                                                {recipient.comments && (
                                                    <p className="text-sm text-gray-500 mt-2">{recipient.comments}</p>
                                                )}
                                                {recipient.responded_at && (
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        {/* display date and time in the format of dd/mm/yyyy hh:mm AM/PM */}
                                                        Responded: {new Date(recipient.responded_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modals */}
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
