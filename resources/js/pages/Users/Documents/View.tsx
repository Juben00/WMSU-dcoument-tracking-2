import React, { useState, useEffect } from 'react';
import Navbar from '@/components/User/navbar';
import { Link, useForm } from '@inertiajs/react';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import ForwardModal from './components/ForwardModal';
import { Download, FileText, FileCheck, Users, BarChart3, Copy, ExternalLink, Calendar, User, Building, Hash, List, ScanEye, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import ForwardOtherOfficeModal from './components/ForwardOtherOfficeModal';
import { log } from 'console';
import ReturnModal from './components/ReturnModal';

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
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        role: string;
    };
    department: {
        id: number;
        name: string;
    };
    status: string;
    comments?: string;
    responded_at?: string;
    sequence?: number;
    forwarded_by?: {
        id: number;
        first_name: string;
        last_name: string;
        role: string;
        department?: {
            id: number;
            name: string;
        };
    } | null;
    response_file?: DocumentFile;
    received_by?: {
        id: number;
        first_name: string;
        last_name: string;
        role: string;
    };
}

interface Document {
    id: number;
    subject: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    description?: string;
    status: string;
    created_at: string;
    owner: {
        first_name: string;
        last_name: string;
        department?: {
            id: number;
            name: string;
        };
    };
    files: DocumentFile[];
    recipients: DocumentRecipient[];
    final_recipient_id: number | null;
    can_respond: boolean;
    can_respond_other_data: DocumentRecipient | null;
    recipient_status: string | null;
    owner_id: number;
    is_public: boolean;
    barcode_path?: string;
    public_token?: string;
    barcode_value?: string;
    department_id: number;
    final_recipient?: {
        id: number;
        name: string;
    } | null;
    approval_chain: DocumentRecipient[];
    order_number: string;
    through_department_ids?: (string | number)[];
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
            role: string;
            department_id: number;
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
        department?: {
            id: number;
            name: string;
        };
    }>;
    otherDepartments?: Array<{
        id: number;
        name: string;
    }>;
    throughUsers?: Array<{
        id: number;
        name: string;
    }>;
}

interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    description: string;
    created_at: string;
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    };
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
    console.log('file', file),
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col items-center border ${color === 'red' ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500' : 'border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500'}`}>
        <div className={`w-full h-48 flex items-center justify-center ${color === 'red' ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600' : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'} rounded-lg mb-4 overflow-hidden`}>
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
                    <div className={`flex flex-col items-center justify-center ${color === 'red' ? 'text-gray-400 dark:text-gray-500' : 'text-blue-400 dark:text-blue-500'}`}>
                        <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}
            </a>
        </div>
        <div className="w-full text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1" title={file.original_filename}>{file.original_filename}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">{formatFileSize(file.file_size)}</p>
            <a
                href={route('documents.download', { document: documentId, file: file.id })}
                download={file.original_filename}
                className={`inline-flex text-xs items-center gap-2 text-white ${color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-200' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-200'} px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
                <Download className="w-4 h-4" />
                Download
            </a>
        </div>
    </div>
);

const formatActivityLogAction = (action: string) => {
    switch (action) {
        case 'document_sent':
            return 'Document Sent';
        case 'forwarded':
            return 'Document Forwarded';
        case 'approved':
            return 'Document Approved';
        case 'rejected':
            return 'Document Rejected';
        case 'returned':
            return 'Document Returned';
        case 'published':
            return 'Document Published';
        case 'unpublished':
            return 'Document Unpublished';
        case 'deleted':
            return 'Document Deleted';
        case 'document_deleted':
            return 'Document Deleted';
        case 'document_forwarded':
            return 'Document Forwarded';
        case 'document_received':
            return 'Document Received';
        case 'document_resent':
            return 'Document Resent';
        default:
            return action;
    }
};

const ViewDocument = ({ document, auth, users, otherDepartments, throughUsers, activityLogs = [] }: Props & { activityLogs?: ActivityLog[] }) => {
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [isForwardOtherOfficeModalOpen, setIsForwardOtherOfficeModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('');
    const [comments, setComments] = useState('');
    const [revisionFile, setRevisionFile] = useState<File | null>(null);
    const [approveFile, setApproveFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    const { post, delete: destroy, processing, setData } = useForm({
        status: '',
        comments: '',
        revision_file: null as File | null,
        forward_to_id: null as number | null,
    });

    // Check if current user is an active recipient
    // const currentRecipient = document.recipients.find(
    //     (r: DocumentRecipient) => r.user.id === auth.user.id
    // );

    // Helper functions to determine user permissions and document states
    const isOwner = () => document.owner_id === auth.user.id;
    const isFinalRecipient = () => document.final_recipient?.id === auth.user.department_id && auth.user.role === 'admin';
    const isAdmin = () => auth.user.role === 'admin';
    const isForInfoDocument = () => document.document_type === 'for_info';
    const isNonForInfoDocument = () => document.document_type !== 'for_info';
    const canRespond = () => document.can_respond;
    const isNotOwner = () => !isOwner();
    const isNotFinalRecipient = () => !isFinalRecipient();
    const isReturned = () => document.status === 'returned';
    const isPending = () => document.status === 'pending';
    const notApprovedAndRejected = () => !['approved', 'rejected'].includes(document.status);

    // Action permission checks
    const canMarkAsReceived = () => {
        if (isForInfoDocument()) {
            return canRespond();
        }
        return canRespond() && isNonForInfoDocument() && isNotFinalRecipient() && !isReturned() && isPending();
    };

    const canApproveOrReject = () => {
        return canRespond() && isNonForInfoDocument() && isFinalRecipient() && !isReturned() && notApprovedAndRejected();
    };

    console.log('can respond', canRespond());
    console.log('is final recipient', !isFinalRecipient());
    console.log('is not owner', !isNotOwner());
    console.log('!is returned', !isReturned());
    console.log('!pending', !isPending());

    // Removed canForwardToOffice and its usages
    const canForwardToOffice = () => {
        return canRespond() && isNotOwner() && !isReturned() && !isPending();
    };

    const canForwardToOtherOffice = () => {
        return canRespond() && isNotOwner() && !isReturned() && !isPending();
    };

    const canReturnDocument = () => {
        return canRespond() && isNotOwner() && isNonForInfoDocument() && !isReturned() && !isPending() && notApprovedAndRejected();
    };

    const canPublishPublicly = () => {
        return ['approved', 'received'].includes(document.status) && !document.is_public && isOwner();
    };

    const canUnpublish = () => {
        return document.is_public && isOwner();
    };

    const canCancelDocument = () => {
        return isOwner() && ['pending', 'in_review', 'approved', 'returned', 'rejected'].includes(document.status);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700';
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
            case 'returned':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        }
    };

    const getDocumentTypeColor = (documentType: string) => {
        switch (documentType) {
            case 'special_order':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700';
            case 'order':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700';
            case 'memorandum':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700';
            case 'for_info':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
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
    const approvalChain = (document as Document).approval_chain || document.recipients;

    // Find all through recipients for non-for_info documents
    // const throughRecipients = document.document_type !== 'for_info'
    //     ? approvalChain.filter((recipient: DocumentRecipient) =>
    //         !document.final_recipient || recipient.department.id !== document.final_recipient.id
    //     )
    //     : [];

    console.log('responseFiles', responseFiles);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const getPublicDocumentUrl = () => {
        const token = document.barcode_value || document.public_token;
        return route('documents.public_view', { public_token: token });
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Details</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage document information</p>
                                </div>
                            </div>
                            <Link
                                href="/documents"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 font-semibold rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                ← Back to Documents
                            </Link>
                        </div>
                    </div>

                    {/* Document Information Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* Document Info */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <FileCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Document Information</h2>
                                    </div>
                                    <dl className="space-y-6">
                                        {/* Document Type and Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                                <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <Hash className="w-4 h-4" />
                                                    Document Type
                                                </dt>
                                                <dd className="mt-1">
                                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border ${getDocumentTypeColor(document.document_type)}`}>
                                                        {getDocumentTypeDisplayName(document.document_type)}
                                                    </span>
                                                </dd>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                                <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <BarChart3 className="w-4 h-4" />
                                                    Status
                                                </dt>
                                                <dd className="mt-1">
                                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(document.status)}`}>
                                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                                    </span>
                                                </dd>
                                            </div>
                                        </div>

                                        {/* Document Through Information */}
                                        {document.document_type !== 'for_info' && (
                                            <>
                                                {/* Sent To Department */}
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-700">
                                                    <dt className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        Sent To
                                                    </dt>
                                                    <dd className="mt-1">
                                                        <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                {document.final_recipient?.name ? document.final_recipient.name.charAt(0) : ''}
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                    {document.final_recipient?.name || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </dd>
                                                </div>

                                                {/* Sent Through Departments */}
                                                {throughUsers && throughUsers.length > 0 && (
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-700">
                                                        <dt className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            Sent Through
                                                        </dt>
                                                        <dd className="mt-1">
                                                            <div className="space-y-3">
                                                                {throughUsers.map((dept) => (
                                                                    <div key={dept.id} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600">
                                                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                            {dept.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                                {dept.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </dd>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Order Number */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Order Number */}
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                                <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2 flex items-center gap-2">
                                                    <Hash className="w-4 h-4" />
                                                    Order Number
                                                </dt>
                                                <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200 font-bold">{document.order_number}</dd>
                                            </div>
                                            {/* Date Created */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 dark:border-gray-600 dark:bg-gray-800">
                                                <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Date Created
                                                </dt>
                                                <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200 font-semibold">{new Date(document.created_at).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</dd>
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                            <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2">Subject</dt>
                                            <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200 font-semibold leading-relaxed">{document.subject}</dd>
                                        </div>

                                        {/* Description */}
                                        {document.description && (
                                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                                <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2">Description</dt>
                                                <dd className="mt-1 text-gray-900 dark:text-gray-200 leading-relaxed">{document.description}</dd>
                                            </div>
                                        )}

                                        {/* Created By */}
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                            <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Created By
                                            </dt>
                                            <dd className="mt-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {document.owner.first_name.charAt(0)}{document.owner.last_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                                                            {document.owner.first_name} {document.owner.last_name}
                                                        </span>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {document.owner.department?.name || 'No Department'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </dd>
                                        </div>


                                    </dl>
                                </div>
                                {/* Barcode & Link Section */}
                                <div className="col-span-2 flex flex-col items-center gap-4 w-full h-fit ">
                                    {(document.barcode_path || document.is_public) && (
                                        <div className=" bg-white dark:bg-gray-900 rounded-xl w-full h-fit p-6 border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                <ScanEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                Access Document
                                            </h3>
                                            {document.barcode_path && (
                                                <>
                                                    <img src={`/storage/${document.barcode_path}`} alt="Barcode" className="w-48 mb-4 rounded border mx-auto border-gray-200 dark:border-gray-700 bg-white" />
                                                    {/* Barcode Value Card */}
                                                    <div className="w-full max-w-sm mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center border border-gray-200 dark:border-gray-700 mb-4">
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Barcode</span>
                                                        <div className="flex items-center w-full justify-center gap-2 mb-2">
                                                            <span className="text-base font-mono text-gray-800 dark:text-gray-200 truncate max-w-[200px]" title={document.barcode_value || document.public_token}>
                                                                {document.barcode_value || document.public_token}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(document.barcode_value || document.public_token || '');
                                                                    setCopied(true);
                                                                    setTimeout(() => setCopied(false), 2000);
                                                                }}
                                                                className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                                                                title="Copy"
                                                                type="button"
                                                            >
                                                                <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            </button>
                                                            <a
                                                                href={`/storage/${document.barcode_path}`}
                                                                download={`barcode-${document.order_number || document.id}.png`}
                                                                className="p-2 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-200 text-center font-semibold mb-2">
                                                        Scan or use the code to access the document
                                                    </span>
                                                </>
                                            )}
                                            {document.is_public && (
                                                <div className="w-full max-w-sm mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4 flex flex-col items-center border border-blue-200 dark:border-blue-700 mt-4">
                                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Public Link</span>
                                                    <div className="flex items-center w-full justify-center gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={getPublicDocumentUrl()}
                                                            readOnly
                                                            className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-200 dark:bg-blue-900/20 bg-transparent border-none outline-none"
                                                        />
                                                        <button
                                                            onClick={() => copyToClipboard(getPublicDocumentUrl())}
                                                            className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                                                            title="Copy Link"
                                                        >
                                                            <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </button>
                                                        <a
                                                            href={getPublicDocumentUrl()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                                                            title="Open"
                                                        >
                                                            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        </a>
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                                                        Share this link for access
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className=" bg-white dark:bg-gray-900 rounded-xl w-full h-fit p-6 border border-gray-200 dark:border-gray-700">
                                        {/* Actions Section */}
                                        <div className="w-full mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                Actions
                                            </h3>
                                            <div className="flex flex-wrap gap-3 justify-center">
                                                {/* {canMarkAsReceived() && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: 'Are you sure?',
                                                                text: 'Do you want to mark this document as received?',
                                                                icon: 'question',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#16a34a',
                                                                cancelButtonColor: '#d1d5db',
                                                                confirmButtonText: 'Yes',
                                                                cancelButtonText: 'No'
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
                                                                            text: errors?.message || 'An error occurred.'
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Receive
                                                    </button>
                                                )} */}
                                                {canApproveOrReject() && (
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
                                                                    confirmButtonText: 'Yes',
                                                                    cancelButtonText: 'No'
                                                                });
                                                                if (result.isConfirmed) {
                                                                    setIsApproveModalOpen(true);
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow transition"
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
                                                                    confirmButtonText: 'Yes',
                                                                    cancelButtonText: 'No'
                                                                });
                                                                if (result.isConfirmed) {
                                                                    setIsRejectModalOpen(true);
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {canForwardToOffice() && (
                                                    <button
                                                        onClick={() => setIsForwardModalOpen(true)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Forward within Office
                                                    </button>
                                                )}
                                                {canForwardToOtherOffice() && (
                                                    <button
                                                        onClick={() => setIsForwardOtherOfficeModalOpen(true)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Forward to Other Office
                                                    </button>
                                                )}
                                                {canReturnDocument() && (
                                                    <button
                                                        onClick={() => setIsReturnModalOpen(true)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Return
                                                    </button>
                                                )}
                                                {isOwner() && document.status === 'returned' && (
                                                    <Link
                                                        href={route('users.documents.edit', { document: document.id })}
                                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                                {canPublishPublicly() && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: 'Are you sure?',
                                                                text: 'Do you want to publish this document publicly?',
                                                                icon: 'info',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#6366f1',
                                                                cancelButtonColor: '#d1d5db',
                                                                confirmButtonText: 'Yes',
                                                                cancelButtonText: 'No'
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
                                                                            text: errors?.message || 'An error occurred.'
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                {canUnpublish() && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: 'Are you sure?',
                                                                text: 'Do you want to unpublish this document? It will no longer be publicly accessible.',
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#ea580c',
                                                                cancelButtonColor: '#d1d5db',
                                                                confirmButtonText: 'Yes',
                                                                cancelButtonText: 'No'
                                                            });
                                                            if (result.isConfirmed) {
                                                                post(route('documents.unpublish', { document: document.id }), {
                                                                    onSuccess: () => {
                                                                        Swal.fire({
                                                                            icon: 'success',
                                                                            title: 'Unpublished!',
                                                                            text: 'The document is no longer public.',
                                                                            timer: 1500,
                                                                            showConfirmButton: false
                                                                        }).then(() => window.location.reload());
                                                                    },
                                                                    onError: (errors) => {
                                                                        Swal.fire({
                                                                            icon: 'error',
                                                                            title: 'Error',
                                                                            text: errors?.message || 'An error occurred.'
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Unpublish
                                                    </button>
                                                )}
                                                {canCancelDocument() && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await Swal.fire({
                                                                title: 'Are you sure?',
                                                                text: 'Do you really want to cancel this document?',
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#d33',
                                                                cancelButtonColor: '#3085d6',
                                                                confirmButtonText: 'Yes',
                                                                cancelButtonText: 'No'
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
                                                                            text: errors?.message || 'An error occurred.'
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                            {/* Instruction below action buttons */}
                                            <div className="w-full text-center mt-4">
                                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                    If the document has multiple <b>Sent Through</b> users, it must be forwarded to each of them in order before it can be sent to the <b>Sent To</b> user.
                                                </span>
                                            </div>
                                            {/* Tips Section */}
                                            <div className="w-full flex justify-center mt-6">
                                                <div className="max-w-xl w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-5 flex flex-col items-start shadow">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-base font-bold text-blue-800 dark:text-blue-200">Tips for Using the Document Workflow</span>
                                                    </div>
                                                    <ul className="list-disc pl-6 text-sm text-blue-900 dark:text-blue-100 space-y-1">
                                                        <li>Check the <b>Sent Through</b> chain to know the required approval path before forwarding.</li>
                                                        <li>Use the <b>Forward within Office</b> button to send documents to colleagues in your department.</li>
                                                        <li>Use <b>Forward to Other Office</b> for cross-department routing.</li>
                                                        <li>Only the final recipient (the <b>Sent To</b> user) can approve or reject the document.</li>
                                                        <li>Use the barcode or public link to quickly share or access the document externally.</li>
                                                        <li>Track all actions and comments in the Approval Chain and Document History sections.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-600">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Files</h2>
                            </div>
                            <div className="space-y-10">
                                {/* Original Files Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Original Files
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {originalFiles.length === 0 && (
                                            <div className="col-span-full text-center py-12">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No original files uploaded.</p>
                                            </div>
                                        )}
                                        {originalFiles.map((file) => (
                                            <FileCard key={file.id} file={file} documentId={document.id} color="red" />
                                        ))}
                                    </div>
                                </div>

                                {/* Response Files Section */}
                                {responseFiles.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400 mb-6 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Response Files
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {responseFiles.map((file) => (
                                                <FileCard key={file.id} file={file} documentId={document.id} color="blue" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Approval Chain & Document History Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Approval Chain Timeline */}
                        {approvalChain.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600 h-full flex flex-col">
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approval Chain</h2>
                                    </div>
                                    <div className="relative ml-4 flex-1">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full" style={{ zIndex: 0 }}></div>
                                        <div className="space-y-8">
                                            {approvalChain.map((recipient: DocumentRecipient, idx: number) => {
                                                // Find all response files uploaded by this recipient
                                                const recipientResponseFiles = responseFiles.filter(
                                                    (file: any) => file.document_recipient_id === recipient.id
                                                );

                                                const recipientName = recipient.user ? `${recipient.user.first_name} ${recipient.user.last_name}` : recipient.department?.name;

                                                console.log('recipient', recipient);

                                                return (
                                                    <div key={recipient.id} className="relative flex items-start gap-6">
                                                        <div className="z-10">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStatusColor(recipient.status)} bg-white shadow-lg`}>
                                                                <div className={`w-3 h-3 rounded-full ${recipient.status === 'approved' ? 'bg-emerald-500' : recipient.status === 'rejected' ? 'bg-red-500' : recipient.status === 'pending' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-gray-700">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="text-lg font-semibold text-gray-900">
                                                                    {recipient.forwarded_by ? (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                                    {recipient.forwarded_by.first_name.charAt(0)}{recipient.forwarded_by.last_name.charAt(0)}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                        {recipient.forwarded_by.first_name} {recipient.forwarded_by.last_name}
                                                                                    </div>
                                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                        {recipient.forwarded_by.department?.name || 'No Department'} • {recipient.forwarded_by.role
                                                                                            ? recipient.forwarded_by.role.charAt(0).toUpperCase() + recipient.forwarded_by.role.slice(1)
                                                                                            : 'Unknown'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                                                <span>→</span>
                                                                                <span>Forwarded to:</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                                    {recipientName?.charAt(0) || ''}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                        {recipientName || 'No Department'}
                                                                                        {recipient.received_by ? ` (Received by ${recipient.received_by.first_name} ${recipient.received_by.last_name})` : ''}
                                                                                    </div>
                                                                                    {/* Removed recipient.user?.role display as recipient.user does not exist */}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                                                {recipient.department.name.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                    {recipient.department.name}
                                                                                </div>
                                                                                {/* Removed recipient.user?.role display as recipient.user does not exist */}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusColor(recipient.status)} dark:text-gray-100`}>
                                                                    {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                                                                </span>
                                                            </div>

                                                            {/* Show all response files for this recipient, with preview and response type */}
                                                            {recipientResponseFiles.length > 0 && (
                                                                <div className="mt-4 space-y-3">
                                                                    {recipientResponseFiles.map((file: any) => {
                                                                        const isImage = file.original_filename.match(/\.(jpg|jpeg|png|gif)$/i);
                                                                        return (
                                                                            <div key={file.id} className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-600">
                                                                                {isImage ? (
                                                                                    <img
                                                                                        src={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                                                        alt={file.original_filename}
                                                                                        className="w-16 h-16 object-cover rounded-lg border border-blue-300 dark:border-blue-600 shadow-sm"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                                                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex-1">
                                                                                    <div className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-1">
                                                                                        {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)} Response
                                                                                    </div>
                                                                                    <a
                                                                                        href={file.file_path ? `/storage/${file.file_path}` : '#'}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium underline"
                                                                                        download={file.original_filename}
                                                                                    >
                                                                                        {file.original_filename}
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {recipient.comments && (
                                                                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{recipient.comments}</p>
                                                                </div>
                                                            )}

                                                            {recipient.responded_at && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Responded: {new Date(recipient.responded_at).toLocaleDateString('en-US', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Document History Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600 h-full flex flex-col mt-10 lg:mt-0">
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Document History</h2>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b">User</th>
                                                <th className="px-4 py-2 border-b">Action</th>
                                                <th className="px-4 py-2 border-b">Description</th>
                                                <th className="px-4 py-2 border-b">Date/Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activityLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-4">No history found.</td>
                                                </tr>
                                            ) : (
                                                activityLogs.map((log) => (
                                                    <tr key={log.id}>
                                                        <td className="px-4 py-2 border-b">{log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}</td>
                                                        <td className="px-4 py-2 border-b">{formatActivityLogAction(log.action)}</td>
                                                        <td className="px-4 py-2 border-b">{log.description}</td>
                                                        <td className="px-4 py-2 border-b">{new Date(log.created_at).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
            {/* ForwardModal removed */}
            <ForwardModal
                isOpen={isForwardModalOpen}
                onClose={() => setIsForwardModalOpen(false)}
                processing={processing}
                users={users || []}
                documentId={document.id}
            />
            <ForwardOtherOfficeModal
                isOpen={isForwardOtherOfficeModalOpen}
                onClose={() => setIsForwardOtherOfficeModalOpen(false)}
                processing={processing}
                departments={otherDepartments || []}
                documentId={document.id}
            />
            <ReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                documentId={document.id}
            />
        </>
    );
};

export default ViewDocument;
