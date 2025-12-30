<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class BlockedUser extends Model
{
    protected $fillable = ['user_id', 'blocked_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function blocked()
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }
}
