<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageReceipt extends Model
{
    protected $fillable = ['message_id', 'user_id', 'status', 'timestamp'];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
