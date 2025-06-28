<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departments extends Model
{
    /** @use HasFactory<\Database\Factories\OfficeFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'department_id');
    }
}
