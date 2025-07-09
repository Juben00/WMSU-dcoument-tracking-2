"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Navbar from "@/components/User/navbar"
import { Link } from "@inertiajs/react"
import {
    Eye,
    Download,
    Search,
    FileCheck2,
    Clock,
    XCircle,
    Undo2,
    FileSearch,
    Filter,
    BarChart3,
    FileText,
    Plus,
    Users,
    Calendar,
    Archive,
    Hash,
    Send,
    Inbox,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Document {
    id: number
    subject: string
    document_type: "special_order" | "order" | "memorandum" | "for_info"
    status: string
    created_at: string
    owner_id: number
    barcode_value?: string
    order_number?: string
    files?: { id: number }[]
}

interface Props {
    documents: Document[]
    auth: {
        user: {
            id: number
        }
    }
}

const statusIcons: Record<string, React.ReactNode> = {
    approved: <FileCheck2 className="w-4 h-4 text-emerald-600" />,
    pending: <Clock className="w-4 h-4 text-amber-600" />,
    rejected: <XCircle className="w-4 h-4 text-red-600" />,
    returned: <Undo2 className="w-4 h-4 text-orange-600" />,
}

const Documents = ({ documents, auth }: Props) => {
    const [activeTab, setActiveTab] = useState("received")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [documentTypeFilter, setDocumentTypeFilter] = useState("all")
    const [sortBy, setSortBy] = useState("latest")
    const [fiscalYearFilter, setFiscalYearFilter] = useState("all")
    const [archivedFilter, setArchivedFilter] = useState("all")

    // Get current fiscal year (January to December)
    const getCurrentFiscalYear = () => {
        const now = new Date()
        return now.getFullYear()
    }

    // Get fiscal year from date
    const getFiscalYear = (date: string) => {
        return new Date(date).getFullYear()
    }

    // Get available fiscal years from documents
    const getAvailableFiscalYears = () => {
        const years = new Set<number>()
        documents.forEach((doc) => {
            years.add(getFiscalYear(doc.created_at))
        })
        return Array.from(years).sort((a, b) => b - a) // Sort descending
    }

    // Filter documents by fiscal year
    const isInCurrentFiscalYear = (date: string) => {
        const docYear = getFiscalYear(date)
        const currentYear = getCurrentFiscalYear()
        return docYear === currentYear
    }

    // Helper function to determine if a document was originally sent by the current user
    const isDocumentSentByUser = (doc: Document) => {
        return doc.owner_id === auth.user.id && doc.status !== "draft" && doc.status !== "returned"
    }

    // Helper function to determine if a document was originally received by the current user
    const isDocumentReceivedByUser = (doc: Document) => {
        return doc.owner_id !== auth.user.id || (doc.owner_id === auth.user.id && doc.status === "returned")
    }

    // Filter documents by current fiscal year and exclude archived ones from active tabs
    const received = documents.filter((doc) => isInCurrentFiscalYear(doc.created_at) && isDocumentReceivedByUser(doc))

    const sent = documents.filter((doc) => isInCurrentFiscalYear(doc.created_at) && isDocumentSentByUser(doc))

    const published = documents.filter((doc) => doc.owner_id === auth.user.id && (doc as any).is_public)

    // Archived documents are those not in the current fiscal year
    const archived = documents.filter((doc) => !isInCurrentFiscalYear(doc.created_at))

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "approved":
                return "default"
            case "pending":
                return "secondary"
            case "rejected":
                return "destructive"
            case "returned":
                return "outline"
            case "in_review":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getDocumentTypeVariant = (documentType: string) => {
        switch (documentType) {
            case "special_order":
                return "secondary"
            case "order":
                return "default"
            case "memorandum":
                return "outline"
            case "for_info":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getDocumentTypeDisplayName = (documentType: string) => {
        switch (documentType) {
            case "special_order":
                return "Special Order"
            case "order":
                return "Order"
            case "memorandum":
                return "Memorandum"
            case "for_info":
                return "For Info"
            default:
                return "Unknown"
        }
    }

    const filterDocs = (docs: Document[]) => {
        let filtered = docs

        // Filter by search
        if (search.trim()) {
            filtered = filtered.filter(
                (doc) =>
                    doc.subject.toLowerCase().includes(search.toLowerCase()) ||
                    doc.id.toString().includes(search) ||
                    (doc.barcode_value && doc.barcode_value.toLowerCase().includes(search.toLowerCase())) ||
                    (doc.order_number && doc.order_number.toLowerCase().includes(search.toLowerCase())),
            )
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((doc) => doc.status === statusFilter)
        }

        // Filter by document type
        if (documentTypeFilter !== "all") {
            filtered = filtered.filter((doc) => doc.document_type === documentTypeFilter)
        }

        // Filter by fiscal year (only for archived tab)
        if (activeTab === "archived" && fiscalYearFilter !== "all") {
            filtered = filtered.filter((doc) => getFiscalYear(doc.created_at).toString() === fiscalYearFilter)
        }

        // Filter by archived type (only for archived tab)
        if (activeTab === "archived" && archivedFilter !== "all") {
            if (archivedFilter === "sent") {
                filtered = filtered.filter((doc) => isDocumentSentByUser(doc))
            } else if (archivedFilter === "received") {
                filtered = filtered.filter((doc) => isDocumentReceivedByUser(doc))
            }
        }

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortBy === "latest" ? dateB - dateA : dateA - dateB
        })

        return filtered
    }

    const renderDocuments = (docs: Document[]) => {
        const filtered = filterDocs(docs)

        if (filtered.length === 0) {
            return (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No documents found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                        Try adjusting your search terms or filter criteria to find the documents you're looking for.
                    </p>
                </div>
            )
        }

        return filtered.map((doc) => (
            <Card
                key={doc.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
            >
                <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight">
                                {doc.subject}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {doc.order_number && (
                                    <div className="flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        <span className="font-mono">{doc.order_number}</span>
                                    </div>
                                )}
                                {doc.barcode_value && (
                                    <>
                                        {doc.order_number && <span>•</span>}
                                        <div className="flex items-center gap-1">
                                            <BarChart3 className="w-3 h-3" />
                                            <span className="font-mono">{doc.barcode_value}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(doc.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        {doc.files && doc.files.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>
                                    {doc.files.length} file{doc.files.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}
                    </div>

                    {activeTab === "archived" && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                FY {getFiscalYear(doc.created_at)}
                            </Badge>
                            <Badge variant={isDocumentSentByUser(doc) ? "default" : "secondary"} className="text-xs">
                                {isDocumentSentByUser(doc) ? (
                                    <>
                                        <Send className="w-3 h-3 mr-1" />
                                        Sent
                                    </>
                                ) : (
                                    <>
                                        <Inbox className="w-3 h-3 mr-1" />
                                        Received
                                    </>
                                )}
                            </Badge>
                        </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getDocumentTypeVariant(doc.document_type)} className="text-xs">
                            {getDocumentTypeDisplayName(doc.document_type)}
                        </Badge>
                        <Badge variant={getStatusVariant(doc.status)} className="text-xs">
                            <span className="mr-1">{statusIcons[doc.status]}</span>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace("_", " ")}
                        </Badge>
                    </div>

                    <Link href={`/documents/${doc.id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        ))
    }

    const tabConfig = [
        { id: "received", label: "Received", icon: Users, count: received.length },
        { id: "sent", label: "Sent", icon: FileCheck2, count: sent.length },
        { id: "archived", label: "Archived", icon: Archive, count: archived.length },
    ]

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Enhanced Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Documents</h1>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1 text-lg">
                                        Manage and track your documents efficiently
                                    </p>
                                </div>
                            </div>
                            <Link href="/documents/create">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 dark:text-white"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Document
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Enhanced Tabs */}
                    <Card className="mb-8 border-2 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardContent className="p-2">
                            <div className="flex flex-wrap gap-2 justify-start px-5">
                                {tabConfig.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
                                                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                            <Badge variant={activeTab === tab.id ? "secondary" : "outline"} className="ml-1">
                                                {tab.count}
                                            </Badge>
                                        </button>
                                    )
                                })}
                                <Link
                                    href="/published-documents"
                                    className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${typeof window !== "undefined" && window.location.pathname === "/published-documents"
                                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Published
                                    <Badge variant="outline" className="ml-1">
                                        {published.length}
                                    </Badge>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Search and Filter Section */}
                    <Card className="mb-8 border-2 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search & Filter</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Search Input */}
                                <div className="lg:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            type="text"
                                            className="bg-white dark:bg-gray-800 pl-10 h-12 border-slate-200 dark:border-slate-700 focus:ring-red-500 focus:border-red-500"
                                            placeholder="Search by subject, ID, order number, or barcode..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-white dark:bg-gray-800 h-12">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="returned">Returned</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Document Type Filter */}
                                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                                    <SelectTrigger className="bg-white dark:bg-gray-800 h-12">
                                        <FileSearch className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="special_order">Special Order</SelectItem>
                                        <SelectItem value="order">Order</SelectItem>
                                        <SelectItem value="memorandum">Memorandum</SelectItem>
                                        <SelectItem value="for_info">For Info</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Fiscal Year Filter - Only show for archived tab */}
                                {activeTab === "archived" && (
                                    <Select value={fiscalYearFilter} onValueChange={setFiscalYearFilter}>
                                        <SelectTrigger className="bg-white dark:bg-gray-800 h-12">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="All Years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            {getAvailableFiscalYears().map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Archived Type Filter - Only show for archived tab */}
                                {activeTab === "archived" && (
                                    <Select value={archivedFilter} onValueChange={setArchivedFilter}>
                                        <SelectTrigger className="bg-white dark:bg-gray-800 h-12">
                                            <Archive className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="received">Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sort by:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white dark:bg-gray-800 w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Latest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Documents Grid */}
                    <Card className="border-2 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {activeTab === "received"
                                        ? "Received Documents"
                                        : activeTab === "sent"
                                            ? "Sent Documents"
                                            : activeTab === "archived"
                                                ? "Archived Documents"
                                                : "Published Documents"}
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeTab === "received" && renderDocuments(received)}
                                {activeTab === "sent" && renderDocuments(sent)}
                                {activeTab === "archived" && renderDocuments(archived)}
                                {activeTab === "published" && renderDocuments(published)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default Documents
