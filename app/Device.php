<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'user_id', 
        'device_id', 
        'device_name', 
        'last_ip', 
        'last_active_at',
        'identity_key',
        'signed_pre_key',
        'signed_pre_key_signature',
        'signed_pre_key_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function preKeys()
    {
        return $this->hasMany(PreKey::class);
    }
}
