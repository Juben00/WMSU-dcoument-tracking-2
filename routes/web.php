<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\OfficeController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        if (Auth::user()->role === 'superadmin') {
            return Inertia::render('dashboard');
        } else {
            return Inertia::render('Users/Dashboard');
        }
    })->name('dashboard');

    // Admin and Office Management Routes - Superadmin Only
        // Admin Management Routes
    Route::middleware('role:superadmin')->group(function () {

        Route::get('/Admin/users', [AdminController::class, 'index'])->name('admins.index');
        Route::post('/Admin/users', [AdminController::class, 'store'])->name('admins.store');
        Route::put('/Admin/users/{admin}', [AdminController::class, 'update'])->name('admins.update');
        Route::patch('/Admin/users/{admin}/toggle-status', [AdminController::class, 'toggleStatus'])->name('admins.toggle-status');
        Route::delete('/Admin/users/{admin}', [AdminController::class, 'destroy'])->name('admins.destroy');

        // Office Management Routes
        Route::get('/Admin/offices', [OfficeController::class, 'index'])->name('offices.index');
        Route::get('/Admin/offices/create', [OfficeController::class, 'create'])->name('offices.create');
        Route::post('/Admin/offices', [OfficeController::class, 'store'])->name('offices.store');
        Route::get('/Admin/offices/{office}', [OfficeController::class, 'show'])->name('offices.show');
        Route::get('/Admin/offices/{office}/edit', [OfficeController::class, 'edit'])->name('offices.edit');
        Route::put('/Admin/offices/{office}', [OfficeController::class, 'update'])->name('offices.update');
        Route::delete('/Admin/offices/{office}', [OfficeController::class, 'destroy'])->name('offices.destroy');
    });

    // User Management Routes
    // Route::get('/users', [UserController::class, 'index'])->name('users.index');
    // Route::get('/documents', [UserController::class, 'documents'])->name('users.documents');
    // Route::get('/profile', [UserController::class, 'profile'])->name('users.profile');


    // // User Document Profile Routes
    // Route::get('/documents/create', [UserController::class, 'createDocument'])->name('users.createDocument');
    // Route::post('/users/documents', [UserController::class, 'storeDocument'])->name('users.documents.store');
    // Route::get('/users/documents/{document}', [UserController::class, 'showDocument'])->name('users.documents.show');
    // Route::get('/users/documents/{document}/edit', [UserController::class, 'editDocument'])->name('users.documents.edit');
    // Route::put('/users/documents/{document}', [UserController::class, 'updateDocument'])->name('users.documents.update');
    // Route::delete('/users/documents/{document}', [UserController::class, 'destroyDocument'])->name('users.documents.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
