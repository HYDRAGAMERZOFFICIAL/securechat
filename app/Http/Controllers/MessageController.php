<?php

namespace App\Http\Controllers;

use App\Chat;
use App\Message;
use App\ChatMember;
use App\Events\MessageSent;
use App\Events\MessageStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|string|exists:chats,id',
            'limit' => 'nullable|integer|min:1|max:100',
            'before' => 'nullable|string', // For pagination (timestamp)
        ]);

        $chatId = $request->input('chat_id');
        $userId = $request->input('auth_user_id');

        // Verify membership
        $isMember = ChatMember::where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Message::where('chat_id', $chatId);

        if ($request->has('before')) {
            $query->where('timestamp', '<', $request->input('before'));
        }

        $limit = $request->input('limit', 50);
        $messages = $query->orderBy('timestamp', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|string|exists:chats,id',
            'text' => 'required|string',
            'id' => 'nullable|string', // Client can provide local ID
        ]);

        $chatId = $request->input('chat_id');
        $userId = $request->input('auth_user_id');

        // Verify membership
        $isMember = ChatMember::where('chat_id', $chatId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'id' => $request->input('id', (string) Str::uuid()),
            'chat_id' => $chatId,
            'sender_id' => $userId,
            'text' => $request->input('text'),
            'status' => 'sent',
        ]);

        broadcast(new MessageSent($message))->toOthers();

        Chat::where('id', $chatId)->update([
            'last_message' => $request->input('text'),
            'last_message_timestamp' => now()
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:delivered,read'
        ]);

        $userId = $request->input('auth_user_id');
        $status = $request->input('status');

        $message = Message::find($id);

        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        // Only members of the chat can update message status (specifically recipients)
        $isMember = ChatMember::where('chat_id', $message->chat_id)
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Don't allow sender to mark their own message as read/delivered (usually)
        // or don't downgrade status
        if ($message->sender_id === $userId) {
            // Technically sender could mark it as read on another device? 
            // For now let's allow it but usually it's the recipient.
        }

        $message->update(['status' => $status]);

        broadcast(new MessageStatusUpdated($message->id, $message->chat_id, $status))->toOthers();

        return response()->json(['message' => 'Status updated']);
    }
}
