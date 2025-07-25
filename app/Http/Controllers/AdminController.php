<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Departments;
use App\Models\Document;
use App\Models\DocumentRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Notifications\InAppNotification;

class AdminController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')->with('department')->get();
        // get all departments where there is no existing admin
        $departments = Departments::whereDoesntHave('users', function($query) {
            $query->where('role', 'admin');
        })->get();

        return Inertia::render('Admins/User', [
            'admins' => $admins,
            'departments' => $departments
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'role' => ['required', 'string', 'in:admin,user'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'gender' => $request->gender,
            'position' => $request->position,
            'department_id' => $request->department_id,
            'role' => $request->role,
            'avatar' => $avatarPath,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Notify the user about their account creation
        $user->notify(new InAppNotification('Your admin account has been created.', ['user_id' => $user->id]));

        return redirect()->route('admins.index');
    }

    public function toggleStatus(User $admin)
    {
        $admin->update([
            'is_active' => !$admin->is_active
        ]);

        return redirect()->route('admins.index');
    }

    public function destroy(User $admin)
    {
        $admin->delete();

        // Notify all superadmins
        $superadmins = User::where('role', 'superadmin')->get();
        foreach ($superadmins as $superadmin) {
            $superadmin->notify(new InAppNotification('An admin has been deleted.', ['admin_id' => $admin->id]));
        }

        return redirect()->route('admins.index');
    }

    public function update(Request $request, User $admin)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'department_id' => ['required', 'exists:departments,id'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $admin->id],
        ]);

        $data = $request->except('avatar');

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($admin->avatar) {
                Storage::disk('public')->delete($admin->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $admin->update($data);

        // Notify all superadmins and the updated admin
        $superadmins = User::where('role', 'superadmin')->get();
        foreach ($superadmins as $superadmin) {
            $superadmin->notify(new InAppNotification('An admin has been updated.', ['admin_id' => $admin->id]));
        }
        $admin->notify(new InAppNotification('Your admin account has been updated.', ['admin_id' => $admin->id]));

        return redirect()->route('admins.index');
    }

    public function dashboard()
    {
        // User Statistics
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();
        $adminUsers = User::where('role', 'admin')->count();
        $regularUsers = User::where('role', 'user')->count();

        // Document Statistics
        $totalDocuments = Document::count();
        $draftDocuments = Document::where('status', 'draft')->count();
        $pendingDocuments = Document::where('status', 'pending')->count();
        $inReviewDocuments = Document::where('status', 'in_review')->count();
        $approvedDocuments = Document::where('status', 'approved')->count();
        $rejectedDocuments = Document::where('status', 'rejected')->count();
        $returnedDocuments = Document::where('status', 'returned')->count();
        $cancelledDocuments = Document::where('status', 'cancelled')->count();
        $publicDocuments = Document::where('is_public', true)->count();

        // Department Statistics
        $totalDepartments = Departments::count();
        $departmentsWithUsers = Departments::has('users')->count();

        // Recent Activities (last 10 document activities)
        $recentActivities = DocumentRecipient::with(['document.owner', 'user'])
            ->whereNotNull('responded_at')
            ->orderByDesc('responded_at')
            ->take(10)
            ->get()
            ->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'document_title' => $activity->document->subject ?? 'Untitled',
                    'document_owner' => $activity->document->owner->first_name . ' ' . $activity->document->owner->last_name,
                    'recipient' => $activity->user->first_name . ' ' . $activity->user->last_name,
                    'status' => $activity->status,
                    'comments' => $activity->comments,
                    'responded_at' => $activity->responded_at,
                    'created_at' => $activity->created_at,
                ];
            });

        // Monthly Document Trends (last 6 months)
        $monthlyTrends = Document::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                    'count' => $item->count,
                ];
            });

        // If no trends data, provide default structure
        if ($monthlyTrends->isEmpty()) {
            $monthlyTrends = collect([
                ['month' => Carbon::now()->format('M Y'), 'count' => 0],
                ['month' => Carbon::now()->subMonth()->format('M Y'), 'count' => 0],
                ['month' => Carbon::now()->subMonths(2)->format('M Y'), 'count' => 0],
            ]);
        }

        // Top Departments by Document Count
        $topDepartments = DB::table('departments')
            ->leftJoin('users', 'departments.id', '=', 'users.department_id')
            ->leftJoin('documents', 'users.id', '=', 'documents.owner_id')
            ->select(
                'departments.id',
                'departments.name',
                DB::raw('COUNT(DISTINCT users.id) as user_count'),
                DB::raw('COUNT(DISTINCT documents.id) as document_count')
            )
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('document_count')
            ->take(5)
            ->get()
            ->map(function($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'user_count' => $department->user_count,
                    'document_count' => $department->document_count,
                ];
            });

        // Document Status Distribution
        $statusDistribution = [
            'Draft' => $draftDocuments,
            'Pending' => $pendingDocuments,
            'In Review' => $inReviewDocuments,
            'Approved' => $approvedDocuments,
            'Rejected' => $rejectedDocuments,
            'Returned' => $returnedDocuments,
            'Cancelled' => $cancelledDocuments,
        ];

        // Recent Users (last 5 registered users)
        $recentUsers = User::with('department')
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department->name ?? 'No Department',
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'inactive' => $inactiveUsers,
                    'admins' => $adminUsers,
                    'regular' => $regularUsers,
                ],
                'documents' => [
                    'total' => $totalDocuments,
                    'draft' => $draftDocuments,
                    'pending' => $pendingDocuments,
                    'in_review' => $inReviewDocuments,
                    'approved' => $approvedDocuments,
                    'rejected' => $rejectedDocuments,
                    'returned' => $returnedDocuments,
                    'cancelled' => $cancelledDocuments,
                    'public' => $publicDocuments,
                ],
                'departments' => [
                    'total' => $totalDepartments,
                    'with_users' => $departmentsWithUsers,
                ],
            ],
            'recentActivities' => $recentActivities,
            'monthlyTrends' => $monthlyTrends,
            'topDepartments' => $topDepartments,
            'statusDistribution' => $statusDistribution,
            'recentUsers' => $recentUsers,
        ]);
    }

    public function publishedDocuments()
    {
        $publishedDocuments = Document::where('is_public', true)
            ->with(['owner', 'files'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function($document) {
                return [
                    'id' => $document->id,
                    'subject' => $document->subject,
                    'description' => $document->description,
                    'status' => $document->status,
                    'is_public' => $document->is_public,
                    'public_token' => $document->public_token,
                    'barcode_path' => $document->barcode_path,
                    'barcode_value' => $document->barcode_value,
                    'created_at' => $document->created_at,
                    'owner' => [
                        'id' => $document->owner->id,
                        'name' => $document->owner->first_name . ' ' . $document->owner->last_name,
                        'email' => $document->owner->email,
                        'department' => $document->owner->department->name ?? 'No Department',
                    ],
                    'files_count' => $document->files->count(),
                    'public_url' => route('documents.public_view', ['public_token' => $document->public_token]),
                ];
            });

        return Inertia::render('Admins/PublishedDocuments', [
            'publishedDocuments' => $publishedDocuments,
        ]);
    }

    public function unpublishDocument(Document $document)
    {
        if (!$document->is_public) {
            return redirect()->back()->with('error', 'Document is not published.');
        }

        // Delete barcode file if exists
        if ($document->barcode_path) {
            Storage::disk('public')->delete($document->barcode_path);
        }

        // Update document
        $document->update([
            'is_public' => false,
            'public_token' => null,
            'barcode_path' => null,
            'barcode_value' => null,
        ]);

        return redirect()->back()->with('success', 'Document unpublished successfully.');
    }
}
