import React, { useState, useEffect } from 'react';
import Navbar from '@/components/User/navbar';
import { Link } from '@inertiajs/react';
import { Eye, Download, Search, FileCheck2, Clock, XCircle, Undo2, FileSearch, Filter, BarChart3, FileText, Plus, Users, Calendar, Archive, Hash, Send, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Document {
    id: number;
    subject: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    status: string;
    created_at: string;
    owner_id: number;
    barcode_value?: string;
    order_number?: string;
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
    const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
    const [archivedFilter, setArchivedFilter] = useState('all');
    const [notifications, setNotifications] = useState<any[]>([]);

    // Get current fiscal year (January to December)
    const getCurrentFiscalYear = () => {
        const now = new Date();
        return now.getFullYear();
    };

    // Get fiscal year from date
    const getFiscalYear = (date: string) => {
        return new Date(date).getFullYear();
    };

    // Get available fiscal years from documents
    const getAvailableFiscalYears = () => {
        const years = new Set<number>();
        documents.forEach(doc => {
            years.add(getFiscalYear(doc.created_at));
        });
        return Array.from(years).sort((a, b) => b - a); // Sort descending
    };

    // Filter documents by fiscal year
    const isInCurrentFiscalYear = (date: string) => {
        const docYear = getFiscalYear(date);
        const currentYear = getCurrentFiscalYear();
        return docYear === currentYear;
    };

    // Helper function to determine if a document was originally sent by the current user
    const isDocumentSentByUser = (doc: Document) => {
        return doc.owner_id === auth.user.id && doc.status !== 'draft' && doc.status !== 'returned';
    };

    // Helper function to determine if a document was originally received by the current user
    const isDocumentReceivedByUser = (doc: Document) => {
        return doc.owner_id !== auth.user.id || (doc.owner_id === auth.user.id && doc.status === 'returned');
    };

    // Filter documents by current fiscal year and exclude archived ones from active tabs
    const received = documents.filter(doc =>
        isInCurrentFiscalYear(doc.created_at) &&
        isDocumentReceivedByUser(doc)
    );

    const sent = documents.filter(doc =>
        isInCurrentFiscalYear(doc.created_at) &&
        isDocumentSentByUser(doc)
    );

    const published = documents.filter(doc => doc.owner_id === auth.user.id && (doc as any).is_public);

    // Archived documents are those not in the current fiscal year
    const archived = documents.filter(doc => !isInCurrentFiscalYear(doc.created_at));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            case 'returned':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
        }
    };

    const getDocumentTypeColor = (documentType: string) => {
        switch (documentType) {
            case 'special_order':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
            case 'order':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            case 'memorandum':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'for_info':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
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
                (doc.barcode_value && doc.barcode_value.toLowerCase().includes(search.toLowerCase())) ||
                (doc.order_number && doc.order_number.toLowerCase().includes(search.toLowerCase()))
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

        // Filter by fiscal year (only for archived tab)
        if (activeTab === 'archived' && fiscalYearFilter !== 'all') {
            filtered = filtered.filter(doc => getFiscalYear(doc.created_at).toString() === fiscalYearFilter);
        }

        // Filter by archived type (only for archived tab)
        if (activeTab === 'archived' && archivedFilter !== 'all') {
            if (archivedFilter === 'sent') {
                filtered = filtered.filter(doc => isDocumentSentByUser(doc));
            } else if (archivedFilter === 'received') {
                filtered = filtered.filter(doc => isDocumentReceivedByUser(doc));
            }
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
            <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
        ) : (
            filtered.map((doc) => (
                <div
                    key={doc.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden group flex flex-col h-full"
                >
                    <div className="p-6 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileText className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        {doc.subject}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {doc.order_number && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <div className="flex items-center gap-1">
                                                    <Hash className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{doc.order_number}</span>
                                                </div>
                                            </>
                                        )}
                                        {doc.barcode_value && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <div className="flex items-center gap-1">
                                                    <BarChart3 className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{doc.barcode_value}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-4 flex-1">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{new Date(doc.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                {activeTab === 'archived' && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-semibold">
                                            FY {getFiscalYear(doc.created_at)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 ${isDocumentSentByUser(doc)
                                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            }`}>
                                            {isDocumentSentByUser(doc) ? (
                                                <>
                                                    <Send className="w-3 h-3" />
                                                    Sent
                                                </>
                                            ) : (
                                                <>
                                                    <Inbox className="w-3 h-3" />
                                                    Received
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}
                                {doc.files && doc.files.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 text-gray-400" />
                                        <span>{doc.files.length} file{doc.files.length !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end gap-2">
                                <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getDocumentTypeColor(doc.document_type)}`}>
                                    {getDocumentTypeDisplayName(doc.document_type)}
                                </span>
                                <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusColor(doc.status)}`}>
                                    {statusIcons[doc.status] || statusIcons.default}
                                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Button always at the bottom */}
                    <div className="p-6 pt-0 mt-auto">
                        <Link
                            href={`/documents/${doc.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Details
                        </Link>
                    </div>
                </div>
            ))
        );
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
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and track your documents</p>
                                </div>
                            </div>
                            <Link
                                href="/documents/create"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Document
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <nav className="flex rounded-xl shadow-lg overflow-hidden w-fit mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <button
                                onClick={() => setActiveTab('received')}
                                className={`px-8 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none ${activeTab === 'received'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-inner'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'} `}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Received
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`px-8 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none border-l border-gray-200 dark:border-gray-600 ${activeTab === 'sent'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-inner'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'} `}
                            >
                                <div className="flex items-center gap-2">
                                    <FileCheck2 className="w-4 h-4" />
                                    Sent
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('archived')}
                                className={`px-8 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none border-l border-gray-200 dark:border-gray-600 ${activeTab === 'archived'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-inner'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'} `}
                            >
                                <div className="flex items-center gap-2">
                                    <Archive className="w-4 h-4" />
                                    Archived
                                </div>
                            </button>
                            <Link
                                href="/published-documents"
                                className={`px-8 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none border-l border-gray-200 dark:border-gray-600 ${window.location.pathname === '/published-documents'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-inner'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Published
                                </div>
                            </Link>
                        </nav>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search & Filter</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                {/* Search Input */}
                                <div className="lg:col-span-2">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Search className="w-5 h-5 text-gray-400" />
                                        </span>
                                        <Input
                                            type="text"
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Search by Subject, ID, Order Number, or barcode value..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Filter className="w-5 h-5 text-gray-400" />
                                    </span>
                                    <select
                                        className="block w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Document Type Filter */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FileSearch className="w-5 h-5 text-gray-400" />
                                    </span>
                                    <select
                                        className="block w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={documentTypeFilter}
                                        onChange={e => setDocumentTypeFilter(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="special_order">Special Order</option>
                                        <option value="order">Order</option>
                                        <option value="memorandum">Memorandum</option>
                                        <option value="for_info">For Info</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Fiscal Year Filter - Only show for archived tab */}
                                {activeTab === 'archived' && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </span>
                                        <select
                                            className="block w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={fiscalYearFilter}
                                            onChange={e => setFiscalYearFilter(e.target.value)}
                                        >
                                            <option value="all">All Years</option>
                                            {getAvailableFiscalYears().map(year => (
                                                <option key={year} value={year.toString()}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                {/* Archived Type Filter - Only show for archived tab */}
                                {activeTab === 'archived' && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Archive className="w-5 h-5 text-gray-400" />
                                        </span>
                                        <select
                                            className="block w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={archivedFilter}
                                            onChange={e => setArchivedFilter(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="sent">Sent</option>
                                            <option value="received">Received</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sort Options */}
                            <div className="mt-4 flex items-center gap-4">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Sort by:</span>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M3 12h18M3 16h18" />
                                        </svg>
                                    </span>
                                    <select
                                        className="block w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-sm appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {activeTab === 'received' ? 'Received Documents' :
                                        activeTab === 'sent' ? 'Sent Documents' :
                                            activeTab === 'archived' ? 'Archived Documents' : 'Published Documents'}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeTab === 'received' && renderDocuments(received)}
                                {activeTab === 'sent' && renderDocuments(sent)}
                                {activeTab === 'archived' && renderDocuments(archived)}
                                {activeTab === 'published' && renderDocuments(published)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Documents;
