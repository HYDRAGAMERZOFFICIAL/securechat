<?php

namespace App\Http\Controllers;

use App\Status;
use App\StatusView;
use App\Contact;
use App\BlockedUser;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('auth_user_id');
        
        // Get contacts' user IDs
        $contactIds = Contact::where('user_id', $userId)->pluck('contact_id');
        
        // Exclude users who blocked me or I blocked
        $blockedMe = BlockedUser::where('blocked_id', $userId)->pluck('user_id');
        $blockedByMe = BlockedUser::where('user_id', $userId)->pluck('blocked_id');
        
        $excludedIds = $blockedMe->merge($blockedByMe)->unique();
        
        $relevantUserIds = $contactIds->diff($excludedIds)->push($userId);

        $statuses = Status::active()
            ->whereIn('user_id', $relevantUserIds)
            ->with(['user' => function($q) {
                $q->select('id', 'username', 'profile_picture');
            }, 'media'])
            ->withCount('views')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($statuses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'media_id' => 'nullable|exists:media,id',
            'caption' => 'nullable|string',
            'type' => 'required|in:image,video,text',
        ]);

        $status = Status::create([
            'user_id' => $request->input('auth_user_id'),
            'media_id' => $request->input('media_id'),
            'caption' => $request->input('caption'),
            'type' => $request->input('type'),
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'message' => 'Status posted successfully',
            'status' => $status->load('media')
        ]);
    }

    public function view(Request $request, $id)
    {
        $userId = $request->input('auth_user_id');
        $status = Status::find($id);

        if (!$status || $status->expires_at < now()) {
            return response()->json(['message' => 'Status not found or expired'], 404);
        }

        // Check if user is allowed to view (is contact or owner)
        $isContact = Contact::where('user_id', $status->user_id)
            ->where('contact_id', $userId)
            ->exists();

        if (!$isContact && $status->user_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        StatusView::updateOrCreate([
            'status_id' => $id,
            'user_id' => $userId
        ]);

        return response()->json(['message' => 'Status viewed']);
    }

    public function getViews($id, Request $request)
    {
        $userId = $request->input('auth_user_id');
        $status = Status::where('id', $id)->where('user_id', $userId)->first();

        if (!$status) {
            return response()->json(['message' => 'Status not found or unauthorized'], 404);
        }

        $views = StatusView::where('status_id', $id)
            ->with(['user' => function($q) {
                $q->select('id', 'username', 'profile_picture');
            }])
            ->get();

        return response()->json($views);
    }
}
