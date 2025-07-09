<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\UserActivityLog;
use App\Models\DocumentActivityLog;
use App\Models\Departments;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Get date range from request or default to last 30 days
        $dateFrom = request('date_from', Carbon::now()->subDays(30)->format('Y-m-d'));
        $dateTo = request('date_to', Carbon::now()->format('Y-m-d'));

        // User Analytics
        $userAnalytics = $this->getUserAnalytics($dateFrom, $dateTo);

        // Document Analytics
        $documentAnalytics = $this->getDocumentAnalytics($dateFrom, $dateTo);

        // Department Analytics
        $departmentAnalytics = $this->getDepartmentAnalytics($dateFrom, $dateTo);

        // Activity Analytics
        $activityAnalytics = $this->getActivityAnalytics($dateFrom, $dateTo);

        // Processing Time Analytics
        $processingTimeAnalytics = $this->getProcessingTimeAnalytics($dateFrom, $dateTo);

        return Inertia::render('Admins/Analytics', [
            'userAnalytics' => $userAnalytics,
            'documentAnalytics' => $documentAnalytics,
            'departmentAnalytics' => $departmentAnalytics,
            'activityAnalytics' => $activityAnalytics,
            'processingTimeAnalytics' => $processingTimeAnalytics,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    private function getUserAnalytics($dateFrom, $dateTo)
    {
        // User growth over time
        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        // User activity by role
        $userActivityByRole = UserActivityLog::join('users', 'user_activity_logs.user_id', '=', 'users.id')
            ->selectRaw('users.role, COUNT(*) as activity_count')
            ->whereBetween('user_activity_logs.created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('users.role')
            ->get()
            ->map(function($item) {
                return [
                    'role' => $item->role,
                    'count' => $item->activity_count,
                ];
            });

        // Top active users
        $topActiveUsers = UserActivityLog::with('user.department')
            ->selectRaw('user_id, COUNT(*) as activity_count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('user_id')
            ->orderByDesc('activity_count')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'user_id' => $item->user_id,
                    'name' => $item->user->first_name . ' ' . $item->user->last_name,
                    'email' => $item->user->email,
                    'department' => $item->user->department->name ?? 'No Department',
                    'role' => $item->user->role,
                    'activity_count' => $item->activity_count,
                ];
            });

        return [
            'growth' => $userGrowth,
            'activityByRole' => $userActivityByRole,
            'topActiveUsers' => $topActiveUsers,
        ];
    }

    private function getDocumentAnalytics($dateFrom, $dateTo)
    {
        // Document creation trends
        $documentTrends = Document::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        // Document status distribution
        $statusDistribution = Document::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('status')
            ->get()
            ->map(function($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            });

        // Document types distribution
        $typeDistribution = Document::selectRaw('document_type, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->whereNotNull('document_type')
            ->groupBy('document_type')
            ->get()
            ->map(function($item) {
                return [
                    'type' => $item->document_type,
                    'count' => $item->count,
                ];
            });

        // Published documents trend
        $publishedTrends = Document::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('is_public', true)
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        return [
            'trends' => $documentTrends,
            'statusDistribution' => $statusDistribution,
            'typeDistribution' => $typeDistribution,
            'publishedTrends' => $publishedTrends,
        ];
    }

    private function getDepartmentAnalytics($dateFrom, $dateTo)
    {
        // Department activity
        $departmentActivity = Document::join('users', 'documents.owner_id', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->selectRaw('departments.name, COUNT(documents.id) as document_count')
            ->whereBetween('documents.created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('document_count')
            ->get()
            ->map(function($item) {
                return [
                    'department' => $item->name,
                    'document_count' => $item->document_count,
                ];
            });

        // Department user count
        $departmentUserCount = User::join('departments', 'users.department_id', '=', 'departments.id')
            ->selectRaw('departments.name, COUNT(users.id) as user_count')
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('user_count')
            ->get()
            ->map(function($item) {
                return [
                    'department' => $item->name,
                    'user_count' => $item->user_count,
                ];
            });

        return [
            'activity' => $departmentActivity,
            'userCount' => $departmentUserCount,
        ];
    }

    private function getActivityAnalytics($dateFrom, $dateTo)
    {
        // Activity types
        $activityTypes = UserActivityLog::selectRaw('action, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('action')
            ->orderByDesc('count')
            ->get()
            ->map(function($item) {
                return [
                    'action' => $item->action,
                    'count' => $item->count,
                ];
            });

        // Activity timeline
        $activityTimeline = UserActivityLog::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        // Document activity types
        $documentActivityTypes = DocumentActivityLog::selectRaw('action, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('action')
            ->orderByDesc('count')
            ->get()
            ->map(function($item) {
                return [
                    'action' => $item->action,
                    'count' => $item->count,
                ];
            });

        return [
            'types' => $activityTypes,
            'timeline' => $activityTimeline,
            'documentActivityTypes' => $documentActivityTypes,
        ];
    }

    private function getProcessingTimeAnalytics($dateFrom, $dateTo)
    {
                                // Average processing time by status (Database agnostic)
        $connection = DB::connection()->getDriverName();

        if ($connection === 'sqlite') {
            $avgProcessingTime = DocumentRecipient::selectRaw('status, AVG((julianday(responded_at) - julianday(created_at)) * 24) as avg_hours')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('status')
                ->get()
                ->map(function($item) {
                    return [
                        'status' => $item->status,
                        'avg_hours' => round($item->avg_hours, 2),
                    ];
                });

            // Processing time distribution (SQLite compatible)
            $processingTimeDistribution = DocumentRecipient::selectRaw('
                CASE
                    WHEN (julianday(responded_at) - julianday(created_at)) * 24 <= 24 THEN "0-24 hours"
                    WHEN (julianday(responded_at) - julianday(created_at)) * 24 <= 72 THEN "24-72 hours"
                    WHEN (julianday(responded_at) - julianday(created_at)) * 24 <= 168 THEN "3-7 days"
                    ELSE "Over 7 days"
                END as time_range,
                COUNT(*) as count
            ')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('time_range')
                ->get()
                ->map(function($item) {
                    return [
                        'time_range' => $item->time_range,
                        'count' => $item->count,
                    ];
                });
        } else {
            // MySQL/MariaDB compatible
            $avgProcessingTime = DocumentRecipient::selectRaw('status, AVG(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as avg_hours')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('status')
                ->get()
                ->map(function($item) {
                    return [
                        'status' => $item->status,
                        'avg_hours' => round($item->avg_hours, 2),
                    ];
                });

            // Processing time distribution (MySQL compatible)
            $processingTimeDistribution = DocumentRecipient::selectRaw('
                CASE
                    WHEN TIMESTAMPDIFF(HOUR, created_at, responded_at) <= 24 THEN "0-24 hours"
                    WHEN TIMESTAMPDIFF(HOUR, created_at, responded_at) <= 72 THEN "24-72 hours"
                    WHEN TIMESTAMPDIFF(HOUR, created_at, responded_at) <= 168 THEN "3-7 days"
                    ELSE "Over 7 days"
                END as time_range,
                COUNT(*) as count
            ')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('time_range')
                ->get()
                ->map(function($item) {
                    return [
                        'time_range' => $item->time_range,
                        'count' => $item->count,
                    ];
                });
        }

        return [
            'avgProcessingTime' => $avgProcessingTime,
            'processingTimeDistribution' => $processingTimeDistribution,
        ];
    }

    public function generateReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|in:user_activity,document_flow,department_performance,processing_times',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'format' => 'required|in:json,csv,pdf',
        ]);

        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        $reportType = $request->report_type;
        $format = $request->format;

        $data = [];

        switch ($reportType) {
            case 'user_activity':
                $data = $this->generateUserActivityReport($dateFrom, $dateTo);
                break;
            case 'document_flow':
                $data = $this->generateDocumentFlowReport($dateFrom, $dateTo);
                break;
            case 'department_performance':
                $data = $this->generateDepartmentPerformanceReport($dateFrom, $dateTo);
                break;
            case 'processing_times':
                $data = $this->generateProcessingTimesReport($dateFrom, $dateTo);
                break;
        }

        if ($format === 'json') {
            return response()->json($data);
        } elseif ($format === 'csv') {
            return $this->generateCsvResponse($data, $reportType);
        } elseif ($format === 'pdf') {
            return $this->generatePdfResponse($data, $reportType);
        }

        return response()->json($data);
    }

    private function generateUserActivityReport($dateFrom, $dateTo)
    {
        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as new_users')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $userActivity = UserActivityLog::join('users', 'user_activity_logs.user_id', '=', 'users.id')
            ->selectRaw('users.first_name, users.last_name, users.email, users.role, COUNT(*) as activity_count')
            ->whereBetween('user_activity_logs.created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.role')
            ->orderByDesc('activity_count')
            ->get();

        return [
            'report_type' => 'User Activity Report',
            'period' => $dateFrom . ' to ' . $dateTo,
            'user_growth' => $userGrowth,
            'user_activity' => $userActivity,
        ];
    }

    private function generateDocumentFlowReport($dateFrom, $dateTo)
    {
        $documentCreation = Document::selectRaw('DATE(created_at) as date, COUNT(*) as created_count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $statusChanges = DocumentRecipient::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('status')
            ->get();

        $publishedDocuments = Document::selectRaw('DATE(created_at) as date, COUNT(*) as published_count')
            ->where('is_public', true)
            ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'report_type' => 'Document Flow Report',
            'period' => $dateFrom . ' to ' . $dateTo,
            'document_creation' => $documentCreation,
            'status_changes' => $statusChanges,
            'published_documents' => $publishedDocuments,
        ];
    }

    private function generateDepartmentPerformanceReport($dateFrom, $dateTo)
    {
        $departmentStats = Document::join('users', 'documents.owner_id', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->selectRaw('
                departments.name,
                COUNT(documents.id) as total_documents,
                COUNT(CASE WHEN documents.status = "approved" THEN 1 END) as approved_documents,
                COUNT(CASE WHEN documents.status = "rejected" THEN 1 END) as rejected_documents,
                AVG(TIMESTAMPDIFF(HOUR, documents.created_at, documents.updated_at)) as avg_processing_time
            ')
            ->whereBetween('documents.created_at', [$dateFrom, $dateTo . ' 23:59:59'])
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('total_documents')
            ->get();

        return [
            'report_type' => 'Department Performance Report',
            'period' => $dateFrom . ' to ' . $dateTo,
            'department_stats' => $departmentStats,
        ];
    }

    private function generateProcessingTimesReport($dateFrom, $dateTo)
    {
        $connection = DB::connection()->getDriverName();

        if ($connection === 'sqlite') {
            $processingTimes = DocumentRecipient::selectRaw('
                status,
                AVG((julianday(responded_at) - julianday(created_at)) * 24) as avg_hours,
                MIN((julianday(responded_at) - julianday(created_at)) * 24) as min_hours,
                MAX((julianday(responded_at) - julianday(created_at)) * 24) as max_hours,
                COUNT(*) as total_count
            ')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('status')
                ->get();
        } else {
            $processingTimes = DocumentRecipient::selectRaw('
                status,
                AVG(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as avg_hours,
                MIN(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as min_hours,
                MAX(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as max_hours,
                COUNT(*) as total_count
            ')
                ->whereNotNull('responded_at')
                ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59'])
                ->groupBy('status')
                ->get();
        }

        return [
            'report_type' => 'Processing Times Report',
            'period' => $dateFrom . ' to ' . $dateTo,
            'processing_times' => $processingTimes,
        ];
    }

    private function generateCsvResponse($data, $reportType)
    {
        $filename = $reportType . '_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($data, $reportType) {
            $file = fopen('php://output', 'w');

            // Title and metadata
            fputcsv($file, [ucwords(str_replace('_', ' ', $reportType)) . ' Report']);
            fputcsv($file, ['Generated:', date('Y-m-d H:i')]);
            if (isset($data['period'])) {
                fputcsv($file, ['Period:', $data['period']]);
            }
            fputcsv($file, []); // Blank line

            switch ($reportType) {
                case 'user_activity':
                    fputcsv($file, ['Name', 'Email', 'Role', 'Activity Count']);
                    fputcsv($file, ['Full name of the user', "User's email address", "User's role", 'Number of activities performed']);
                    $totalUsers = 0;
                    $totalActivities = 0;
                    if (isset($data['user_activity'])) {
                        foreach ($data['user_activity'] as $row) {
                            fputcsv($file, [
                                $row->first_name . ' ' . $row->last_name,
                                $row->email,
                                ucfirst($row->role),
                                number_format($row->activity_count),
                            ]);
                            $totalUsers++;
                            $totalActivities += $row->activity_count;
                        }
                    }
                    fputcsv($file, []);
                    fputcsv($file, ['Total Users', $totalUsers]);
                    fputcsv($file, ['Total Activities', number_format($totalActivities)]);
                    break;
                case 'document_flow':
                    // Document Creation Summary
                    if (isset($data['document_creation'])) {
                        fputcsv($file, ['Document Creation Summary']);
                        fputcsv($file, ['Date', 'Created Count']);
                        fputcsv($file, ['Date of creation', 'Number of documents created on this date']);
                        $totalCreated = 0;
                        foreach ($data['document_creation'] as $row) {
                            fputcsv($file, [
                                date('Y-m-d', strtotime($row->date)),
                                number_format($row->created_count),
                            ]);
                            $totalCreated += $row->created_count;
                        }
                        fputcsv($file, []);
                        fputcsv($file, ['Total Documents Created', number_format($totalCreated)]);
                        fputcsv($file, []);
                    }
                    // Status Changes
                    if (isset($data['status_changes'])) {
                        fputcsv($file, ['Document Status Distribution']);
                        fputcsv($file, ['Status', 'Count']);
                        fputcsv($file, ['Document status', 'Number of documents with this status']);
                        $statusTotal = 0;
                        foreach ($data['status_changes'] as $row) {
                            fputcsv($file, [
                                ucfirst($row->status),
                                number_format($row->count),
                            ]);
                            $statusTotal += $row->count;
                        }
                        fputcsv($file, []);
                        fputcsv($file, ['Total Status Changes', number_format($statusTotal)]);
                        fputcsv($file, []);
                    }
                    // Published Documents
                    if (isset($data['published_documents'])) {
                        fputcsv($file, ['Published Documents Summary']);
                        fputcsv($file, ['Date', 'Published Count']);
                        fputcsv($file, ['Date of publication', 'Number of documents published on this date']);
                        $totalPublished = 0;
                        foreach ($data['published_documents'] as $row) {
                            fputcsv($file, [
                                date('Y-m-d', strtotime($row->date)),
                                number_format($row->published_count),
                            ]);
                            $totalPublished += $row->published_count;
                        }
                        fputcsv($file, []);
                        fputcsv($file, ['Total Published Documents', number_format($totalPublished)]);
                        fputcsv($file, []);
                    }
                    break;
                case 'department_performance':
                    fputcsv($file, ['Department Performance Summary']);
                    fputcsv($file, ['Department', 'Total Documents', 'Approved', 'Rejected', 'Avg Processing Time (Hours)']);
                    fputcsv($file, [
                        'Department name',
                        'Total number of documents processed',
                        'Number of approved documents',
                        'Number of rejected documents',
                        'Average processing time in hours',
                    ]);
                    $totalDepartments = 0;
                    $totalDocs = 0;
                    $totalApproved = 0;
                    $totalRejected = 0;
                    $totalAvgTime = 0;
                    if (isset($data['department_stats'])) {
                        foreach ($data['department_stats'] as $row) {
                            fputcsv($file, [
                                $row->name,
                                number_format($row->total_documents),
                                number_format($row->approved_documents),
                                number_format($row->rejected_documents),
                                number_format(round($row->avg_processing_time, 2), 2),
                            ]);
                            $totalDepartments++;
                            $totalDocs += $row->total_documents;
                            $totalApproved += $row->approved_documents;
                            $totalRejected += $row->rejected_documents;
                            $totalAvgTime += $row->avg_processing_time;
                        }
                    }
                    fputcsv($file, []);
                    fputcsv($file, ['Total Departments', $totalDepartments]);
                    fputcsv($file, ['Total Documents', number_format($totalDocs)]);
                    fputcsv($file, ['Total Approved', number_format($totalApproved)]);
                    fputcsv($file, ['Total Rejected', number_format($totalRejected)]);
                    if ($totalDepartments > 0) {
                        fputcsv($file, ['Average Processing Time (All Departments)', number_format($totalAvgTime / $totalDepartments, 2)]);
                    }
                    break;
                case 'processing_times':
                    fputcsv($file, ['Processing Times Summary']);
                    fputcsv($file, ['Status', 'Average Hours', 'Min Hours', 'Max Hours', 'Total Count']);
                    fputcsv($file, [
                        'Document status',
                        'Average processing time in hours',
                        'Minimum processing time in hours',
                        'Maximum processing time in hours',
                        'Total number of documents with this status',
                    ]);
                    $totalCount = 0;
                    $totalAvg = 0;
                    $totalMin = 0;
                    $totalMax = 0;
                    $statusRows = 0;
                    if (isset($data['processing_times'])) {
                        foreach ($data['processing_times'] as $row) {
                            fputcsv($file, [
                                ucfirst($row->status),
                                number_format(round($row->avg_hours, 2), 2),
                                number_format(round($row->min_hours, 2), 2),
                                number_format(round($row->max_hours, 2), 2),
                                number_format($row->total_count),
                            ]);
                            $totalCount += $row->total_count;
                            $totalAvg += $row->avg_hours;
                            $totalMin += $row->min_hours;
                            $totalMax += $row->max_hours;
                            $statusRows++;
                        }
                    }
                    fputcsv($file, []);
                    fputcsv($file, ['Total Statuses', $statusRows]);
                    fputcsv($file, ['Total Documents', number_format($totalCount)]);
                    if ($statusRows > 0) {
                        fputcsv($file, ['Average of Averages', number_format($totalAvg / $statusRows, 2)]);
                        fputcsv($file, ['Average of Minimums', number_format($totalMin / $statusRows, 2)]);
                        fputcsv($file, ['Average of Maximums', number_format($totalMax / $statusRows, 2)]);
                    }
                    break;
                default:
                    // Unknown report type
                    fputcsv($file, ['No data available for this report type.']);
                    break;
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function generatePdfResponse($data, $reportType)
    {
        $filename = $reportType . '_' . date('Y-m-d_H-i-s') . '.pdf';

        // Generate HTML content for the PDF
        $html = $this->generatePdfHtml($data, $reportType);

        // Create PDF using DomPDF
        $pdf = Pdf::loadHTML($html);

        // Set paper size and orientation
        $pdf->setPaper('A4', 'portrait');

        // Return PDF as download
        return $pdf->download($filename);
    }

    private function generatePdfHtml($data, $reportType)
    {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>' . ucwords(str_replace('_', ' ', $reportType)) . ' Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .title { font-size: 24px; font-weight: bold; color: #333; }
                .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
                .section { margin: 20px 0; }
                .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">' . ucwords(str_replace('_', ' ', $reportType)) . ' Report</div>
                <div class="subtitle">Generated on ' . date('F j, Y \a\t g:i A') . '</div>
                <div class="subtitle">Period: ' . $data['period'] . '</div>
            </div>';

        switch ($reportType) {
            case 'user_activity':
                $html .= $this->generateUserActivityPdfContent($data);
                break;
            case 'document_flow':
                $html .= $this->generateDocumentFlowPdfContent($data);
                break;
            case 'department_performance':
                $html .= $this->generateDepartmentPerformancePdfContent($data);
                break;
            case 'processing_times':
                $html .= $this->generateProcessingTimesPdfContent($data);
                break;
        }

        $html .= '
            <div class="footer">
                <p>Document Management and Tracking System</p>
                <p>Western Mindanao State University</p>
            </div>
        </body>
        </html>';

        return $html;
    }

    private function generateUserActivityPdfContent($data)
    {
        $html = '<div class="section">
            <div class="section-title">User Growth Summary</div>
            <div class="summary">
                <p><strong>Total New Users:</strong> ' . $data['user_growth']->sum('new_users') . '</p>
                <p><strong>Average Daily Growth:</strong> ' . round($data['user_growth']->avg('new_users'), 2) . ' users per day</p>
            </div>
        </div>';

        if (isset($data['user_activity']) && $data['user_activity']->count() > 0) {
            $html .= '<div class="section">
                <div class="section-title">Top Active Users</div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Activity Count</th>
                        </tr>
                    </thead>
                    <tbody>';

            foreach ($data['user_activity']->take(10) as $user) {
                $html .= '<tr>
                    <td>' . $user->first_name . ' ' . $user->last_name . '</td>
                    <td>' . $user->email . '</td>
                    <td>' . ucfirst($user->role) . '</td>
                    <td>' . $user->activity_count . '</td>
                </tr>';
            }

            $html .= '</tbody></table></div>';
        }

        return $html;
    }

    private function generateDocumentFlowPdfContent($data)
    {
        $html = '<div class="section">
            <div class="section-title">Document Creation Summary</div>
            <div class="summary">
                <p><strong>Total Documents Created:</strong> ' . $data['document_creation']->sum('created_count') . '</p>
                <p><strong>Average Daily Creation:</strong> ' . round($data['document_creation']->avg('created_count'), 2) . ' documents per day</p>
            </div>
        </div>';

        if (isset($data['status_changes']) && $data['status_changes']->count() > 0) {
            $html .= '<div class="section">
                <div class="section-title">Document Status Distribution</div>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>';

            foreach ($data['status_changes'] as $status) {
                $html .= '<tr>
                    <td>' . ucfirst($status->status) . '</td>
                    <td>' . $status->count . '</td>
                </tr>';
            }

            $html .= '</tbody></table></div>';
        }

        if (isset($data['published_documents']) && $data['published_documents']->count() > 0) {
            $html .= '<div class="section">
                <div class="section-title">Published Documents Summary</div>
                <div class="summary">
                    <p><strong>Total Published Documents:</strong> ' . $data['published_documents']->sum('published_count') . '</p>
                    <p><strong>Average Daily Publications:</strong> ' . round($data['published_documents']->avg('published_count'), 2) . ' documents per day</p>
                </div>
            </div>';
        }

        return $html;
    }

    private function generateDepartmentPerformancePdfContent($data)
    {
        $html = '<div class="section">
            <div class="section-title">Department Performance Summary</div>';

        if (isset($data['department_stats']) && $data['department_stats']->count() > 0) {
            $html .= '<table>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Total Documents</th>
                        <th>Approved</th>
                        <th>Rejected</th>
                        <th>Avg Processing Time (Hours)</th>
                    </tr>
                </thead>
                <tbody>';

            foreach ($data['department_stats'] as $dept) {
                $html .= '<tr>
                    <td>' . $dept->name . '</td>
                    <td>' . $dept->total_documents . '</td>
                    <td>' . $dept->approved_documents . '</td>
                    <td>' . $dept->rejected_documents . '</td>
                    <td>' . round($dept->avg_processing_time, 2) . '</td>
                </tr>';
            }

            $html .= '</tbody></table>';
        }

        return $html;
    }

    private function generateProcessingTimesPdfContent($data)
    {
        $html = '<div class="section">
            <div class="section-title">Processing Times Summary</div>';

        if (isset($data['processing_times']) && $data['processing_times']->count() > 0) {
            $html .= '<table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Average Hours</th>
                        <th>Min Hours</th>
                        <th>Max Hours</th>
                        <th>Total Count</th>
                    </tr>
                </thead>
                <tbody>';

            foreach ($data['processing_times'] as $time) {
                $html .= '<tr>
                    <td>' . ucfirst($time->status) . '</td>
                    <td>' . round($time->avg_hours, 2) . '</td>
                    <td>' . round($time->min_hours, 2) . '</td>
                    <td>' . round($time->max_hours, 2) . '</td>
                    <td>' . $time->total_count . '</td>
                </tr>';
            }

            $html .= '</tbody></table>';
        }

        return $html;
    }
}
