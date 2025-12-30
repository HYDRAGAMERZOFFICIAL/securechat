<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ChatMember extends Model
{
    protected $fillable = ['chat_id', 'user_id', 'role'];
    public $timestamps = false;

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
