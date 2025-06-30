import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { Link } from '@inertiajs/react';
import { Eye, Download, Search, FileCheck2, Clock, XCircle, Undo2, FileSearch, Filter, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Document {
    id: number;
    subject: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    status: string;
    created_at: string;
    owner_id: number;
    barcode_value?: string;
    files?: { id: number }[];
}

interface Props {
    documents: Document[];
    auth: {
        user: {
            id: number;
        };
    };
}

const statusIcons: Record<string, React.ReactNode> = {
    approved: <FileCheck2 className="w-4 h-4 mr-1 text-green-600" />,
    pending: <Clock className="w-4 h-4 mr-1 text-yellow-600" />,
    rejected: <XCircle className="w-4 h-4 mr-1 text-red-600" />,
    returned: <Undo2 className="w-4 h-4 mr-1 text-orange-600" />,
};

const Documents = ({ documents, auth }: Props) => {
    const [activeTab, setActiveTab] = useState('received');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');

    const received = documents.filter(doc => doc.owner_id !== auth.user.id);
    const sent = documents.filter(doc => doc.status !== 'draft' && doc.owner_id === auth.user.id);
    const published = documents.filter(doc => doc.owner_id === auth.user.id && (doc as any).is_public);

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

    const filterDocs = (docs: Document[]) => {
        let filtered = docs;

        // Filter by search
        if (search.trim()) {
            filtered = filtered.filter(doc =>
                doc.subject.toLowerCase().includes(search.toLowerCase()) ||
                doc.id.toString().includes(search) ||
                (doc.barcode_value && doc.barcode_value.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        // Filter by document type
        if (documentTypeFilter !== 'all') {
            filtered = filtered.filter(doc => doc.document_type === documentTypeFilter);
        }

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    };

    const renderDocuments = (docs: Document[]) => {
        const filtered = filterDocs(docs);
        return filtered.length === 0 ? (
            <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400 text-lg">No documents found.</td>
            </tr>
        ) : (
            filtered.map((doc) => (
                <tr
                    key={doc.id}
                    className="transition hover:bg-gray-50 group"
                >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {doc.barcode_value ? (
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-xs">{doc.barcode_value}</span>
                            </div>
                        ) : (
                            <span className="text-gray-400">No Barcode</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getDocumentTypeColor(doc.document_type)}`}>
                            {getDocumentTypeDisplayName(doc.document_type)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {statusIcons[doc.status] || statusIcons.default}
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <Link
                            href={`/documents/${doc.id}`}
                            className="inline-flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </Link>
                        {doc.files?.map((file, index) => (
                            <Link
                                key={file.id}
                                href={`/documents/${doc.id}/files/${file.id}`}
                                className="inline-flex items-center gap-1 text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded shadow-sm transition font-semibold focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <Download className="w-4 h-4" />
                                {index === 0 ? 'Download' : `Download ${index + 1}`}
                            </Link>
                        ))}
                    </td>
                </tr>
            ))
        );
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Documents</h1>
                    <Link
                        href="/documents/create"
                        className="inline-flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-800 transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        <FileCheck2 className="w-5 h-5" />
                        New Document
                    </Link>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <nav className="flex rounded-lg shadow overflow-hidden w-fit mx-auto border border-gray-200">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`px-6 py-2 text-sm w-[100px] font-semibold transition focus:outline-none ${activeTab === 'received'
                                ? 'bg-red-600 text-white shadow-inner'
                                : 'bg-white text-gray-700 hover:bg-gray-50'} `}
                        >
                            Received
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`px-6 py-2 text-sm w-[100px] font-semibold transition focus:outline-none border-l border-gray-200 ${activeTab === 'sent'
                                ? 'bg-red-600 text-white shadow-inner'
                                : 'bg-white text-gray-700 hover:bg-gray-50'} `}
                        >
                            Sent
                        </button>
                        <Link
                            href="/users/published-documents"
                            className={`px-6 py-2 text-sm w-[120px] font-semibold transition focus:outline-none border-l border-gray-200 ${window.location.pathname === '/users/published-documents'
                                ? 'bg-red-600 text-white shadow-inner'
                                : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Published
                        </Link>
                    </nav>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6 max-w-6xl mx-auto">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <Input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                            placeholder="Search by Subject, ID, or barcode value..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </span>
                        <select
                            className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="returned">Returned</option>
                            <option value="in_review">In Review</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FileSearch className="w-5 h-5 text-gray-400" />
                        </span>
                        <select
                            className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white"
                            value={documentTypeFilter}
                            onChange={e => setDocumentTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="special_order">Special Order</option>
                            <option value="order">Order</option>
                            <option value="memorandum">Memorandum</option>
                            <option value="for_info">For Info</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M3 12h18M3 16h18" />
                            </svg>
                        </span>
                        <select
                            className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTab === 'received' && renderDocuments(received)}
                            {activeTab === 'sent' && renderDocuments(sent)}
                            {activeTab === 'published' && renderDocuments(published)}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Documents;
