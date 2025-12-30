<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['id', 'chat_id', 'sender_id', 'text', 'status'];
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Using the 'timestamp' column from SQL
}
