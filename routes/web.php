<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('admins', function () {
        return Inertia::render('Admins/admins');
    })->name('admins');

    // Admin Management Routes
    Route::get('/admins', [AdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [AdminController::class, 'store'])->name('admins.store');
    Route::patch('/admins/{admin}/toggle-status', [AdminController::class, 'toggleStatus'])->name('admins.toggle-status');
    Route::delete('/admins/{admin}', [AdminController::class, 'destroy'])->name('admins.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
