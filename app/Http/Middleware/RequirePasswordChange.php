<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequirePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Only apply to admin, user, and receiver roles (not superadmin)
            $rolesRequiringPasswordChange = ['admin', 'user', 'receiver'];

            if (in_array($user->role, $rolesRequiringPasswordChange) && $user->needsPasswordChange()) {
                // Allow access to password change route and logout
                if ($request->routeIs('password.change') || $request->routeIs('password.update') || $request->routeIs('logout')) {
                    return $next($request);
                }

                // Redirect to password change page for all other routes
                return redirect()->route('password.change');
            }
        }

        return $next($request);
    }
}
