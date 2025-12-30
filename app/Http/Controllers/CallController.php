<?php

namespace App\Http\Controllers;

use App\Call;
use App\Events\CallSignaling;
use Illuminate\Http\Request;

class CallController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('auth_user_id');

        $calls = Call::where('caller_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['caller', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($calls);
    }

    public function signal(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|string|exists:users,id',
            'data' => 'required|array',
            'type' => 'required|string|in:offer,answer,candidate,hangup',
        ]);

        $senderId = $request->input('auth_user_id');
        $receiverId = $request->input('receiver_id');

        broadcast(new CallSignaling($receiverId, $senderId, $request->input('data'), $request->input('type')))->toOthers();

        return response()->json(['message' => 'Signal sent']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'caller_id' => 'required|string|exists:users,id',
            'receiver_id' => 'required|string|exists:users,id',
            'type' => 'required|in:voice,video',
            'status' => 'required|in:missed,completed,rejected,busy',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date',
            'duration' => 'nullable|integer',
        ]);

        $call = Call::create($request->all());

        return response()->json([
            'message' => 'Call log saved',
            'call' => $call
        ]);
    }
}
