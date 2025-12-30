<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['id', 'username', 'profile_picture', 'online'];
    public $incrementing = false;
    protected $keyType = 'string';
}
