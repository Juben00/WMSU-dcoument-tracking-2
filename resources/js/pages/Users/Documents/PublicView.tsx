import React, { useState } from 'react';
import { Download, FileText, FileCheck, Users, BarChart3, Copy, Calendar, User, Hash, ScanEye, ExternalLink } from 'lucide-react';

interface DocumentFile {
    id: number;
    original_filename: string;
    file_size: number;
    upload_type: string;
    uploaded_by: number;
    file_path?: string;
    document_recipient_id?: number;
}

interface DocumentRecipient {
    id: number;
    department: {
        id: number;
        name: string;
    };
    status: string;
    comments?: string;
    responded_at?: string;
    sequence: number;
}

interface Document {
    id: number;
    subject: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    order_number: string;
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
    department?: {
        id: number;
        name: string;
    };
    files: DocumentFile[];
    recipients: DocumentRecipient[];
    barcode_path?: string;
    public_token?: string;
    barcode_value?: string;
    department_id: number;
}

interface Props {
    document: Document;
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        case 'received':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700';
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

const PublicView: React.FC<Props> = ({ document }) => {
    const [copied, setCopied] = useState(false);
    const originalFiles = document.files.filter(file => file.upload_type === 'original');
    const responseFiles = document.files.filter(file => file.upload_type === 'response');

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
        return `/documents/public/${token}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Section */}
                <div className="mb-8 flex items-center gap-3">
                    <FileText className="w-7 h-7 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Public Document Details</h1>
                </div>

                {/* Document Information Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Document Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FileCheck className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Document Information</h2>
                            </div>
                            <dl className="space-y-5">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type</dt>
                                    <dd className="mt-1">
                                        <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full border ${getDocumentTypeColor(document.document_type)}`}>
                                            {getDocumentTypeDisplayName(document.document_type)}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Number</dt>
                                    <dd className="mt-1 text-base text-gray-900 dark:text-gray-100 font-semibold">{document.order_number}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</dt>
                                    <dd className="mt-1 text-base text-gray-900 dark:text-gray-100 font-semibold">{document.subject}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(document.status)}`}>
                                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                                    <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{document.owner.first_name} {document.owner.last_name}</dd>
                                </div>
                                {document.owner.department && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                                        <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{document.owner.department.name}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Created</dt>
                                    <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{new Date(document.created_at).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</dd>
                                </div>
                                {document.description && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                                        <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{document.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        {/* Barcode & Link Section */}
                        {(document.barcode_path || document.public_token) && (
                            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-dashed border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <ScanEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Access Document</h2>
                                </div>
                                {document.barcode_path && (
                                    <img src={`/storage/${document.barcode_path}`} alt="Barcode" className="w-48 mb-3 rounded border mx-auto border-gray-200 dark:border-gray-700 bg-white" />
                                )}
                                <div className="w-full max-w-sm mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center border border-gray-200 dark:border-gray-700 mb-2">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Barcode</span>
                                    <div className="flex items-center w-full justify-center gap-2 mb-2">
                                        <span className="text-base font-mono text-gray-800 dark:text-gray-200 truncate max-w-[200px]" title={document.barcode_value || document.public_token}>
                                            {document.barcode_value || document.public_token}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(document.barcode_value || document.public_token || '')}
                                            className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                                            title="Copy"
                                            type="button"
                                        >
                                            <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                        {document.barcode_path && (
                                            <a
                                                href={`/storage/${document.barcode_path}`}
                                                download={`barcode-${document.order_number || document.id}.png`}
                                                className="p-2 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {document.public_token && (
                                    <div className="w-full max-w-sm mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4 flex flex-col items-center border border-blue-200 dark:border-blue-700 mt-2">
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
                    </div>
                </div>

                {/* Files Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Files</h2>
                        </div>
                        <div className="space-y-8">
                            {/* Original Files Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Original Files
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {originalFiles.length === 0 && (
                                        <div className="col-span-full text-center text-gray-400 dark:text-gray-500">No original files uploaded.</div>
                                    )}
                                    {originalFiles.map((file) => (
                                        <div key={file.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center border border-gray-200 dark:border-gray-600">
                                            <div className="w-full h-40 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg mb-3 overflow-hidden border border-gray-100 dark:border-gray-600">
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
                                                    <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-500">
                                                        <FileText className="h-12 w-12 mb-2" />
                                                        <span className="text-xs">No Preview</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full text-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={file.original_filename}>{file.original_filename}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatFileSize(file.file_size)}</p>
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
                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Response Files
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {responseFiles.map((file) => (
                                            <div key={file.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center border border-blue-200 dark:border-blue-700">
                                                <div className="w-full h-40 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg mb-3 overflow-hidden border border-blue-100 dark:border-blue-600">
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
                                                        <div className="flex flex-col items-center justify-center text-blue-300 dark:text-blue-400">
                                                            <FileText className="h-12 w-12 mb-2" />
                                                            <span className="text-xs">No Preview</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-full text-center">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={file.original_filename}>{file.original_filename}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatFileSize(file.file_size)}</p>
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

                {/* Approval Chain Timeline */}
                {document.recipients.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Approval Chain</h2>
                            </div>
                            <div className="relative ml-4">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-600 rounded-full" style={{ zIndex: 0 }}></div>
                                <div className="space-y-8">
                                    {document.recipients.map((recipient, idx) => (
                                        <div key={recipient.id} className="relative flex items-start gap-4">
                                            <div className="z-10">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusColor(recipient.status)} bg-white dark:bg-gray-800`}></div>
                                            </div>
                                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                                        {recipient.department.name}
                                                    </p>
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(recipient.status)}`}>
                                                        {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                                                    </span>
                                                </div>
                                                {recipient.comments && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{recipient.comments}</p>
                                                )}
                                                {recipient.responded_at && (
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicView;
