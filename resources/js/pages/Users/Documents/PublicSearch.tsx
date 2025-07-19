import React, { useState } from 'react';
import { Search, FileText, Eye, Calendar, User, Building, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Document {
    id: number;
    order_number: string;
    subject: string;
    description?: string;
    status: string;
    document_type: 'special_order' | 'order' | 'memorandum' | 'for_info';
    is_public: boolean;
    public_token: string;
    barcode_path?: string;
    barcode_value?: string;
    created_at: string;
    owner: {
        id: number;
        name: string;
        email: string;
        department: string;
    };
    files_count: number;
    public_url: string;
}

interface Props {
    documents?: Document[];
    search?: string;
    searchToken?: string;
}

const PublicSearch: React.FC<Props> = ({ documents = [], search = '', searchToken = '' }) => {
    const [searchTerm, setSearchTerm] = useState(search);

    const filteredDocuments = documents.filter(doc =>
        doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.barcode_value && doc.barcode_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'returned':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'received':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex items-center gap-3">
                <FileText className="w-7 h-7 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Public Documents</h1>
            </div>

            {/* Search Section */}
            <Card className="mb-8 border-2 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Documents</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {searchToken ? `Document with token "${searchToken}" not found. Search for other public documents:` : 'Find specific published documents by subject, description, barcode value, or owner name'}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Search by subject, description, barcode value, order number, or owner name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-red-300 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((document) => (
                        <Card key={document.id} className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                            {document.subject}
                                        </CardTitle>
                                        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Order: {document.order_number} | {getDocumentTypeDisplayName(document.document_type)}
                                        </CardDescription>
                                    </div>
                                    <Badge className={`ml-2 ${getStatusColor(document.status)}`}>
                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {document.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                            {document.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span>{document.owner.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Building className="w-4 h-4" />
                                        <span>{document.owner.department}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <FileText className="w-4 h-4" />
                                        <span>{document.files_count} file{document.files_count !== 1 ? 's' : ''}</span>
                                    </div>

                                    {document.barcode_value && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                {document.barcode_value}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Button
                                            asChild
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <a href={document.public_url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Document
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {searchTerm ? 'No documents found' : 'No public documents available'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm
                                ? `No documents match your search for "${searchTerm}". Try a different search term.`
                                : 'There are currently no public documents available for viewing.'
                            }
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PublicSearch;
