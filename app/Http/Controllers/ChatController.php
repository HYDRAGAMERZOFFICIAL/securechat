<?php

namespace App\Http\Controllers;

use App\Chat;
use App\ChatMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        if (!$userId) {
            return response()->json(['message' => 'user_id required'], 400);
        }

        $chats = Chat::whereHas('members', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->get();

        foreach ($chats as $chat) {
            $chat->members = ChatMember::where('chat_id', $chat->id)->pluck('user_id');
        }

        return response()->json($chats);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $chat = Chat::create([
                'id' => $request->input('id'),
                'type' => $request->input('type'),
                'name' => $request->input('name'),
                'avatar' => $request->input('avatar'),
            ]);

            foreach ($request->input('members') as $user_id) {
                ChatMember::create([
                    'chat_id' => $chat->id,
                    'user_id' => $user_id,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Chat created successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create chat', 'error' => $e->getMessage()], 500);
        }
    }
}
