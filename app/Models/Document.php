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
        'title',
        'status',
        'description'
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
}
