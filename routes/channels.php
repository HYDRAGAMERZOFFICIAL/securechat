<?php

use App\ChatMember;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    return ChatMember::where('chat_id', $chatId)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return $user->id === $id;
});
