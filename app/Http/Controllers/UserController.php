<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\DocumentRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\Office;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
        {
        $users = User::where('role', 'user')->get();

        return Inertia::render('Admins/user', [
            'users' => $users
        ]);
    }

    public function offices()
    {
        $users = User::whereIn('role', ['user', 'receiver'])->with('office')->get();
        return Inertia::render('Users/Offices', [
            'auth' => [
                'user' => Auth::user()
            ],
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
            'role' => ['required', 'string', 'in:receiver,user'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Check if trying to create a receiver and if one already exists for this office
        if ($request->role === 'receiver') {
            $existingReceiver = User::where('office_id', Auth::user()->office_id)
                ->where('role', 'receiver')
                ->first();

            if ($existingReceiver) {
                return back()->withErrors([
                    'role' => 'A receiver already exists for this office.'
                ]);
            }
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'gender' => $request->gender,
            'position' => $request->position,
            'office_id' => Auth::user()->office_id,
            'role' => $request->role,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('users.offices');
    }

    public function toggleStatus(User $admin)
    {
        $admin->update([
            'is_active' => !$admin->is_active
        ]);

        return redirect()->route('admins.index');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.offices');
    }

    // Document Profile Methods
    public function documents()
    {
        // Get documents where user is the owner
        $ownedDocuments = Auth::user()->documents;

        // Get documents where user is a recipient
        $receivedDocuments = Document::whereHas('recipients', function($query) {
            $query->where('user_id', Auth::id());
        })->get();

        // Merge the collections
        $documents = $ownedDocuments->concat($receivedDocuments);

        return Inertia::render('Users/Documents', [
            'documents' => $documents,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function profile()
    {
        $user = User::with('office')->find(Auth::id());
        return Inertia::render('Users/Profile', [
            'user' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore(Auth::id()),
            ],
        ]);

        $user = User::find(Auth::id());
        $user->fill($validated);
        $user->save();

        return redirect()->route('users.profile')->with('flash', [
            'success' => 'Profile updated successfully.'
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::find(Auth::id());
        $user->password = Hash::make($validated['password']);
        $user->save();

        return back()->with('success', 'Password updated successfully.');
    }

    public function createDocument()
    {
        $offices = Office::with(['users' => function($query) {
            $query->whereIn('role', ['receiver', 'admin'])->where('id', '!=', Auth::user()->id)
                  ->orderBy('role', 'desc'); // This will put receivers first
        }])->get();

        // Transform the data to include the contact person for each office
        $officesWithContact = $offices->map(function($office) {
            $contactPerson = $office->users->first();
            return [
                'id' => $office->id,
                'name' => $office->name,
                'contact_person' => $contactPerson ? [
                    'id' => $contactPerson->id,
                    'name' => $contactPerson->first_name . ' ' . $contactPerson->last_name,
                    'role' => $contactPerson->role
                ] : null
            ];
        });

        return Inertia::render('Users/CreateDocument', [
            'auth' => [
                'user' => Auth::user()
            ],
            'offices' => $officesWithContact
        ]);
    }

    public function storeDocument(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'files' => 'required|array',
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'status' => 'required|string|in:draft,pending',
            'recipient_id' => 'required_if:status,pending|exists:users,id'
        ]);

        // Create the document
        $document = Document::create([
            'owner_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status']
        ]);

        // Handle multiple file uploads
        foreach ($request->file('files') as $file) {
            $filePath = $file->store('documents', 'public');

            $document->files()->create([
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize()
            ]);
        }

        // If document is being submitted (not draft), create the initial recipient
        if ($validated['status'] === 'pending' && isset($validated['recipient_id'])) {
            DocumentRecipient::create([
                'document_id' => $document->id,
                'user_id' => $validated['recipient_id'],
                'status' => 'pending',
                'sequence' => 1,
                'is_active' => true
            ]);
        }

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

    public function update(Request $request, User $user)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'in:receiver,user'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        // Check if trying to update to receiver role and if one already exists for this office
        if ($request->role === 'receiver' && $user->role !== 'receiver') {
            $existingReceiver = User::where('office_id', Auth::user()->office_id)
                ->where('role', 'receiver')
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingReceiver) {
                return back()->withErrors([
                    'role' => 'A receiver already exists for this office.'
                ]);
            }
        }

        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'gender' => $request->gender,
            'position' => $request->position,
            'role' => $request->role,
            'email' => $request->email,
        ]);

        return redirect()->route('users.offices');
    }
}
