<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\DocumentFile;

class Document extends Model
{
    use HasFactory;

    protected $table = 'documents';

    protected $fillable = [
        'owner_id',
        'department_id',
        'subject',
        'order_number',
        'document_type',
        'status',
        'description',
        'through_department_ids',
        'is_public',
        'public_token',
        'barcode_path',
        'barcode_value',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'through_department_ids' => 'array',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(DocumentFile::class);
    }

    public function department()
    {
        return $this->belongsTo(Departments::class, 'department_id');
    }

    /**
     * Get the display name for the document type
     */
    public function getDocumentTypeDisplayName(): string
    {
        return match($this->document_type) {
            'special_order' => 'Special Order',
            'order' => 'Order',
            'memorandum' => 'Memorandum',
            'for_info' => 'For Info',
            default => 'Unknown'
        };
    }

    /**
     * Get all available document types
     */
    public static function getDocumentTypes(): array
    {
        return [
            'special_order' => 'Special Order',
            'order' => 'Order',
            'memorandum' => 'Memorandum',
            'for_info' => 'For Info',
        ];
    }
}
