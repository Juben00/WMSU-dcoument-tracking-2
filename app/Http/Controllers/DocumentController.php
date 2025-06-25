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
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Writer;
use Illuminate\Support\Str;

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
            'comments' => 'nullable|string|max:1000',
            'files.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png', // 10MB max per file
        ]);

        DocumentRecipient::create([
            'document_id' => $document->id,
            'user_id' => $request->forward_to_id,
            'forwarded_by' => Auth::id(),
            'status' => 'forwarded',
            'comments' => $request->comments,
            'sequence' => DocumentRecipient::where('document_id', $document->id)->max('sequence') + 1,
            'is_active' => true,
            'is_final_approver' => User::find($request->forward_to_id)->role === 'admin' ? true : false,
            'responded_at' => now()
        ]);

        return redirect()->route('documents.view', $document->id)->with('success', 'Document forwarded successfully');
    }

    public function respondToDocument(Request $request, Document $document)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,returned',
            'comments' => 'required|string',
            'attachment_file' => 'nullable|file|max:10240',
            'is_final_approver' => 'boolean'
        ]);

        // Check if user is a recipient and hasn't responded yet
        $recipient = DocumentRecipient::where('document_id', $document->id)
            ->where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'forwarded']) // Allow response if status is pending or forwarded
            ->first();

        if (!$recipient) {
            return redirect()->back()->withErrors([
                'message' => 'You are not authorized to approve this document or you have already responded.'
            ]);
        }

        $fileRecord = null;
        if ($request->hasFile('attachment_file')) {
            $file = $request->file('attachment_file');
            $filePath = $file->store('document-attachments', 'public');
            // Save file info to DocumentFile
            $fileRecord = $document->files()->create([
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
                'upload_type' => 'response',
            ]);
        }

        // Use the recipient's is_final_approver from DB
        $isFinalApprover = $recipient->is_final_approver;

        // Update recipient status
        $recipient->update([
            'status' => $request->status,
            'comments' => $request->comments,
            'responded_at' => now(),
            'is_final_approver' => $isFinalApprover,
        ]);

        // Update document status based on all recipients' responses
        $allRecipients = DocumentRecipient::where('document_id', $document->id)->get();

        // Count responses by status
        $totalRecipients = $allRecipients->count();
        $approvedCount = $allRecipients->where('status', 'approved')->count();
        $rejectedCount = $allRecipients->where('status', 'rejected')->count();
        $returnedCount = $allRecipients->where('status', 'returned')->count();
        $pendingCount = $allRecipients->whereIn('status', ['pending', 'forwarded'])->count();

        // Determine document status based on responses
        if ($rejectedCount > 0) {
            $document->update(['status' => 'rejected']);
        } elseif ($returnedCount > 0) {
            $document->update(['status' => 'returned']);
        } elseif ($pendingCount === 0 && $approvedCount === $totalRecipients) {
            // All recipients have approved
            $document->update(['status' => 'approved']);
        } elseif ($pendingCount > 0) {
            // Some recipients still need to respond
            $document->update(['status' => 'in_review']);
        } else {
            // Mixed responses (some approved, some other statuses)
            $document->update(['status' => 'in_review']);
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

        $document->load(['files', 'owner', 'recipients.user', 'recipients.forwardedBy', 'recipients.finalRecipient']);

        // Get users from the same department as the current user, excluding the current user
        $users = User::where('department_id', Auth::user()->department_id)
            ->where('id', '!=', Auth::id())
            ->get();

        // Add is_final_approver to the document data
        $documentData = $document->toArray();
        $documentData['owner_id'] = $document->owner_id;

        // Approval chain: recipients ordered by sequence, with user and forwardedBy
        $approvalChain = $document->recipients()->with(['user', 'forwardedBy', 'finalRecipient'])->orderBy('sequence')->get()->map(function($recipient) {
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
        $firstRecipient = $document->recipients()->with('finalRecipient')->first();
        $documentData['final_recipient'] = $firstRecipient ? $firstRecipient->finalRecipient : null;

        // Check if current user is a recipient and can respond
        $currentRecipient = $document->recipients()
            ->where('user_id', Auth::id())
            ->first();

        $documentData['can_respond'] = $currentRecipient && in_array($currentRecipient->status, ['pending', 'forwarded']);
        $documentData['is_final_approver'] = $currentRecipient ? $currentRecipient->is_final_approver : false;
        $documentData['recipient_status'] = $currentRecipient ? $currentRecipient->status : null;

        return Inertia::render('Users/Documents/View', [
            'document' => $documentData,
            'auth' => [
                'user' => Auth::user()
            ],
            'users' => $users
        ]);
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
        if ($document->status !== 'approved') {
            abort(403, 'Document must be approved before publishing.');
        }
        if ($document->is_public) {
            return redirect()->back()->with('info', 'Document is already public.');
        }

        // Generate unique public token
        $publicToken = Str::random(32);
        // Generate public URL
        $publicUrl = route('documents.public_view', ['public_token' => $publicToken], false);

        // Generate QR code SVG
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrSvg = $writer->writeString(url($publicUrl));

        // Save SVG to storage
        $barcodePath = 'barcodes/document_' . $document->id . '_' . $publicToken . '.svg';
        Storage::disk('public')->put($barcodePath, $qrSvg);

        // Update document
        $document->update([
            'is_public' => true,
            'public_token' => $publicToken,
            'barcode_path' => $barcodePath,
        ]);

        return redirect()->back()->with('success', 'Document published publicly.');
    }

    public function publicView($public_token)
    {
        $document = Document::where('public_token', $public_token)
            ->where('is_public', true)
            ->with(['files', 'owner', 'recipients.user'])
            ->firstOrFail();

        $documentData = $document->toArray();
        $documentData['owner_id'] = $document->owner_id;

        // You may want to return a special Inertia/Blade view for public documents
        return Inertia::render('Users/Documents/PublicView', [
            'document' => $documentData,
        ]);
    }

    public function destroy(Document $document)
    {
        $document->delete();
        return redirect()->route('users.documents')->with('success', 'Document deleted successfully.');
    }
}
