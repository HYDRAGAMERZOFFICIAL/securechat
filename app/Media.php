<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'user_id',
        'chat_id',
        'file_path',
        'original_name',
        'mime_type',
        'size'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
