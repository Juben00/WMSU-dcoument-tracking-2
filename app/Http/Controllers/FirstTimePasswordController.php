<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class FirstTimePasswordController extends Controller
{
    /**
     * Show the first-time password change form.
     */
    public function show(): Response
    {
        return Inertia::render('auth/first-time-password');
    }

    /**
     * Handle the first-time password change.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($validated['password']),
            'password_changed_at' => now(),
            'email_verified_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Password changed successfully. Welcome to the system!');
    }
}
