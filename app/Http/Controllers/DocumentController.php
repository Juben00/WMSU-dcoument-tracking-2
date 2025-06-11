<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\DocumentRevision;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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
            'revision_file' => 'required_if:status,returned|file|max:10240'
        ]);

        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->where('is_active', true)
            ->firstOrFail();

        if ($request->status === 'returned') {
            // Handle file upload for revision
            $filePath = $request->file('revision_file')->store('document-revisions');

            // Create a new revision
            DocumentRevision::create([
                'document_id' => $document->id,
                'user_id' => Auth::id(),
                'file_path' => $filePath,
                'comments' => $request->comments,
                'version' => DocumentRevision::where('document_id', $document->id)->count() + 1
            ]);

            $document->update(['status' => 'returned']);
        }

        $recipient->update([
            'status' => $request->status,
            'comments' => $request->comments,
            'responded_at' => now(),
            'is_active' => false
        ]);

        if ($request->status === 'rejected') {
            $document->update(['status' => 'rejected']);
        } elseif ($request->status === 'approved') {
            if ($recipient->is_final_approver) {
                $document->update(['status' => 'approved']);
            }
        }

        return response()->json([
            'message' => 'Response recorded successfully'
        ]);
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
}
