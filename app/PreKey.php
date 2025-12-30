<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PreKey extends Model
{
    protected $fillable = [
        'device_id',
        'key_id',
        'public_key',
        'consumed_at'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
