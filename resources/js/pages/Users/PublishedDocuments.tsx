import Navbar from '@/components/User/navbar'
import React, { useState } from 'react'
import { router } from '@inertiajs/react';
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
    ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface PublishedDocument {
    id: number;
    title: string;
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
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'forwarded':
            return 'bg-blue-100 text-blue-800';
        case 'returned':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function PublishedDocuments({ publishedDocuments, auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocument, setSelectedDocument] = useState<PublishedDocument | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const filteredDocuments = publishedDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.barcode_value && doc.barcode_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnpublishDocument = (document: PublishedDocument) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to unpublish "${document.title}"? This will remove it from public access.`,
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Published Documents</h1>
                        <p className="text-muted-foreground mt-2">
                            View all published documents you're involved with
                        </p>
                    </div>
                    {/* back button */}
                    <Button variant="outline" onClick={() => router.visit('/documents')}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Statistics Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Published Documents Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{publishedDocuments.length}</div>
                                <div className="text-sm text-muted-foreground">Total Documents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {publishedDocuments.filter(doc => doc.user_role === 'owner').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Owned by You</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {publishedDocuments.filter(doc => doc.user_role === 'recipient').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Received by You</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Search Documents</CardTitle>
                        <CardDescription>
                            Find specific published documents by title, description, barcode value, or owner name
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by title, description, barcode value, or owner name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Published Documents</CardTitle>
                        <CardDescription>
                            All published documents you're involved with (as owner or recipient)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Published Date</TableHead>
                                        <TableHead>Barcode</TableHead>
                                        <TableHead>Files</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{document.title}</div>
                                                    {document.description && (
                                                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                            {document.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{document.owner_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(document.status)}>
                                                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono text-sm">
                                                        {document.barcode_value || document.public_token}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span>{document.files_count} file{document.files_count !== 1 ? 's' : ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDocument(document)}
                                                        title="View Document Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="View Public Page"
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
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'Try adjusting your search terms.' : 'You\'re not involved with any published documents yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Document Details Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Document Details</DialogTitle>
                        </DialogHeader>
                        {selectedDocument && (
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                                    <p className="text-lg font-semibold">{selectedDocument.title}</p>
                                </div>

                                {selectedDocument.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="text-sm">{selectedDocument.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Owner</Label>
                                        <p className="text-sm">{selectedDocument.owner_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Your Role</Label>
                                        <Badge className={selectedDocument.user_role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                            {selectedDocument.user_role === 'owner' ? 'Owner' : 'Recipient'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                        <Badge className={getStatusColor(selectedDocument.status)}>
                                            {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Files</Label>
                                        <p className="text-sm">{selectedDocument.files_count} file{selectedDocument.files_count !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Published Date</Label>
                                        <p className="text-sm">{format(new Date(selectedDocument.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Public URL</Label>
                                        <a
                                            href={selectedDocument.public_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline break-all"
                                        >
                                            View Public Page
                                        </a>
                                    </div>
                                </div>

                                {selectedDocument.barcode_path && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Barcode</Label>
                                        <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                                            <div className="flex flex-col items-center gap-3">
                                                <img
                                                    src={`/storage/${selectedDocument.barcode_path}`}
                                                    alt="Barcode"
                                                    className="w-64 h-32 border rounded bg-white p-2"
                                                />
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Barcode Value:</p>
                                                    <p className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded border">
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
