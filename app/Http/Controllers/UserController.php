<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index()
        {
        $users = User::where('role', 'user')->get();

        return Inertia::render('Users/Home', [
            'users' => $users
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
            'offices' => ['nullable', 'string', 'max:255'],
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
            'offices' => $request->offices,
            'role' => $request->role,
            'avatar' => $avatarPath,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

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

        return redirect()->route('admins.index');
    }

    // Document Profile Methods
    public function documents()
    {
        $documents = Auth::user()->documents;
        return Inertia::render('Users/Documents', [
            'documents' => $documents
        ]);
    }

    public function profile()
    {
        return Inertia::render('Users/Profile', [
            'user' => Auth::user()
        ]);
    }

    public function createDocument()
    {
        return Inertia::render('Users/CreateDocument');
    }

    public function storeDocument(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|string|in:personal,academic,professional',
            'status' => 'required|string|in:draft,published,archived'
        ]);

        $filePath = $request->file('file')->store('documents', 'public');

        // Auth::user()->documents()->create([
        //     'title' => $validated['title'],
        //     'description' => $validated['description'],
        //     'file_path' => $filePath,
        //     'type' => $validated['type'],
        //     'status' => $validated['status']
        // ]);

        return redirect()->route('users.documents')->with('success', 'Document uploaded successfully.');
    }

    public function showDocument($document)
    {
        // $document = Auth::user()->documents()->findOrFail($document);
        // return Inertia::render('Users/Documents/Show', [
        //     'document' => $document
        // ]);
    }

    public function editDocument($document)
    {
        // $document = Auth::user()->documents()->findOrFail($document);
        // return Inertia::render('Users/Documents/Edit', [
        //     'document' => $document
        // ]);
    }

    public function updateDocument(Request $request, $document)
    {
        // $document = Auth::user()->documents()->findOrFail($document);

        // $validated = $request->validate([
        //     'title' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'file' => 'nullable|file|max:10240', // 10MB max
        //     'type' => 'required|string|in:personal,academic,professional',
        //     'status' => 'required|string|in:draft,published,archived'
        // ]);

        // if ($request->hasFile('file')) {
        //     // Delete old file
        //     Storage::disk('public')->delete($document->file_path);
        //     $filePath = $request->file('file')->store('documents', 'public');
        //     $validated['file_path'] = $filePath;
        // }

        // $document->update($validated);

        // return redirect()->route('users.documents')->with('success', 'Document updated successfully.');
    }

    public function destroyDocument($document)
    {
        // $document = Auth::user()->documents()->findOrFail($document);

        // // Delete file from storage
        // Storage::disk('public')->delete($document->file_path);

        // $document->delete();

        // return redirect()->route('users.documents')->with('success', 'Document deleted successfully.');
    }
}
