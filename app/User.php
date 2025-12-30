<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['id', 'username', 'profile_picture', 'online'];
    public $incrementing = false;
    protected $keyType = 'string';

    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    public function blockedUsers()
    {
        return $this->hasMany(BlockedUser::class, 'user_id');
    }

    public function blockedBy()
    {
        return $this->hasMany(BlockedUser::class, 'blocked_id');
    }

    public function hasBlocked($userId)
    {
        return $this->blockedUsers()->where('blocked_id', $userId)->exists();
    }

    public function isBlockedBy($userId)
    {
        return $this->blockedBy()->where('user_id', $userId)->exists();
    }
}
