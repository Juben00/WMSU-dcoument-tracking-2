<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('notifications', function () {
            if (Auth::check()) {
                // Share all notifications (read and unread), latest first, limit 20
                return Auth::user()->notifications()->orderBy('created_at', 'desc')->take(20)->get();
            }
            return [];
        });
    }
}
