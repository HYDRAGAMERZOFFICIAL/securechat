<?php

namespace App\Http\Controllers;

use App\Chat;
use App\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $chatId = $request->query('chat_id');
        if (!$chatId) {
            return response()->json(['message' => 'chat_id required'], 400);
        }

        return Message::where('chat_id', $chatId)->orderBy('timestamp', 'asc')->get();
    }

    public function store(Request $request)
    {
        $message = Message::create([
            'id' => $request->input('id'),
            'chat_id' => $request->input('chat_id'),
            'sender_id' => $request->input('sender_id'),
            'text' => $request->input('text'),
            'status' => $request->input('status'),
        ]);

        Chat::where('id', $request->input('chat_id'))->update([
            'last_message' => $request->input('text'),
            'last_message_timestamp' => now()
        ]);

        return response()->json(['message' => 'Message sent']);
    }
}
