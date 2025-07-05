import React, { useState, useEffect } from 'react';
import Navbar from '@/components/User/navbar';
import { Link, useForm } from '@inertiajs/react';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import ForwardModal from './components/ForwardModal';
import { Download, FileText, FileCheck, Users, BarChart3, Copy, ExternalLink, Calendar, User, Building, Hash } from 'lucide-react';
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
    user: {
        id: number;
        first_name: string;
        last_name: string;
        department_id: number;
        role: string;
        department?: {
            id: number;
            name: string;
        };
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
    is_final_approver?: boolean;
    response_file?: DocumentFile;
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
    is_final_approver: boolean;
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
        first_name: string;
        last_name: string;
        department_id: number;
        department?: {
            id: number;
            name: string;
        };
    } | null;
    approval_chain: DocumentRecipient[];
    order_number: string;
    through_user_ids?: (string | number)[];
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
    otherDepartmentUsers?: Array<{
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
    throughUsers?: Array<{
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

const ViewDocument = ({ document, auth, departments, users, otherDepartmentUsers, throughUsers }: Props) => {
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
    const [notifications, setNotifications] = useState<any[]>([]);

    const { post, delete: destroy, processing, setData } = useForm({
        status: '',
        comments: '',
        revision_file: null as File | null,
        forward_to_id: null as number | null,
    });

    console.log('users', users);

    // Check if current user is an active recipient
    const currentRecipient = document.recipients.find(
        (r: DocumentRecipient) => r.user.id === auth.user.id
    );

    // Helper functions to determine user permissions and document states
    const isOwner = () => document.owner_id === auth.user.id;
    const isFinalRecipient = () => document.final_recipient?.id === auth.user.id;
    const isAdmin = () => auth.user.role === 'admin';
    const isForInfoDocument = () => document.document_type === 'for_info';
    const isNonForInfoDocument = () => document.document_type !== 'for_info';
    const canRespond = () => document.can_respond;
    const cannotRespond = () => !document.can_respond;
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
        return canRespond() && isNonForInfoDocument() && isNotFinalRecipient() && !isReturned();
    };

    const canApproveOrReject = () => {
        return canRespond() && isNonForInfoDocument() && isFinalRecipient() && !isReturned();
    };

    const canForwardToOffice = () => {
        return cannotRespond() && isNotFinalRecipient() && isNotOwner() && !isReturned() && !isPending() && notApprovedAndRejected();
    };

    const canForwardToOtherOffice = () => {
        return cannotRespond() && isNotFinalRecipient() && isAdmin() && isNotOwner() && !isReturned() && !isPending() && notApprovedAndRejected();
    };

    const canReturnDocument = () => {
        return cannotRespond() && isAdmin() && isNotOwner() && isNonForInfoDocument() && !isReturned() && !isPending() && notApprovedAndRejected();
    };

    const canPublishPublicly = () => {
        return ['approved', 'received'].includes(document.status) && !document.is_public && isOwner();
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
    const throughRecipients = document.document_type !== 'for_info'
        ? approvalChain.filter((recipient: DocumentRecipient) =>
            !document.final_recipient || recipient.user.id !== document.final_recipient.id
        )
        : [];

    console.log('responseFiles', responseFiles);

    // Debug: Check if through users are found correctly
    if (document.through_user_ids && document.through_user_ids.length > 0) {
        console.log('Debugging through users:');
        document.through_user_ids.forEach((userId, index) => {
            const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            const throughUser = approvalChain.find((recipient: DocumentRecipient) =>
                recipient.user.id === userIdNum
            );
            console.log(`User ID ${userId} (${userIdNum}):`, throughUser ? `${throughUser.user.first_name} ${throughUser.user.last_name}` : 'Not found');
        });
    }

    // Find the next through user to forward to
    const getNextThroughUser = () => {
        if (!document.through_user_ids || document.through_user_ids.length === 0) {
            return null;
        }

        // Find the current user's position in the through users list
        // Convert through_user_ids to numbers for comparison
        const throughUserIdsAsNumbers = document.through_user_ids.map(id =>
            typeof id === 'string' ? parseInt(id, 10) : id
        );
        const currentUserIndex = throughUserIdsAsNumbers.indexOf(auth.user.id);

        // If current user is not in the through users list, return null
        if (currentUserIndex === -1) {
            return null;
        }

        // Get the next user in the sequence
        const nextUserIndex = currentUserIndex + 1;

        // If there's a next user in the through users list
        if (nextUserIndex < throughUserIdsAsNumbers.length) {
            const nextUserId = throughUserIdsAsNumbers[nextUserIndex];
            // Find the user details from the approval chain
            return approvalChain.find((recipient: DocumentRecipient) =>
                recipient.user.id === nextUserId
            );
        }

        // If we're at the last through user, return the final recipient
        if (document.final_recipient) {
            return {
                user: document.final_recipient,
                id: document.final_recipient.id
            };
        }

        return null;
    };

    const nextThroughUser = getNextThroughUser();

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

    useEffect(() => {
        fetch('/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(() => setNotifications([]));
    }, []);

    return (
        <>
            <Navbar notifications={notifications} />
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
                        <div className={`p-8 ${document.is_public || document.barcode_path ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}`}>
                            <div>
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
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-700">
                                                <dt className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Sent To
                                                </dt>
                                                <dd className="mt-1">
                                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                            {document.final_recipient?.first_name.charAt(0)}{document.final_recipient?.last_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                {document.final_recipient?.first_name} {document.final_recipient?.last_name}
                                                            </span>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {document.final_recipient?.department?.name || 'No Department'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </dd>
                                            </div>

                                            {/* Show all through users from the document's through_user_ids */}
                                            {document.through_user_ids && document.through_user_ids.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-700">
                                                    <dt className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Sent Through
                                                    </dt>
                                                    <dd className="mt-1">
                                                        <div className="space-y-3">
                                                            {document.through_user_ids.map((userId: string | number, index: number) => {
                                                                // Convert userId to number for comparison
                                                                const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;

                                                                // Find the user details from the throughUsers prop
                                                                let throughUser = throughUsers?.find(user => user.id === userIdNum);

                                                                // Fallback: find in approval chain if not found in throughUsers
                                                                if (!throughUser) {
                                                                    const approvalChainUser = approvalChain.find((recipient: DocumentRecipient) =>
                                                                        recipient.user.id === userIdNum
                                                                    );
                                                                    if (approvalChainUser) {
                                                                        throughUser = approvalChainUser.user;
                                                                    }
                                                                }

                                                                // Fallback: find in users prop if not found in throughUsers or approvalChain
                                                                if (!throughUser && users) {
                                                                    throughUser = users.find(u => u.id === userIdNum);
                                                                }

                                                                if (throughUser) {
                                                                    return (
                                                                        <div key={userId} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600">
                                                                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                                {throughUser.first_name.charAt(0)}{throughUser.last_name.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                                    {throughUser.first_name} {throughUser.last_name}
                                                                                </span>
                                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {throughUser.department?.name || 'No Department'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <div key={userId} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-sm">
                                                                            ?
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-400 dark:text-gray-500 font-semibold">
                                                                                User ID: {userIdNum} (Not Found)
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </dd>
                                                </div>
                                            )}

                                            {/* Fallback: Show through users directly from throughUsers prop if through_user_ids is empty */}
                                            {(!document.through_user_ids || document.through_user_ids.length === 0) && throughUsers && throughUsers.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-700">
                                                    <dt className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Sent Through
                                                    </dt>
                                                    <dd className="mt-1">
                                                        <div className="space-y-3">
                                                            {throughUsers.map((user, index) => (
                                                                <div key={user.id} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600">
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                            {user.first_name} {user.last_name}
                                                                        </span>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {user.department?.name || 'No Department'}
                                                                        </div>
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
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2 flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            Order Number
                                        </dt>
                                        <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200 font-bold">{document.order_number}</dd>
                                    </div>

                                    {/* Subject */}
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2">Subject</dt>
                                        <dd className="mt-1 text-lg text-gray-900 dark:text-gray-200 font-semibold leading-relaxed">{document.subject}</dd>
                                    </div>

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

                                    {/* Description */}
                                    {document.description && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                            <dt className="text-sm font-semibold text-gray-600 dark:text-gray-100 mb-2">Description</dt>
                                            <dd className="mt-1 text-gray-900 dark:text-gray-200 leading-relaxed">{document.description}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Barcode Section */}
                            {(document.barcode_path || document.is_public) && (
                                <div className="flex flex-col max-h-[650px] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 border-2 border-dashed border-gray-300">
                                    {document.barcode_path && (
                                        <>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                                                    <BarChart3 className="w-5 h-5 text-white" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Scan to View</h2>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 mb-4">
                                                <img src={`/storage/${document.barcode_path}`} alt="Barcode" className="w-64 h-32" />
                                            </div>
                                            <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Barcode Value:</p>
                                                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border">
                                                    {document.barcode_value || document.public_token}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-200 mt-3 text-center font-semibold">Scan this barcode to access the document</span>
                                        </>
                                    )}
                                    {document.is_public && (
                                        <>
                                            <div className="w-full mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-lg">
                                                        <ExternalLink className="w-4 h-4 text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Direct Link</h3>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-sm dark:shadow-gray-700">
                                                    <input
                                                        type="text"
                                                        value={getPublicDocumentUrl()}
                                                        readOnly
                                                        className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-200 dark:bg-gray-700 bg-transparent border-none outline-none"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(getPublicDocumentUrl())}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-sm"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        {copied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                    <a
                                                        href={getPublicDocumentUrl()}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-sm"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open
                                                    </a>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                                                    Share this link for easy access to the document
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
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

                    {/* Actions Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-600">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Document Actions</h2>
                            </div>
                            <div className="flex flex-wrap gap-4 mb-6">
                                {/* Mark as Received Button */}
                                {canMarkAsReceived() && (
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
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Receive Document
                                    </button>
                                )}

                                {/* Approve/Reject Buttons for Final Recipient */}
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
                                                    confirmButtonText: 'Yes, approve it!',
                                                    cancelButtonText: 'Cancel'
                                                });
                                                if (result.isConfirmed) {
                                                    setIsApproveModalOpen(true);
                                                }
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            Disapprove
                                        </button>
                                        {/* return document button */}
                                        <button
                                            onClick={() => setIsReturnModalOpen(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            Return Document
                                        </button>
                                    </>
                                )}

                                {/* Forward to Office Button */}
                                {canForwardToOffice() && (
                                    <button
                                        onClick={() => setIsForwardModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Forward to Office
                                    </button>
                                )}

                                {/* Forward to Other Office Button */}
                                {canForwardToOtherOffice() && (
                                    <>
                                        <button
                                            onClick={() => setIsForwardOtherOfficeModalOpen(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            Forward to other office
                                        </button>
                                    </>
                                )}

                                {/* Return Document Button */}
                                {canReturnDocument() && (
                                    <button
                                        onClick={() => setIsReturnModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Return Document
                                    </button>
                                )}

                                {/* Edit Button for Owner when status is returned */}
                                {isOwner() && document.status === 'returned' && (
                                    <Link
                                        href={route('users.documents.edit', { document: document.id })}
                                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Edit & Resend
                                    </Link>
                                )}
                            </div>

                            {/* Publish Publicly Button for Owner */}
                            {canPublishPublicly() && (
                                <div className="mt-6">
                                    <button
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                            {canCancelDocument() && (
                                <div className="mt-6">
                                    <button
                                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-600">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approval Chain</h2>
                                </div>
                                <div className="relative ml-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full" style={{ zIndex: 0 }}></div>
                                    <div className="space-y-8">
                                        {approvalChain.map((recipient: DocumentRecipient, idx: number) => {
                                            // Find all response files uploaded by this recipient
                                            const recipientResponseFiles = responseFiles.filter(
                                                (file: any) => file.document_recipient_id === recipient.id
                                            );

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
                                                                                {recipient.user.first_name.charAt(0)}{recipient.user.last_name.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                    {recipient.user.first_name} {recipient.user.last_name}
                                                                                </div>
                                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {recipient.user.department?.name || 'No Department'} • {recipient.user.role
                                                                                        ? recipient.user.role.charAt(0).toUpperCase() + recipient.user.role.slice(1)
                                                                                        : 'Unknown'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                                            {recipient.user.first_name.charAt(0)}{recipient.user.last_name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                {recipient.user.first_name} {recipient.user.last_name}
                                                                            </div>
                                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {recipient.user.department?.name || 'No Department'} • {recipient.user.role
                                                                                    ? recipient.user.role.charAt(0).toUpperCase() + recipient.user.role.slice(1)
                                                                                    : 'Unknown'}
                                                                            </div>
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
                users={otherDepartmentUsers || []}
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
