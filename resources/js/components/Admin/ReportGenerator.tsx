import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Users, Building2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ReportGeneratorProps {
    dateFrom: string;
    dateTo: string;
}

const reportTypes = [
    {
        value: 'user_activity',
        label: 'User Activity Report',
        description: 'Detailed user activity and engagement metrics',
        icon: Users,
    },
    {
        value: 'document_flow',
        label: 'Document Flow Report',
        description: 'Document creation, status changes, and publication trends',
        icon: FileText,
    },
    {
        value: 'department_performance',
        label: 'Department Performance Report',
        description: 'Department-wise document processing and user statistics',
        icon: Building2,
    },
    {
        value: 'processing_times',
        label: 'Processing Times Report',
        description: 'Average processing times and efficiency metrics',
        icon: Clock,
    },
];

const formats = [
    { value: 'json', label: 'JSON', description: 'Structured data format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible format' },
    { value: 'pdf', label: 'PDF', description: 'Printable document format' },
];

export default function ReportGenerator({ dateFrom, dateTo }: ReportGeneratorProps) {
    const [selectedReportType, setSelectedReportType] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const generateReport = async () => {
        if (!selectedReportType || !selectedFormat) {
            toast.error('Please select both report type and format');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/Admin/analytics/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    report_type: selectedReportType,
                    date_from: dateFrom,
                    date_to: dateTo,
                    format: selectedFormat,
                }),
            });

            if (response.ok) {
                if (selectedFormat === 'json') {
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedReportType}_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else if (selectedFormat === 'csv') {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } else if (selectedFormat === 'pdf') {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedReportType}_${new Date().toISOString().split('T')[0]}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
                toast.success('Report generated successfully!');
                setIsOpen(false);
                setSelectedReportType('');
                setSelectedFormat('');
            } else {
                toast.error('Failed to generate report');
            }
        } catch (error) {
            toast.error('Error generating report');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Reports
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Generate Custom Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Report Type Selection */}
                        <div className="space-y-3">
                            <Label>Report Type</Label>
                            <div className="grid gap-3">
                                {reportTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <div
                                            key={type.value}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedReportType === type.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                            onClick={() => setSelectedReportType(type.value)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{type.label}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {type.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div className="space-y-3">
                            <Label>Export Format</Label>
                            <div className="grid gap-3">
                                {formats.map((format) => (
                                    <div
                                        key={format.value}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFormat === format.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedFormat(format.value)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{format.label}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Range Display */}
                <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Date Range</div>
                    <div className="text-sm text-muted-foreground">
                        {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={generateReport}
                    disabled={!selectedReportType || !selectedFormat || isGenerating}
                    className="w-full"
                >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
