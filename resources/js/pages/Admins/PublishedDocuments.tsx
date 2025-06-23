import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {
    FileText,
    Eye,
    ExternalLink,
    Trash2,
    Search,
    Calendar,
    User,
    Building,
    Download,
    QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Published Documents',
        href: '/Admin/published-documents',
    },
];

interface PublishedDocument {
    id: number;
    title: string;
    description?: string;
    status: string;
    is_public: boolean;
    public_token: string;
    barcode_path?: string;
    created_at: string;
    owner: {
        id: number;
        name: string;
        email: string;
        office: string;
    };
    files_count: number;
    public_url: string;
}

interface Props {
    publishedDocuments: PublishedDocument[];
}

export default function PublishedDocuments({ publishedDocuments }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocument, setSelectedDocument] = useState<PublishedDocument | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const filteredDocuments = publishedDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.owner.office.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUnpublishDocument = (document: PublishedDocument) => {
        if (confirm(`Are you sure you want to unpublish "${document.title}"? This will remove it from public access.`)) {
            router.delete(route('admin.unpublish-document', document.id), {
                onSuccess: () => {
                    toast.success('Document unpublished successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to unpublish document. Please try again.');
                }
            });
        }
    };

    const handleViewDocument = (document: PublishedDocument) => {
        setSelectedDocument(document);
        setIsViewDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'in_review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'returned':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Published Documents Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Published Documents</h1>
                        <p className="text-muted-foreground">
                            Manage all publicly accessible documents
                        </p>
                    </div>
                </div>

                {/* Statistics Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Published Documents Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Published</p>
                                    <p className="text-2xl font-bold">{publishedDocuments.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Unique Authors</p>
                                    <p className="text-2xl font-bold">
                                        {new Set(publishedDocuments.map(doc => doc.owner.id)).size}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Building className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Offices Involved</p>
                                    <p className="text-2xl font-bold">
                                        {new Set(publishedDocuments.map(doc => doc.owner.office)).size}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search Documents</CardTitle>
                        <CardDescription>
                            Find specific published documents by title, author, or office
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by title, author, or office..."
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
                            All documents currently available for public access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Office</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Published Date</TableHead>
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
                                                    <span>{document.owner.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                    <span>{document.owner.office}</span>
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
                                                    <span>{format(new Date(document.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Download className="h-4 w-4 text-muted-foreground" />
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleUnpublishDocument(document)}
                                                        title="Unpublish Document"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
                                    {searchTerm ? 'Try adjusting your search terms.' : 'No documents have been published yet.'}
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
                                        <Label className="text-sm font-medium text-muted-foreground">Author</Label>
                                        <p className="text-sm">{selectedDocument.owner.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Office</Label>
                                        <p className="text-sm">{selectedDocument.owner.office}</p>
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
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Public URL</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input value={selectedDocument.public_url} readOnly />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            asChild
                                        >
                                            <a href={selectedDocument.public_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {selectedDocument.barcode_path && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">QR Code</Label>
                                        <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <QrCode className="h-5 w-5 text-gray-600" />
                                                <span className="text-sm text-gray-600">QR code available for this document</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsViewDialogOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setIsViewDialogOpen(false);
                                            handleUnpublishDocument(selectedDocument);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Unpublish Document
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
