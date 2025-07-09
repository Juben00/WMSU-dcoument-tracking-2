<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Document;
use App\Models\User;

class DocumentActivityLog extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'action',
        'description',
        'created_at',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
