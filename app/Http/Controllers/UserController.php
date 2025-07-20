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
use App\Models\Departments;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;
use Picqer\Barcode\BarcodeGeneratorSVG;
use App\Notifications\InAppNotification;
use App\Models\UserActivityLog;
use App\Models\DocumentActivityLog;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
        {
        $users = User::where('role', 'user')->get();

        return Inertia::render('Admins/user', [
            'users' => $users
        ]);
    }

    public function departments()
    {
        // get all users with role user or receiver and with department same as the user's department
        $users = User::whereIn('role', ['user', 'receiver'])->where('department_id', Auth::user()->department_id)->with('department')->get();
        return Inertia::render('Users/Department', [
            'auth' => [
                'user' => Auth::user(),
                'department' => Auth::user()->department
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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'gender' => $request->gender,
            'position' => $request->position,
            'department_id' => Auth::user()->department_id,
            'role' => "user",   // default role is user
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Notify the user about their account creation
        $user->notify(new InAppNotification('Your account has been created.', ['user_id' => $user->id]));

        // Log user creation
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_created',
            'description' => 'Created user: ' . $user->email,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('users.departments');
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
        // Notify the user (if possible) and all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new InAppNotification('A user has been deleted.', ['user_id' => $user->id]));
        }
        // Log user deletion
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_deleted',
            'description' => 'Deleted user: ' . $user->email,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
        return redirect()->route('users.departments');
    }

    // Document Profile Methods
    public function documents()
    {
        // Get documents where user is the owner
        $ownedDocuments = Document::where('owner_id', Auth::id())
            ->select('id', 'subject', 'document_type', 'status', 'created_at', 'owner_id', 'is_public', 'barcode_value', 'order_number')
            ->with(['files:id,document_id'])
            ->get();

        // Get documents where user is a recipient
        $receivedDocuments = Document::whereHas('recipients', function($query) {
            $query->where('department_id', Auth::user()->department_id);
        })
        ->select('id', 'subject', 'document_type', 'status', 'created_at', 'owner_id', 'is_public', 'barcode_value', 'order_number')
        ->with(['recipients' => function($q) {
            $q->where('department_id', Auth::user()->department_id)->select('id', 'document_id', 'department_id', 'status');
        }, 'files:id,document_id'])
        ->get();

        // Get returned documents where user is the owner
        $returnedDocuments = Document::where('owner_id', Auth::id())
            ->where('status', 'returned')
            ->select('id', 'subject', 'document_type', 'status', 'created_at', 'owner_id', 'is_public', 'barcode_value', 'order_number')
            ->with(['files:id,document_id'])
            ->get();

        // Merge the collections and remove duplicates
        $documents = $ownedDocuments->concat($receivedDocuments)->concat($returnedDocuments)->unique('id');

        // Attach recipient_status for the current user's department if applicable
        $departmentId = Auth::user()->department_id;
        $documents = $documents->map(function($doc) use ($departmentId) {
            // If the user is a recipient, get the recipient status for their department
            if (isset($doc->recipients) && $doc->recipients->count() > 0) {
                $recipient = $doc->recipients->first();
                $doc->recipient_status = $recipient ? $recipient->status : null;
            } else {
                $doc->recipient_status = null;
            }
            // For owner, recipient_status is null
            return $doc;
        });

        return Inertia::render('Users/Documents', [
            'documents' => $documents,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function profile()
    {
        $user = User::with('department')->find(Auth::id());
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

        // Log user update
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_updated',
            'description' => 'Updated user: ' . $user->email,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('users.profile')->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::find(Auth::id());
        $user->password = Hash::make($validated['password']);
        $user->markPasswordAsChanged();
        $user->save();

        return back()->with('success', 'Password updated successfully.');
    }

    public function createDocument()
    {
        $departments = Departments::with(['users' => function($query) {
            $query->whereIn('role', ['receiver', 'admin'])->where('id', '!=', Auth::user()->id)
                  ->orderBy('role', 'desc'); // This will put receivers first
        }])->get();

        $departments = Departments::where('id', '!=', Auth::user()->department_id)->get();

        return Inertia::render('Users/CreateDocument', [
            'auth' => [
                'user' => Auth::user()
            ],
            'departments' => $departments
        ]);
    }

    public function generateOrderNumber(Request $request)
    {
        $request->validate([
            'document_type' => 'required|in:special_order,order,memorandum,for_info',
        ]);

        $currentUser = Auth::user();
        $departmentId = $currentUser->department_id;
        $department = $currentUser->department;
        $documentType = $request->input('document_type');
        $currentYear = now()->year;

        // Check if user has a department assigned
        if (!$department) {
            return response()->json(['error' => 'User does not have a department assigned.'], 400);
        }

        // Check if this is the President's office (OP)
        $isPresidentOffice = $department->code === 'OP';

        // Get the latest order number for this department and document type
        $query = Document::where('department_id', $departmentId)
            ->whereYear('created_at', $currentYear);

        if ($isPresidentOffice) {
            $query->where('document_type', $documentType);
        }

        $latestDocument = $query->orderBy('order_number', 'desc')->first();

        if ($latestDocument) {
            // Extract only the sequence number part (last 3 digits after the last dash)
            $parts = explode('-', $latestDocument->order_number);
            $lastPart = end($parts);
            $nextNumber = intval($lastPart) + 1;
        } else {
            $nextNumber = 1;
        }

        // Format the order number based on department and document type
        $departmentCode = $department->code;

        // Format: DEPT-YEAR-NUMBER (e.g., OP-2024-001)
        $orderNumber = sprintf('%s-%d-%03d', $departmentCode, $currentYear, $nextNumber);

        return response()->json(['order_number' => $orderNumber]);
    }

    public function sendDocument(Request $request)
    {
        try {

        // Get the current user's department
        $currentUser = Auth::user();
        $departmentId = $currentUser->department_id;
        $department = $currentUser->department;

        // Check if this is the President's office (OP)
        $isPresidentOffice = $department && $department->code === 'OP';

        // Define validation rules based on department type
        $orderNumberRule = ['required', 'string', 'max:255'];
        // Determine current fiscal year (calendar year)
        $currentYear = now()->year;
        if ($isPresidentOffice) {
            // For President's office: unique per department, document_type, and order_number, but only for non-archived and current fiscal year
            $orderNumberRule[] = function ($attribute, $value, $fail) use ($departmentId, $request, $currentYear) {
                $exists = Document::where('department_id', $departmentId)
                    ->where('document_type', $request->input('document_type'))
                    ->where('order_number', $value)
                    ->where(function($query) use ($currentYear) {
                        $query->where('status', '!=', 'archived')
                              ->whereYear('created_at', $currentYear);
                    })
                    ->exists();
                if ($exists) {
                    $fail('The order number has already been taken for this department and document type in the current fiscal year.');
                }
            };
        } else {
            // For other departments: unique per department and order_number, but only for non-archived and current fiscal year
            $orderNumberRule[] = function ($attribute, $value, $fail) use ($departmentId, $currentYear) {
                $exists = Document::where('department_id', $departmentId)
                    ->where('order_number', $value)
                    ->where(function($query) use ($currentYear) {
                        $query->where('status', '!=', 'archived')
                              ->whereYear('created_at', $currentYear);
                    })
                    ->exists();
                if ($exists) {
                    $fail('The order number has already been taken for this department in the current fiscal year.');
                }
            };
        }

        // Convert string to boolean
        $autoGenerate = $request->input('auto_generate_order_number') === '1';

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'order_number' => $autoGenerate ? 'nullable' : $orderNumberRule,
            'document_type' => 'required|in:special_order,order,memorandum,for_info',
            'description' => 'nullable|string',
            'files' => 'required|array',
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'recipient_ids' => 'required|array|min:1',
            'recipient_ids.*' => 'exists:departments,id',
            'initial_recipient_id' => 'nullable|exists:departments,id',
            'through_department_ids' => 'nullable|array',
            'through_department_ids.*' => 'exists:departments,id',
            'auto_generate_order_number' => 'required|in:0,1'
        ]);

        // If auto-generate is enabled, generate the order number
        if ($autoGenerate) {
            $orderNumberRequest = new Request(['document_type' => $validated['document_type']]);
            $orderNumberResponse = $this->generateOrderNumber($orderNumberRequest);
            $orderNumberData = json_decode($orderNumberResponse->getContent(), true);
            $validated['order_number'] = $orderNumberData['order_number'];
        }

        // Create the document
        $document = Document::create([
            'owner_id' => Auth::id(),
            'department_id' => $departmentId,
            'subject' => $validated['subject'],
            'order_number' => $validated['order_number'],
            'document_type' => $validated['document_type'],
            'description' => $validated['description'],
            'through_department_ids' => $request->input('through_department_ids', []),
            'status' => 'pending',
        ]);

        // Recipient logic
        if ($validated['document_type'] === 'for_info') {
            // Multi-recipient logic (unchanged)
            $sequence = 1;
            foreach ($validated['recipient_ids'] as $recipientDeptId) {
                if (!$recipientDeptId) continue;

                DocumentRecipient::create([
                    'document_id' => $document->id,
                    'department_id' => $recipientDeptId,
                    'status' => 'pending',
                    'sequence' => $sequence,
                    'is_active' => true,
                ]);
                $sequence++;
            }
        } else {
            // For memorandum, order, special_order documents
            $sendToDeptId = $request->input('recipient_ids')[0];
            $throughDeptIds = $request->input('through_department_ids', []);

            // Get the sendToDeptId's office admin
            // $officeAdmin = User::where('department_id', $sendToDeptId)->where('role', 'admin')->first();
            // Determine the initial recipient (first through department if any, otherwise the main recipient)
            $initialRecipientDeptId = !empty($throughDeptIds) ? $throughDeptIds[0] : $sendToDeptId;

            DocumentRecipient::create([
                'document_id' => $document->id,
                'department_id' => $initialRecipientDeptId, // Initially send to first through department or directly to main recipient
                'final_recipient_department_id' => $sendToDeptId,
                'status' => 'pending',
                'sequence' => 1,
                'is_active' => true,
                'forwarded_by' => null,
            ]);
        }

        // Generate barcode at the moment the document is sent
        $currentUser = Auth::user();
        $department = $currentUser->department;
        $departmentCode = $department ? $department->code : 'NOCODE';
        $timestamp = now()->format('YmdHis'); // Format: YYYYMMDDHHMMSS
        $userId = $currentUser->id;

        // Generate unique barcode value: Department Code + Timestamp + User ID
        $barcodeValue = $departmentCode . $timestamp . $userId;

        // Generate barcode SVG
        $generator = new BarcodeGeneratorSVG();
        $barcodeSvg = $generator->getBarcode($barcodeValue, $generator::TYPE_CODE_128);

        // Save SVG to storage
        $barcodePath = 'barcodes/document_' . $document->id . '_' . $barcodeValue . '.svg';
        Storage::disk('public')->put($barcodePath, $barcodeSvg);
        $barcodePath = 'public/'. $barcodePath;

        // Save to document
        $document->update([
            'barcode_path' => $barcodePath,
            'barcode_value' => $barcodeValue,
        ]);


        // Reload recipients and their users so the activity log can access user info
        $document->load('recipients.department');

        // Log document creation
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'document_created',
            'description' => 'Created document: ' . $document->subject . ' (ID: ' . $document->id . ')',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'action' => 'document_sent',
            'description' => 'Sent document: ' . $document->subject . ' to ' . $document->recipients->map(function($recipient) {
                $dept = $recipient->department ? $recipient->department->name : 'No Department';
                return $dept;
            })->implode(', '),
            'created_at' => now(),
        ]);

        // Handle multiple file uploads
        foreach ($request->file('files') as $file) {
            $filePath = $file->store('documents', 'public');
            $document->files()->create([
                'file_path' => 'public/'. $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
                'upload_type' => 'original',
            ]);
        }

        // Notify the document owner
        $document->owner->notify(new InAppNotification('Your document has been created and sent.', ['document_id' => $document->id, 'document_name' => $document->subject]));
        // Notify all initial recipients
        if ($validated['document_type'] === 'for_info') {
            foreach ($validated['recipient_ids'] as $recipientDeptId) {
                $recipient = User::where('department_id', $recipientDeptId)->where('role', 'admin')->first();
                if ($recipient) {
                    $recipient->notify(new InAppNotification('A new document has been sent to your department.', ['document_id' => $document->id, 'document_name' => $document->subject]));
                }
            }
        } else {
            // For memorandum, order, special_order documents
            $sendToDeptId = $request->input('recipient_ids')[0];
            $throughDeptIds = $request->input('through_department_ids', []);

            if (!empty($throughDeptIds)) {
                // If there are through departments, notify only the first through department's admin
                $firstThroughDeptAdmin = User::where('department_id', $throughDeptIds[0])->where('role', 'admin')->first();
                if ($firstThroughDeptAdmin) {
                    $firstThroughDeptAdmin->notify(new InAppNotification('A new document has been sent to your department.', ['document_id' => $document->id, 'document_name' => $document->subject]));
                }
            } else {
                // If no through departments, notify the main recipient department's admin
                $recipient = User::where('department_id', $sendToDeptId)->where('role', 'admin')->first();
                if ($recipient) {
                    $recipient->notify(new InAppNotification('A new document has been sent to your department.', ['document_id' => $document->id, 'document_name' => $document->subject]));
                }
            }
        }

        // Log the document sent
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'document_sent',
            'description' => 'Document sent to departments: ' . $document->recipients->pluck('department_id')->implode(', '),
        ]);

        return redirect()->route('users.documents')->with('success', 'Document sent successfully.');

        } catch (\Throwable $th) {
            return back()->withErrors([
                'message' => $th->getMessage(),
            ]);
        }
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
        $doc = Document::where('id', $document)
            ->where('owner_id', Auth::id())
            ->where('status', 'returned')
            ->with(['files', 'recipients.department'])
            ->firstOrFail();

        // Get all departments that were originally involved in the document
        $involvedDepartments = collect();

        // include final recipient department from DocumentRecipient records
        $finalRecipientRecord = $doc->recipients()->whereNotNull('final_recipient_department_id')->first();
        if ($finalRecipientRecord && $finalRecipientRecord->final_recipient_department_id) {
            $finalRecipientDepartment = Departments::find($finalRecipientRecord->final_recipient_department_id);
            if ($finalRecipientDepartment) {
                $involvedDepartments->push([
                    'id' => $finalRecipientDepartment->id,
                    'name' => $finalRecipientDepartment->name,
                    'type' => 'sent_to'
                ]);
            }
        }

        foreach ($doc->recipients as $recipient) {
            if ($recipient->department) {
                $involvedDepartments->push([
                    'id' => $recipient->department->id,
                    'name' => $recipient->department->name,
                    'type' => 'sent_through'
                ]);
            }
        }

        // Add departments from through_department_ids (sent through)
        if ($doc->through_department_ids) {
            $throughDepartments = Departments::whereIn('id', $doc->through_department_ids)->get();
            foreach ($throughDepartments as $dept) {
                $involvedDepartments->push([
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'type' => 'sent_through'
                ]);
            }
        }

        // Remove duplicates and sort by name
        $involvedDepartments = $involvedDepartments->unique('id')->sortBy('name')->values();

        return Inertia::render('Users/EditDocument', [
            'document' => $doc,
            'involvedDepartments' => $involvedDepartments
        ]);
    }

    public function updateDocument(Request $request, $document)
    {
        $doc = Document::where('id', $document)
            ->where('owner_id', Auth::id())
            ->where('status', 'returned')
            ->firstOrFail();

        //
        $doc->update([
            'status' => 'pending',
        ]);

        // Check if this is the President's office (OP)
        $department = $doc->department;
        $isPresidentOffice = $department && $department->code === 'OP';

        // Define validation rules based on department type
        // $orderNumberRule = 'required|string|max:255';
        $orderNumberRule = ['required', 'string', 'max:255'];
        // In updateDocument, skip the current document's id
        $currentYear = now()->year;
        if ($isPresidentOffice) {
            $orderNumberRule[] = function ($attribute, $value, $fail) use ($doc, $currentYear) {
                $exists = Document::where('department_id', $doc->department_id)
                    ->where('document_type', $doc->document_type)
                    ->where('order_number', $value)
                    ->whereYear('created_at', $currentYear)
                    ->where('id', '!=', $doc->id)
                    ->exists();
                if ($exists) {
                    $fail('The order number has already been taken for this department and document type in the current fiscal year.');
                }
            };
        } else {
            $orderNumberRule[] = function ($attribute, $value, $fail) use ($doc, $currentYear) {
                $exists = Document::where('department_id', $doc->department_id)
                    ->where('order_number', $value)
                    ->whereYear('created_at', $currentYear)
                    ->where('id', '!=', $doc->id)
                    ->exists();
                if ($exists) {
                    $fail('The order number has already been taken for this department in the current fiscal year.');
                }
            };
        }

        $validated = $request->validate([
            'order_number' => $orderNumberRule,
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'selected_department_id' => 'required|exists:departments,id',
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|max:10240', // 10MB max per file
        ]);

        $doc->order_number = $validated['order_number'];
        $doc->subject = $validated['subject'];
        $doc->description = $validated['description'] ?? '';
        $doc->status = 'pending'; // Reset status so it can be resent
        $doc->save();

        // Log document update
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'document_updated',
            'description' => 'Updated document: ' . $doc->subject . ' (ID: ' . $doc->id . ')',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        // Handle file uploads (optional: delete old files if needed)
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filePath = $file->store('documents', 'public');
                $doc->files()->create([
                    'file_path' => 'public/'. $filePath,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id(),
                    'upload_type' => 'original',
                ]);
            }
        }

        // set the previous chain to received
        $lastRecipient = $doc->recipients()->orderByDesc('sequence')->first();
        if ($lastRecipient) {
            // Set the previous recipient's status to 'received' (not pending)
            $lastRecipient->status = 'returned';
            $lastRecipient->save();
        }

        // get the final recipient department id where document id is the same as the current document
        $finalRecipientDepartmentId = DocumentRecipient::where('document_id', $doc->id)->whereNotNull('final_recipient_department_id')->first()->final_recipient_department_id;

        // Create new recipient record for the selected department
        DocumentRecipient::create([
            'document_id' => $doc->id,
            'department_id' => $validated['selected_department_id'],
            'final_recipient_department_id' => $finalRecipientDepartmentId,
            'status' => 'pending',
            'sequence' => $doc->recipients()->max('sequence') + 1,
            'is_active' => true,
            'forwarded_by' => null,
            'comments' => 'Document resent by owner to selected department.',
        ]);

        // new document log
        DocumentActivityLog::create([
            'document_id' => $doc->id,
            'user_id' => Auth::id(),
            'action' => 'document_resent',
            'description' => 'Document resent by owner.',
        ]);

        return redirect()->route('users.documents', $doc->id)->with('success', 'Document updated and resent successfully.');
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

        // Check if trying to update to receiver role and if one already exists for this department
        if ($request->role === 'receiver' && $user->role !== 'receiver') {
            $existingReceiver = User::where('department_id', Auth::user()->department_id)
                ->where('role', 'receiver')
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingReceiver) {
                return back()->withErrors([
                    'role' => 'A receiver already exists for this department.'
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

        // Notify the user and all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new InAppNotification('A user has been updated.', ['user_id' => $user->id]));
        }
        $user->notify(new InAppNotification('Your account has been updated.', ['user_id' => $user->id]));

        // Log user update
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'user_updated',
            'description' => 'Updated user: ' . $user->email,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('users.departments');
    }

    // Dashboard Data for User
    public function dashboardData()
    {
        $userId = Auth::id();
        // Fetch as collections
        $ownedDocuments = Document::where('owner_id', $userId)->get();
        $receivedDocuments = Document::whereHas('recipients', function($query) use ($userId) {
            $query->where('department_id', $userId);
        })->get();

        // Merge collections and remove duplicates (if any)
        $allDocuments = $ownedDocuments->merge($receivedDocuments)->unique('id');

        $totalDocuments = $allDocuments->count();
        $pendingDocuments = $allDocuments->where('status', 'pending')->count();
        $completedDocuments = $allDocuments->where('status', 'approved')->count();

        // Count published documents where user is owner or recipient
        $publishedDocuments = $allDocuments->where('is_public', true)->count();

        // Recent Activities: last 5 actions involving the user (owned or received)
        $recentActivities = DocumentRecipient::where('department_id', $userId)
            ->orderByDesc('responded_at')
            ->with('document')
            ->take(5)
            ->get()
            ->map(function($activity) {
                return [
                    'order_number' => $activity->document->order_number,
                    'subject' => $activity->document->subject ?? 'Untitled',
                    'status' => $activity->status,
                    'responded_at' => $activity->responded_at,
                    'created_at' => $activity->document->created_at,
                    'comments' => $activity->comments,
                ];
            });

        return response()->json([
            'totalDocuments' => $totalDocuments,
            'pendingDocuments' => $pendingDocuments,
            'completedDocuments' => $completedDocuments,
            'publishedDocuments' => $publishedDocuments,
            'recentActivities' => $recentActivities,
        ]);
    }

    // User's Published Documents Management
    public function publishedDocuments()
    {
        $userId = Auth::id();

        // Get documents where user is the owner
        $ownedDocuments = Document::where('owner_id', $userId)
            ->where('is_public', true)
            ->with(['files', 'owner'])
            ->get()
            ->map(function($document) {
                return [
                    'id' => $document->id,
                    'subject' => $document->subject,
                    'description' => $document->description,
                    'status' => $document->status,
                    'is_public' => $document->is_public,
                    'public_token' => $document->public_token,
                    'barcode_path' => $document->barcode_path,
                    'barcode_value' => $document->barcode_value,
                    'created_at' => $document->created_at,
                    'files_count' => $document->files->count(),
                    'public_url' => route('documents.public_view', ['public_token' => $document->public_token]),
                    'user_role' => 'owner',
                    'owner_name' => $document->owner->first_name . ' ' . $document->owner->last_name,
                ];
            });

        // Get documents where user is a recipient
        $receivedDocuments = Document::whereHas('recipients', function($query) use ($userId) {
            $query->where('department_id', $userId);
        })
        ->where('is_public', true)
        ->where('owner_id', '!=', $userId) // Exclude documents where user is also the owner
        ->with(['files', 'owner'])
        ->get()
        ->map(function($document) {
            return [
                'id' => $document->id,
                'subject' => $document->subject,
                'description' => $document->description,
                'status' => $document->status,
                'is_public' => $document->is_public,
                'public_token' => $document->public_token,
                'barcode_path' => $document->barcode_path,
                'barcode_value' => $document->barcode_value,
                'created_at' => $document->created_at,
                'files_count' => $document->files->count(),
                'public_url' => route('documents.public_view', ['public_token' => $document->public_token]),
                'user_role' => 'recipient',
                'owner_name' => $document->owner->first_name . ' ' . $document->owner->last_name,
            ];
        });

        // Merge and sort by creation date
        $publishedDocuments = $ownedDocuments->concat($receivedDocuments)
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('Users/PublishedDocuments', [
            'publishedDocuments' => $publishedDocuments,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    // Unpublish document (user can only unpublish their own documents)
    public function unpublishDocument(Document $document)
    {
        // Check if the user owns this document
        if ($document->owner_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $document->update([
            'is_public' => false,
            'public_token' => null,
            'barcode_path' => null,
            'barcode_value' => null,
        ]);

        return redirect()->route('users.published-documents')->with('success', 'Document unpublished successfully.');
    }

    public function deleteDocumentFile($document, $file)
    {
        $doc = Document::where('id', $document)
            ->where('owner_id', Auth::id())
            ->where('status', 'returned')
            ->firstOrFail();
        $fileModel = $doc->files()->where('id', $file)->firstOrFail();
        // Delete the physical file
        if ($fileModel->file_path) {
            Storage::disk('public')->delete($fileModel->file_path);
        }
        $fileModel->delete();
        return redirect()->route('users.documents.edit', $doc->id)->with('success', 'File deleted successfully.');
    }

    // Confirm document receipt via barcode
    public function confirmReceipt(Request $request)
    {
        $request->validate([
            'barcode_value' => 'required|string',
        ]);

        $barcode = $request->input('barcode_value');
        $user = Auth::user();
        $departmentId = $user->department_id;

        // Find the document by barcode
        $document = Document::where('barcode_value', $barcode)->first();
        if (!$document) {
            throw ValidationException::withMessages([
                'barcode_value' => ['Invalid barcode. Document not found.']
            ]);
        }

        // Find the recipient record for this department
        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where('department_id', $departmentId)
            ->where('status', 'pending')
            ->first();
        if (!$recipient) {
            throw ValidationException::withMessages([
                'barcode_value' => ['Your department is not a recipient for this document.']
            ]);
        }

        // update the document status to received
        $document->status = 'in_review';
        $document->save();

        // Mark as received
        $recipient->status = 'received';
        $recipient->responded_at = now();
        $recipient->save();

        // Log the action
        UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'document_received',
            'description' => 'Confirmed receipt of document: ' . $document->subject . ' (ID: ' . $document->id . ') via barcode.',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'action' => 'document_received',
            'description' => 'Document received by department: ' . ($user->department->name ?? 'Unknown') . ' via barcode.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document successfully marked as received.');
    }
}
