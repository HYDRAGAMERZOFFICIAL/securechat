<?php

namespace App\Http\Controllers;

use App\Media;
use App\ChatMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'chat_id' => 'nullable|string|exists:chats,id',
        ]);

        $userId = $request->input('auth_user_id');
        $chatId = $request->input('chat_id');

        if ($chatId) {
            $isMember = ChatMember::where('chat_id', $chatId)
                ->where('user_id', $userId)
                ->exists();

            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $file = $request->file('file');
        $path = $file->store('media');

        $media = Media::create([
            'user_id' => $userId,
            'chat_id' => $chatId,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json($media);
    }

    public function download(Request $request, $id)
    {
        $userId = $request->input('auth_user_id');
        $media = Media::find($id);

        if (!$media) {
            return response()->json(['message' => 'Media not found'], 404);
        }

        if ($media->chat_id) {
            $isMember = ChatMember::where('chat_id', $media->chat_id)
                ->where('user_id', $userId)
                ->exists();

            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif ($media->user_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Storage::exists($media->file_path)) {
            return response()->json(['message' => 'File not found on disk'], 404);
        }

        return Storage::download($media->file_path, $media->original_name);
    }
}
