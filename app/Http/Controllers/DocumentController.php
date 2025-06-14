<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\DocumentRevision;
use App\Models\DocumentFile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function sendToRecipients(Request $request, Document $document)
    {
        $request->validate([
            'recipient_ids' => 'required|array',
            'recipient_ids.*' => 'exists:users,id',
            'initial_recipient_id' => 'required|exists:users,id'
        ]);

        // Create the initial recipient
        DocumentRecipient::create([
            'document_id' => $document->id,
            'user_id' => $request->initial_recipient_id,
            'status' => 'pending',
            'sequence' => 1,
            'is_active' => true
        ]);

        $document->update(['status' => 'pending']);

        return response()->json([
            'message' => 'Document sent to initial recipient successfully'
        ]);
    }

    public function forwardDocument(Request $request, Document $document)
    {
        $request->validate([
            'forward_to_id' => 'required|exists:users,id',
            'comments' => 'required|string',
            'is_final_approver' => 'boolean'
        ]);

        $currentRecipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('is_active', true)
            ->firstOrFail();

        // Check if the user is already a recipient
        $existingRecipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', $request->forward_to_id)
            ->first();

        if ($existingRecipient) {
            return response()->json([
                'message' => 'This user is already in the approval chain'
            ], 400);
        }

        // Update current recipient
        $currentRecipient->update([
            'status' => 'forwarded',
            'comments' => $request->comments,
            'responded_at' => now(),
            'is_active' => false,
            'forwarded_to' => $request->forward_to_id
        ]);

        // Create new recipient
        DocumentRecipient::create([
            'document_id' => $document->id,
            'user_id' => $request->forward_to_id,
            'status' => 'pending',
            'sequence' => $currentRecipient->sequence + 1,
            'is_active' => true,
            'forwarded_by' => Auth::id(),
            'is_final_approver' => $request->is_final_approver ?? false
        ]);

        return response()->json([
            'message' => 'Document forwarded successfully'
        ]);
    }

    public function respondToDocument(Request $request, Document $document)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,returned',
            'comments' => 'required|string',
            'attachment_file' => 'nullable|file|max:10240'
        ]);

        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('is_active', true)
            ->firstOrFail();

        // Handle file upload if provided
        if ($request->hasFile('attachment_file')) {
            $filePath = $request->file('attachment_file')->store('document-attachments');

            // Create a new document file record
            DocumentFile::create([
                'document_id' => $document->id,
                'file_path' => $filePath,
                'original_filename' => $request->file('attachment_file')->getClientOriginalName(),
                'mime_type' => $request->file('attachment_file')->getMimeType(),
                'file_size' => $request->file('attachment_file')->getSize()
            ]);
        }

        // Update recipient status
        $recipient->update([
            'status' => $request->status,
            'comments' => $request->comments,
            'responded_at' => now(),
            'is_active' => false
        ]);

        // Update document status based on response
        switch ($request->status) {
            case 'approved':
                if ($recipient->is_final_approver) {
                    $document->update(['status' => 'approved']);
                }
                break;
            case 'rejected':
                $document->update(['status' => 'rejected']);
                break;
            case 'returned':
                $document->update(['status' => 'returned']);
                break;
        }

        return back()->with('success', 'Response recorded successfully');
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

        $document->load(['files', 'owner', 'recipients.user']);

        return Inertia::render('Users/Documents/View', [
            'document' => $document,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function downloadDocument(Document $document, DocumentFile $file)
    {
        // Check if user has access to the document
        if ($document->owner_id !== Auth::id() && !$document->recipients()->where('user_id', Auth::id())->exists()) {
            abort(403, 'Unauthorized access to document');
        }

        // Check if file belongs to the document
        if ($file->document_id !== $document->id) {
            abort(404, 'File not found');
        }

        try {
            // Get the full path to the file
            $filePath = storage_path('app/public/' . $file->file_path);

            // Log the file path for debugging
            Log::info('Attempting to download file', [
                'file_path' => $filePath,
                'original_filename' => $file->original_filename,
                'document_id' => $document->id,
                'file_id' => $file->id
            ]);

            // Check if file exists
            if (!file_exists($filePath)) {
                Log::error('File not found at path', [
                    'file_path' => $filePath,
                    'original_filename' => $file->original_filename
                ]);
                abort(404, 'File not found in storage');
            }

            // Return the file download response
            return response()->download(
                $filePath,
                $file->original_filename,
                [
                    'Content-Type' => $file->mime_type,
                    'Content-Disposition' => 'attachment; filename="' . $file->original_filename . '"'
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error downloading file', [
                'error' => $e->getMessage(),
                'file_path' => $filePath ?? null,
                'original_filename' => $file->original_filename
            ]);
            abort(500, 'Error downloading file: ' . $e->getMessage());
        }
    }
}
