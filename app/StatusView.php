<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StatusView extends Model
{
    protected $fillable = ['status_id', 'user_id'];

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
