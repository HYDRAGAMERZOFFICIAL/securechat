<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'token',
        'expires_at',
        'revoked'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked' => 'boolean'
    ];
}
