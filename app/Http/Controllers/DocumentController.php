<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\User;
use App\Models\DocumentFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Illuminate\Support\Str;
use App\Models\Departments;
use App\Notifications\InAppNotification;
use App\Models\UserActivityLog;
use App\Models\DocumentActivityLog;
use Illuminate\Notifications\DatabaseNotification;

class DocumentController extends Controller
{

    public function forwardDocument(Request $request, Document $document)
    {
        $request->validate([
            'forward_to_id' => 'required|exists:users,id',
            'comments' => 'nullable|string|max:1000',
            'files.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif', // 10MB max per file
        ]);

        // Find the current active recipient (the one forwarding)
        $currentRecipient = DocumentRecipient::where('document_id', $document->id)
            ->where('is_active', true)
            ->orderByDesc('sequence')
            ->first();

        if ($currentRecipient) {
            // Mark the current recipient as responded/forwarded and inactive
            $currentRecipient->update([
                'status' => 'received',
                'responded_at' => now(),
                'is_active' => false,
            ]);
        }

        // find the id of the user who forwarded the document
        $forwardedById = Auth::id();

        // Get the final_recipient_id from existing recipient records
        $existingRecipient = DocumentRecipient::where('document_id', $document->id)
            ->whereNotNull('final_recipient_id')
            ->first();
        $finalRecipientId = $existingRecipient ? $existingRecipient->final_recipient_id : null;

        // Determine the next sequence number
        $nextSequence = DocumentRecipient::where('document_id', $document->id)->max('sequence') + 1;

        DocumentRecipient::create([
            'document_id' => $document->id,
            'user_id' => $request->forward_to_id,
            'forwarded_by' => $forwardedById,
            'status' => 'pending',
            'comments' => $request->comments,
            'sequence' => $nextSequence,
            'is_active' => true,
            'is_final_approver' => User::find($request->forward_to_id)->role === 'admin' ? true : false,
            'final_recipient_id' => $finalRecipientId,
            'responded_at' => null
        ]);

        // Get the newly created recipient (the one just forwarded to)
        $newRecipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', $request->forward_to_id)
            ->where('sequence', $nextSequence)
            ->first();

        // Handle multiple file uploads if present
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filePath = $file->store('documents', 'public');
                $document->files()->create([
                    'file_path' => $filePath,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id(),
                    'upload_type' => 'response',
                    'document_recipient_id' => $newRecipient ? $newRecipient->id : null,
                ]);
            }
        }

        // check if all of the recipients have received the document and if the document is for_info then update the document status to received
        $allRecipients = DocumentRecipient::where('document_id', $document->id)->get();
        $allReceived = $allRecipients->every(function($recipient) {
            return $recipient->status === 'received';
        });
        if ($allReceived && $document->document_type === 'for_info') {
            $document->update(['status' => 'received']);
        }

        // Notify the new recipient and document owner
        $forwardedTo = User::find($request->forward_to_id);
        if ($forwardedTo) {
            $forwardedTo->notify(new InAppNotification('A document has been forwarded to you.', ['document_id' => $document->id, 'document_name' => $document->subject]));
        }
        $document->owner->notify(new InAppNotification('Your document has been forwarded.', ['document_id' => $document->id, 'document_name' => $document->subject]));

        // After forwarding document
        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'action' => 'forwarded',
            'description' => 'Document forwarded to user ID: ' . $request->forward_to_id,
            'created_at' => now(),
        ]);

        return redirect()->route('documents.view', $document->id)->with('success', 'Document forwarded successfully');
    }

    public function respondToDocument(Request $request, Document $document)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,returned',
            'comments' => 'nullable|string|max:1000',
            'attachment_files.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif', // 10MB max per file
            'is_final_approver' => 'boolean'
        ]);

        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where(function ($query) {
                $query->where('user_id', Auth::id())
                    ->orWhere('final_recipient_id', Auth::id());
            })
            ->whereIn('status', ['pending', 'forwarded'])
            ->first();

        if (!$recipient && $request->status !== 'returned') {
            return redirect()->back()->withErrors([
                'message' => 'You are not authorized to approve this document or you have already responded.'
            ]);
        }

        $currentSequence = DocumentRecipient::where('document_id', $document->id)->max('sequence');

        // Mark the current sequence to received
        $currentSequenceRecipient = DocumentRecipient::where('document_id', $document->id)->where('sequence', $currentSequence)->first();
        $currentSequenceRecipient?->update([
            'status' => 'received',
            'responded_at' => now(),
            'is_active' => false,
        ]);

        $isFinalApprover = $currentSequenceRecipient ? $currentSequenceRecipient->is_final_approver : false;

        // Create a new recipient record for the response
        $newRecipient = DocumentRecipient::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'forwarded_by' => null,
            'status' => $request->status,
            'comments' => $request->comments,
            'responded_at' => now(),
            'is_active' => false,
            'sequence' => $currentSequence + 1,
            'is_final_approver' => $recipient ? $recipient->is_final_approver : false,
            'final_recipient_id' => $recipient ? $recipient->final_recipient_id : null,
        ]);

        // Handle multiple file uploads if present
        if ($request->hasFile('attachment_files')) {
            foreach ($request->file('attachment_files') as $file) {
                $filePath = $file->store('documents', 'public');
                $document->files()->create([
                    'file_path' => $filePath,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => Auth::id(),
                    'upload_type' => 'response',
                    'document_recipient_id' => $newRecipient ? $newRecipient->id : null,
                ]);
            }
        }

        // Update document status based on all recipients' responses
        $allRecipients = DocumentRecipient::where('document_id', $document->id)->get();
        $totalRecipients = $allRecipients->count();
        $approvedCount = $allRecipients->where('status', 'approved')->count();
        $rejectedCount = $allRecipients->where('status', 'rejected')->count();
        $returnedCount = $allRecipients->where('status', 'returned')->count();
        $pendingCount = $allRecipients->whereIn('status', ['pending', 'forwarded'])->count();

        if ($rejectedCount > 0) {
            $document->update(['status' => 'rejected']);
            // Notify owner and recipients
            $document->owner->notify(new InAppNotification('Your document was rejected.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            foreach ($allRecipients as $rec) {
                $rec->user->notify(new InAppNotification('A document you are involved in was rejected.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            }
        } elseif ($returnedCount > 0) {
            $document->update(['status' => 'returned']);
            $document->owner->notify(new InAppNotification('Your document was returned.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            foreach ($allRecipients as $rec) {
                $rec->user->notify(new InAppNotification('A document you are involved in was returned.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            }
        } elseif ($pendingCount === 0 && $approvedCount === $totalRecipients) {
            $document->update(['status' => 'approved']);
            $document->owner->notify(new InAppNotification('Your document was approved.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            foreach ($allRecipients as $rec) {
                $rec->user->notify(new InAppNotification('A document you are involved in was approved.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            }
        } elseif ($pendingCount > 0) {
            $document->update(['status' => 'in_review']);
        } else {
            $document->update(['status' => 'in_review']);
        }

        // If the final approver responds, update document status accordingly
        if ($isFinalApprover && $request->status === 'approved') {
            $document->update(['status' => 'approved']);
            $document->owner->notify(new InAppNotification('Your document was approved by the final approver.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => Auth::id(),
                'action' => 'approved',
                'description' => 'Document approved by user.',
                'created_at' => now(),
            ]);
        } elseif ($isFinalApprover && $request->status === 'rejected') {
            $document->update(['status' => 'rejected']);
            $document->owner->notify(new InAppNotification('Your document was rejected by the final approver.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => Auth::id(),
                'action' => 'rejected',
                'description' => 'Document rejected by user.',
                'created_at' => now(),
            ]);
        } elseif ($isFinalApprover && $request->status === 'returned') {
            $document->update(['status' => 'returned']);
            $document->owner->notify(new InAppNotification('Your document was returned by the final approver.', ['document_id' => $document->id, 'document_name' => $document->subject]));
            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => Auth::id(),
                'action' => 'returned',
                'description' => 'Document returned by user.',
                'created_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Response recorded successfully');
    }

    public function getDocumentChain(Document $document)
    {
        $chain = DocumentRecipient::where('document_id', $document->id)
            ->with(['user:id,name,email', 'forwardedBy:id,name,email'])
            ->orderBy('sequence')
            ->get();

        return response()->json([
            'document' => $document,
            'approval_chain' => $chain
        ]);
    }

    public function viewDocument(Document $document)
    {
        // Check if user has access to the document
        if ($document->owner_id !== Auth::id() && !$document->recipients()->where('user_id', Auth::id())->exists()) {
            abort(403, 'Unauthorized access to document');
        }

        $document->load(['files', 'owner.department', 'recipients.user', 'recipients.forwardedBy', 'recipients.finalRecipient']);

        // Get users from the same department as the current user, excluding the current user
        $users = User::where('department_id', Auth::user()->department_id)
            ->where('id', '!=', Auth::id())
            ->with('department')
            ->get();

        // Initialize throughUsers as empty collection
        $throughUsers = collect();

        // Ensure all users in through_user_ids are included
        $throughUserIds = $document->through_user_ids ?? [];

        if (!empty($throughUserIds)) {
            $throughUsers = User::whereIn('id', $throughUserIds)->with('department')->get();
            // Merge and remove duplicates by id
            // $users = $users->merge($throughUsers)->unique('id')->values();
        }

        // Get users from other departments (excluding current user's department and current user and the document owner), prioritizing 'receiver' or 'admin' roles
        $otherDepartments = Departments::where('id', '!=', Auth::user()->department_id)->get();
        $otherOfficeUsers = collect();
        foreach ($otherDepartments as $department) {
            $receiver = $department->users()->where('role', 'receiver')->where('id', '!=', Auth::id())->where('id', '!=', $document->owner_id)->with('department')->first();
            if ($receiver) {
                $otherOfficeUsers->push($receiver);
            } else {
                $admin = $department->users()->where('role', 'admin')->where('id', '!=', Auth::id())->where('id', '!=', $document->owner_id)->with('department')->first();
                if ($admin) {
                    $otherOfficeUsers->push($admin);
                }
            }
        }

        // Add is_final_approver to the document data
        $documentData = $document->toArray();
        $documentData['owner_id'] = $document->owner_id;

        // Approval chain: recipients ordered by sequence, with user and forwardedBy
        $approvalChain = $document->recipients()->with(['user.department', 'forwardedBy.department', 'finalRecipient.department'])->orderBy('sequence')->get()->map(function($recipient) {
            return [
                'id' => $recipient->id,
                'user' => $recipient->user,
                'status' => $recipient->status,
                'comments' => $recipient->comments,
                'responded_at' => $recipient->responded_at,
                'sequence' => $recipient->sequence,
                'forwarded_by' => $recipient->forwardedBy,
                'is_final_approver' => $recipient->is_final_approver,
                'final_recipient' => $recipient->finalRecipient,
            ];
        });
        $documentData['approval_chain'] = $approvalChain;

        // Get the final recipient information from the first recipient record
        $firstRecipient = $document->recipients()->with('finalRecipient.department')->first();
        $documentData['final_recipient'] = $firstRecipient ? $firstRecipient->finalRecipient : null;

        // Check if current user is a recipient and can respond, get the latest data
        $currentRecipient = $document->recipients()
            ->where('user_id', Auth::id())
            ->orderByDesc('sequence')
            ->first();

        $documentData['can_respond'] = $currentRecipient && in_array($currentRecipient->status, ['pending', 'forwarded', ]);
        $documentData['can_respond_other_data'] = $currentRecipient;
        $documentData['is_final_approver'] = $currentRecipient ? $currentRecipient->is_final_approver : false;
        $documentData['recipient_status'] = $currentRecipient ? $currentRecipient->status : null;

        // Fetch document activity logs
        $activityLogs = DocumentActivityLog::with('user')
            ->where('document_id', $document->id)
            ->get();

        return Inertia::render('Users/Documents/View', [
            'document' => $documentData,
            'auth' => [
                'user' => Auth::user()
            ],
            'users' => $users,
            'otherDepartmentUsers' => $otherOfficeUsers,
            'throughUsers' => $throughUsers,
            'activityLogs' => $activityLogs,
        ]);
    }

    public function markAsReceived(Document $document)
    {
        $documentRecipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->orderByDesc('sequence')
            ->first();
        $documentRecipient->update(['status' => 'received']);
        $documentRecipient->update(['responded_at' => now()]);

        // Check if all recipients have received the document and if the document is for_info, then update the document status to received
        $allRecipients = DocumentRecipient::where('document_id', $document->id)->get();
        $allReceived = $allRecipients->every(function($recipient) {
            return $recipient->status === 'received';
        });
        if ($allReceived && $document->document_type === 'for_info') {
            $document->update(['status' => 'received']);
        } else {
            $document->update(['status' => 'in_review']);
        }

        return redirect()->back()->with('success', 'Document marked as received.');
    }

    public function downloadDocument(Document $document, DocumentFile $file)
    {
        // Debug: Log the request
        Log::info('Download request', [
            'user_id' => Auth::id(),
            'document_id' => $document->id,
            'file_id' => $file->id,
            'authenticated' => Auth::check()
        ]);

        // Check if user is authenticated
        if (!Auth::check()) {
            Log::warning('User not authenticated for download');
            abort(401, 'Authentication required');
        }

        // Check if user has access to the document
        if ($document->owner_id !== Auth::id() && !$document->recipients()->where('user_id', Auth::id())->exists()) {
            Log::warning('User not authorized for document', [
                'user_id' => Auth::id(),
                'document_owner_id' => $document->owner_id,
                'is_recipient' => $document->recipients()->where('user_id', Auth::id())->exists()
            ]);
            abort(403, 'Unauthorized access to document');
        }

        // Check if file belongs to the document
        if ($file->document_id !== $document->id) {
            Log::warning('File does not belong to document', [
                'file_document_id' => $file->document_id,
                'requested_document_id' => $document->id
            ]);
            abort(404, 'File not found');
        }

        // Check if file exists in storage
        if (!Storage::disk('public')->exists($file->file_path)) {
            Log::warning('File not found in storage', [
                'file_path' => $file->file_path
            ]);
            abort(404, 'File not found in storage');
        }

        // Get the full path to the file
        $path = Storage::disk('public')->path($file->file_path);

        Log::info('File download successful', [
            'file_path' => $file->file_path,
            'original_filename' => $file->original_filename,
            'mime_type' => $file->mime_type
        ]);

        // Return the file as a download response
        return response()->download(
            $path,
            $file->original_filename,
            ['Content-Type' => $file->mime_type]
        );
    }

    public function publishDocument(Request $request, Document $document)
    {
        // Only owner can publish, and only if approved
        if ($document->owner_id !== Auth::id()) {
            abort(403, 'Only the owner can publish this document.');
        }
        if ($document->status !== 'approved' && $document->status !== 'received') {
            abort(403, 'Document must be approved before publishing.');
        }
        if ($document->is_public) {
            return redirect()->back()->with('info', 'Document is already public.');
        }

        // Generate unique public token
        $publicToken = Str::random(32);
        // Generate public URL
        $publicUrl = route('documents.public_view', ['public_token' => $publicToken], false);

        // No barcode generation here; it is now done when the document is sent

        // Update document
        $document->update([
            'is_public' => true,
            'public_token' => $publicToken,
        ]);

        // Notify the document owner
        $document->owner->notify(new InAppNotification('Your document has been published publicly.', ['document_id' => $document->id, 'document_name' => $document->subject]));

        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'action' => 'published',
            'description' => 'Document published publicly.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document published publicly.');
    }

    public function publicView($public_token)
    {
        $document = Document::where(function($query) use ($public_token) {
            $query->where('public_token', $public_token)
                  ->orWhere('barcode_value', $public_token);
        })
        ->where('is_public', true)
        ->with(['files', 'owner', 'recipients.user.department'])
        ->first();

        if (!$document) {
            // If no document found, show the search page
            return Inertia::render('Users/Documents/PublicSearch', [
                'searchToken' => $public_token,
            ]);
        }

        $documentData = $document->toArray();
        $documentData['owner_id'] = $document->owner_id;

        // You may want to return a special Inertia/Blade view for public documents
        return Inertia::render('Users/Documents/PublicView', [
            'document' => $documentData,
        ]);
    }

    public function publicDocuments()
    {
        $search = request()->get('search');

        $query = Document::where('is_public', true)
            ->with(['files', 'owner', 'recipients.user.department']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('subject', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('barcode_value', 'like', '%' . $search . '%')
                  ->orWhere('public_token', 'like', '%' . $search . '%')
                  ->orWhereHas('owner', function($ownerQuery) use ($search) {
                      $ownerQuery->where('first_name', 'like', '%' . $search . '%')
                                ->orWhere('last_name', 'like', '%' . $search . '%');
                  });
            });
        }

        $documents = $query->orderByDesc('created_at')
            ->get()
            ->map(function($document) {
                return [
                    'id' => $document->id,
                    'order_number' => $document->order_number,
                    'subject' => $document->subject,
                    'description' => $document->description,
                    'status' => $document->status,
                    'is_public' => $document->is_public,
                    'public_token' => $document->public_token,
                    'barcode_path' => $document->barcode_path,
                    'barcode_value' => $document->barcode_value,
                    'created_at' => $document->created_at,
                    'owner' => [
                        'id' => $document->owner->id,
                        'name' => $document->owner->first_name . ' ' . $document->owner->last_name,
                        'email' => $document->owner->email,
                        'department' => $document->owner->department->name ?? 'No Department',
                    ],
                    'files_count' => $document->files->count(),
                    'public_url' => route('documents.public_view', ['public_token' => $document->public_token]),
                ];
            });

        return Inertia::render('Users/Documents/PublicSearch', [
            'documents' => $documents,
            'search' => $search,
        ]);
    }

    public function destroy(Document $document)
    {
        // Delete physical files from storage
        foreach ($document->files as $file) {
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }
        }

        // Delete barcode file if exists
        if ($document->barcode_path && Storage::disk('public')->exists($document->barcode_path)) {
            Storage::disk('public')->delete($document->barcode_path);
        }

        // Delete notifications related to this document
        // Get all users involved with this document (owner and recipients)
        $involvedUserIds = collect([$document->owner_id])
            ->merge($document->recipients->pluck('user_id'))
            ->unique();

                // Delete notifications for all involved users that reference this document
        foreach ($involvedUserIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                // Delete notifications that contain this document_id in their data
                $deletedCount = $user->notifications()
                    ->whereRaw("JSON_EXTRACT(data, '$.data.document_id') = ?", [$document->id])
                    ->delete();
            }
        }

        // Also delete any notifications for all users that might reference this document
        // This is a fallback to catch any notifications that might have been missed
        $totalDeleted = DatabaseNotification::whereRaw("JSON_EXTRACT(data, '$.data.document_id') = ?", [$document->id])->delete();

        if ($totalDeleted > 0) {
            Log::info('Deleted additional notifications for document', [
                'document_id' => $document->id,
                'total_deleted' => $totalDeleted
            ]);
        }

        // Delete the document (this will cascade delete files and recipients)
        $document->delete();

        // Log document deletion (history)
        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'action' => 'deleted',
            'description' => 'Document deleted by user.',
            'created_at' => now(),
        ]);

        // Log document deletion
        UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'document_deleted',
            'description' => 'Deleted document: ' . $document->subject . ' (ID: ' . $document->id . ')',
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('users.documents')->with('success', 'Document deleted successfully.');
    }

    public function unpublishDocument(Document $document)
    {
        // Only owner can unpublish
        if ($document->owner_id !== Auth::id()) {
            abort(403, 'Only the owner can unpublish this document.');
        }

        if (!$document->is_public) {
            return redirect()->back()->with('info', 'Document is not published.');
        }

        // Update document
        $document->update([
            'is_public' => false,
            'public_token' => null,
        ]);

        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'action' => 'unpublished',
            'description' => 'Document unpublished.',
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document unpublished successfully.');
    }
}
