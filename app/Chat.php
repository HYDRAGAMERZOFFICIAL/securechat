<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = ['id', 'type', 'name', 'avatar', 'last_message', 'last_message_timestamp'];
    public $incrementing = false;
    protected $keyType = 'string';

    public function members()
    {
        return $this->hasMany(ChatMember::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
