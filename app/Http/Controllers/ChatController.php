<?php

namespace App\Http\Controllers;

use App\Chat;
use App\ChatMember;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('auth_user_id');

        $chats = Chat::whereHas('members', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['members.user' => function($query) {
            $query->select('id', 'username', 'profile_picture', 'online');
        }])
        ->orderBy('last_message_timestamp', 'desc')
        ->get();

        // For private chats, we might want to return the other person's info as the chat name/avatar
        foreach ($chats as $chat) {
            if ($chat->type === 'private') {
                $otherMember = $chat->members->first(function($m) use ($userId) {
                    return $m->user_id !== $userId;
                });
                
                if ($otherMember && $otherMember->user) {
                    $chat->display_name = $otherMember->user->username;
                    $chat->display_avatar = $otherMember->user->profile_picture;
                }
            } else {
                $chat->display_name = $chat->name;
                $chat->display_avatar = $chat->avatar;
            }
        }

        return response()->json($chats);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:private,group',
            'members' => 'required|array|min:1',
            'members.*' => 'required|string|exists:users,id',
            'name' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $userId = $request->input('auth_user_id');
        $members = array_unique(array_merge($request->input('members'), [$userId]));

        if ($request->input('type') === 'private') {
            if (count($members) !== 2) {
                return response()->json(['message' => 'Private chat must have exactly 2 members'], 400);
            }

            // Check if private chat already exists
            $existingChat = Chat::where('type', 'private')
                ->whereHas('members', function($q) use ($members) {
                    $q->whereIn('user_id', $members);
                }, '=', 2)
                ->whereHas('members', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->first();

            if ($existingChat) {
                return response()->json([
                    'message' => 'Chat already exists',
                    'chat' => $existingChat
                ]);
            }
        }

        DB::beginTransaction();
        try {
            $chat = Chat::create([
                'id' => (string) Str::uuid(),
                'type' => $request->input('type'),
                'name' => $request->input('name'),
                'avatar' => $request->input('avatar'),
            ]);

            foreach ($members as $memberId) {
                ChatMember::create([
                    'chat_id' => $chat->id,
                    'user_id' => $memberId,
                    'role' => ($request->input('type') === 'group' && $memberId === $userId) ? 'admin' : 'member'
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Chat created successfully',
                'chat' => $chat
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create chat', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $userId = $request->input('auth_user_id');
        
        $chat = Chat::where('id', $id)
            ->whereHas('members', function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['members.user' => function($query) {
                $query->select('id', 'username', 'profile_picture', 'online');
            }])
            ->first();

        if (!$chat) {
            return response()->json(['message' => 'Chat not found'], 404);
        }

        return response()->json($chat);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $userId = $request->input('auth_user_id');
        
        $membership = ChatMember::where('chat_id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$membership || ($membership->role !== 'admin' && Chat::find($id)->type === 'group')) {
            return response()->json(['message' => 'Unauthorized or not an admin'], 403);
        }

        $chat = Chat::find($id);
        $chat->update($request->only(['name', 'avatar']));

        return response()->json(['message' => 'Chat updated successfully', 'chat' => $chat]);
    }

    public function addMember(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|string|exists:users,id',
        ]);

        $userId = $request->input('auth_user_id');
        $newMemberId = $request->input('user_id');

        $adminCheck = ChatMember::where('chat_id', $id)
            ->where('user_id', $userId)
            ->where('role', 'admin')
            ->exists();

        if (!$adminCheck) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ChatMember::updateOrCreate(
            ['chat_id' => $id, 'user_id' => $newMemberId],
            ['role' => 'member']
        );

        return response()->json(['message' => 'Member added successfully']);
    }

    public function removeMember(Request $request, $id, $memberId)
    {
        $userId = $request->input('auth_user_id');

        $adminCheck = ChatMember::where('chat_id', $id)
            ->where('user_id', $userId)
            ->where('role', 'admin')
            ->exists();

        if (!$adminCheck && $userId !== $memberId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ChatMember::where('chat_id', $id)
            ->where('user_id', $memberId)
            ->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }
}
