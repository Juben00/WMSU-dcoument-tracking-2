import React from 'react';
import { Download, FileText, FileCheck, Users, BarChart3 } from 'lucide-react';

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
}

interface Document {
    id: number;
    subject: string;
    description?: string;
    status: string;
    created_at: string;
    owner: {
        first_name: string;
        last_name: string;
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

const PublicView: React.FC<Props> = ({ document }) => {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex items-center gap-3">
                <FileText className="w-7 h-7 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-800">Public Document Details</h1>
            </div>

            {/* Document Information Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FileCheck className="w-5 h-5 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">Document Information</h2>
                        </div>
                        <dl className="space-y-5">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Subject</dt>
                                <dd className="mt-1 text-base text-gray-900 font-semibold">{document.subject}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                    </span>
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
                    {document.barcode_path && (
                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Scan to View</h2>
                            </div>
                            <img src={`/storage/${document.barcode_path}`} alt="Barcode" className="w-64 h-32 mb-3" />
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">Barcode Value:</p>
                                <p className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded border">
                                    {document.barcode_value || document.public_token}
                                </p>
                            </div>
                            <span className="text-xs text-gray-500 mt-2">Scan this barcode to access the document online.</span>
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

            {/* Approval Chain Timeline */}
            {document.recipients.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">Approval Chain</h2>
                        </div>
                        <div className="relative ml-4">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full" style={{ zIndex: 0 }}></div>
                            <div className="space-y-8">
                                {document.recipients.map((recipient, idx) => (
                                    <div key={recipient.id} className="relative flex items-start gap-4">
                                        <div className="z-10">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusColor(recipient.status)} bg-white`}></div>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <p className="text-base font-medium text-gray-900">
                                                    {recipient.user.first_name} {recipient.user.last_name} | {recipient.user.department?.name || 'No Department'} | {recipient.user.role.charAt(0).toUpperCase() + recipient.user.role.slice(1)}
                                                </p>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(recipient.status)}`}>
                                                    {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                                                </span>
                                            </div>
                                            {recipient.comments && (
                                                <p className="text-sm text-gray-500 mt-2">{recipient.comments}</p>
                                            )}
                                            {recipient.responded_at && (
                                                <div className="text-xs text-gray-400 mt-2">
                                                    Responded: {new Date(recipient.responded_at).toLocaleDateString()}
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
    );
};

export default PublicView;
