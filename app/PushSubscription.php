<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'token',
        'platform'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
