<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function markAsRead(Request $request, DatabaseNotification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->notifiable_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();
        return back();
    }

    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->take(20)->get();
        return response()->json($notifications);
    }
}
