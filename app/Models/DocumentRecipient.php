<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRecipient extends Model
{
    protected $fillable = [
        'user_id',
        'document_id',
        'department_id',
        'final_recipient_department_id',
        'status',
        'comments',
        'responded_at',
        'sequence',
        'forwarded_by',
        'forwarded_to',
        'is_active',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Departments::class, 'department_id');
    }

    public function forwardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'forwarded_by');
    }

    public function forwardedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'forwarded_to');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function finalRecipient(): BelongsTo
    {
        return $this->belongsTo(Departments::class, 'final_recipient_department_id');
    }
}
