<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserActivityLog;
use App\Models\User;
use Inertia\Inertia;

class UserActivityLogController extends Controller
{
    /**
     * Display a listing of the user activity logs with optional filters.
     */
    public function index(Request $request)
    {
        $query = UserActivityLog::with('user');

        // Optional filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderByDesc('created_at')->paginate(20);
        $users = User::select('id', 'first_name', 'last_name', 'email')->get();

        return Inertia::render('Admins/ActivityLogs', [
            'logs' => $logs,
            'filters' => [
                'user_id' => $request->user_id,
                'action' => $request->action,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'users' => $users,
        ]);
    }
}
