<?php

namespace App\Http\Controllers;

use App\BlockedUser;
use App\Report;
use Illuminate\Http\Request;

class PrivacyController extends Controller
{
    public function block(Request $request)
    {
        $request->validate([
            'blocked_id' => 'required|string|exists:users,id',
        ]);

        $userId = $request->input('auth_user_id');
        $blockedId = $request->input('blocked_id');

        if ($userId === $blockedId) {
            return response()->json(['message' => 'Cannot block yourself'], 400);
        }

        BlockedUser::updateOrCreate([
            'user_id' => $userId,
            'blocked_id' => $blockedId
        ]);

        return response()->json(['message' => 'User blocked successfully']);
    }

    public function unblock(Request $request, $blockedId)
    {
        $userId = $request->input('auth_user_id');

        BlockedUser::where('user_id', $userId)
            ->where('blocked_id', $blockedId)
            ->delete();

        return response()->json(['message' => 'User unblocked successfully']);
    }

    public function blockedList(Request $request)
    {
        $userId = $request->input('auth_user_id');

        $blocked = BlockedUser::where('user_id', $userId)
            ->with(['blocked' => function($q) {
                $q->select('id', 'username', 'profile_picture');
            }])
            ->get();

        return response()->json($blocked);
    }

    public function report(Request $request)
    {
        $request->validate([
            'reported_id' => 'required|string|exists:users,id',
            'reason' => 'required|string',
            'message_id' => 'nullable|string|exists:messages,id',
        ]);

        $report = Report::create([
            'reporter_id' => $request->input('auth_user_id'),
            'reported_id' => $request->input('reported_id'),
            'message_id' => $request->input('message_id'),
            'reason' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report
        ]);
    }
}
