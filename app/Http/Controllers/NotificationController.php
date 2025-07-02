<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->take(20)->get();
        return response()->json($notifications);
    }
}
