<?php

namespace App\Http\Controllers;

use App\PushSubscription;
use App\Message;
use App\ChatMember;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => $request->input('auth_user_id'),
                'device_id' => $request->input('auth_device_id'),
            ],
            [
                'token' => $request->input('token'),
                'platform' => $request->input('platform'),
            ]
        );

        return response()->json([
            'message' => 'Subscribed to notifications',
            'subscription' => $subscription
        ]);
    }

    public function unsubscribe(Request $request)
    {
        PushSubscription::where('user_id', $request->input('auth_user_id'))
            ->where('device_id', $request->input('auth_device_id'))
            ->delete();

        return response()->json(['message' => 'Unsubscribed successfully']);
    }

    public function sync(Request $request)
    {
        $userId = $request->input('auth_user_id');

        // Get unread counts for all chats
        $unreadCounts = ChatMember::where('user_id', $userId)
            ->get()
            ->mapWithKeys(function ($membership) use ($userId) {
                $count = Message::where('chat_id', $membership->chat_id)
                    ->where('sender_id', '!=', $userId)
                    ->where('status', '!=', 'read')
                    ->count();
                return [$membership->chat_id => $count];
            });

        return response()->json([
            'unread_counts' => $unreadCounts,
            'server_time' => now()
        ]);
    }
}
