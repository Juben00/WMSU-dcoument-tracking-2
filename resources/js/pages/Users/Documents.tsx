import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { Link } from '@inertiajs/react';

interface Document {
    id: number;
    title: string;
    status: string;
    created_at: string;
    owner_id: number;
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

const Documents = ({ documents, auth }: Props) => {
    const [activeTab, setActiveTab] = useState('drafts');

    const drafts = documents.filter(doc => doc.status === 'draft');
    const received = documents.filter(doc => doc.owner_id !== auth.user.id);
    const sent = documents.filter(doc => doc.status !== 'draft' && doc.owner_id === auth.user.id);

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

    const renderDocuments = (docs: Document[]) => {
        return docs.map((doc) => (
            <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{doc.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/documents/${doc.id}`} className="text-red-700 hover:text-red-900 mr-3">
                        View
                    </Link>
                    {doc.files?.map((file, index) => (
                        <Link
                            key={file.id}
                            href={`/documents/${doc.id}/files/${file.id}`}
                            className="text-red-700 hover:text-red-900"
                        >
                            {index === 0 ? 'Download' : `Download ${index + 1}`}
                        </Link>
                    ))}
                </td>
            </tr>
        ));
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
                    <Link href="/documents/create" className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors duration-200">
                        New Document
                    </Link>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('drafts')}
                            className={`${activeTab === 'drafts'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Drafts
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`${activeTab === 'received'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Received
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`${activeTab === 'sent'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Sent
                        </button>
                    </nav>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTab === 'drafts' && renderDocuments(drafts)}
                            {activeTab === 'received' && renderDocuments(received)}
                            {activeTab === 'sent' && renderDocuments(sent)}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Documents;
