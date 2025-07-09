import Navbar from '@/components/User/navbar'
import React, { useState, useEffect } from 'react'
import { router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FileText,
    Eye,
    ExternalLink,
    Trash2,
    Search,
    Calendar,
    Download,
    BarChart3,
    User,
    ArrowLeft,
    FileCheck,
    Users,
    Hash,
    Building
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface PublishedDocument {
    id: number;
    subject: string;
    description?: string;
    status: string;
    is_public: boolean;
    public_token: string;
    barcode_path?: string;
    barcode_value?: string;
    created_at: string;
    files_count: number;
    public_url: string;
    user_role: 'owner' | 'recipient';
    owner_name: string;
}

interface Props {
    publishedDocuments: PublishedDocument[];
    auth: {
        user: any;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
        case 'forwarded':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
        case 'returned':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
        case 'received':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
};

const PublishedDocuments = ({ publishedDocuments, auth }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocument, setSelectedDocument] = useState<PublishedDocument | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const filteredDocuments = publishedDocuments.filter(doc =>
        doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.barcode_value && doc.barcode_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnpublishDocument = (document: PublishedDocument) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to unpublish "${document.subject}"? This will remove it from public access.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Yes, unpublish it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/users/published-documents/${document.id}`, {
                    onSuccess: () => {
                        toast.success('Document unpublished successfully');
                    },
                    onError: (errors) => {
                        toast.error('Failed to unpublish document. Please try again.');
                    }
                });
            }
        });
    };

    const handleViewDocument = (document: PublishedDocument) => {
        setSelectedDocument(document);
        setIsViewDialogOpen(true);
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
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Published Documents</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">View all published documents you're involved with</p>
                                </div>
                            </div>
                            <Link
                                href="/documents"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Documents
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Published Documents Overview</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 text-center">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{publishedDocuments.length}</div>
                                    <div className="text-sm font-semibold text-red-700 dark:text-red-400">Total Documents</div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 text-center">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                                        {publishedDocuments.filter(doc => doc.user_role === 'owner').length}
                                    </div>
                                    <div className="text-sm font-semibold text-red-700 dark:text-red-400">Owned by You</div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 text-center">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                                        {publishedDocuments.filter(doc => doc.user_role === 'recipient').length}
                                    </div>
                                    <div className="text-sm font-semibold text-red-700 dark:text-red-400">Received by You</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Documents</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">Find specific published documents by subject, description, barcode value, or owner name</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Search by subject, description, barcode value, or owner name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-red-300 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documents Table Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Published Documents</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">All published documents you're involved with (as owner or recipient)</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Document</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Owner</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Published Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Barcode</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Files</TableHead>
                                            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-200">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDocuments.map((document) => (
                                            <TableRow key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="font-semibold text-gray-900 dark:text-white text-lg">{document.subject}</div>
                                                        {document.description && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-xs">
                                                                {document.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                            {document.owner_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{document.owner_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusColor(document.status)} font-semibold`}>
                                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900 dark:text-white">{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4 text-gray-400" />
                                                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                            {document.barcode_value || document.public_token}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900 dark:text-white">{document.files_count} file{document.files_count !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleViewDocument(document)}
                                                            title="View Document Details"
                                                            className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="View Public Page"
                                                            className="h-9 w-9 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                                                        >
                                                            <a href={document.public_url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        {document.user_role === 'owner' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleUnpublishDocument(document)}
                                                                title="Unpublish Document"
                                                                className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredDocuments.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'You\'re not involved with any published documents yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Document Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Document Details</DialogTitle>
                        </DialogHeader>
                        {selectedDocument && (
                            <div className="space-y-8">
                                {/* Document Information */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <FileCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Document Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                Subject
                                            </Label>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDocument.subject}</p>
                                        </div>

                                        {selectedDocument.description && (
                                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                                <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Description</Label>
                                                <p className="text-gray-900 dark:text-white">{selectedDocument.description}</p>
                                            </div>
                                        )}

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Owner
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {selectedDocument.owner_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{selectedDocument.owner_name}</span>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Your Role</Label>
                                            <Badge className={selectedDocument.user_role === 'owner' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'}>
                                                {selectedDocument.user_role === 'owner' ? 'Owner' : 'Recipient'}
                                            </Badge>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Status</Label>
                                            <Badge className={getStatusColor(selectedDocument.status)}>
                                                {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Files
                                            </Label>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedDocument.files_count} file{selectedDocument.files_count !== 1 ? 's' : ''}</p>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Published Date
                                            </Label>
                                            <p className="font-semibold text-gray-900 dark:text-white">{format(new Date(selectedDocument.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 md:col-span-2">
                                            <Label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                Public URL
                                            </Label>
                                            <a
                                                href={selectedDocument.public_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium underline break-all"
                                            >
                                                View Public Page
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Barcode Section */}
                                {selectedDocument.barcode_path && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                                                <BarChart3 className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Barcode</h3>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                            <div className="flex flex-col items-center gap-4">
                                                <img
                                                    src={`/storage/${selectedDocument.barcode_path}`}
                                                    alt="Barcode"
                                                    className="w-64 h-32 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-sm"
                                                />
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Barcode Value:</p>
                                                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        {selectedDocument.barcode_value || selectedDocument.public_token}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default PublishedDocuments;
