<?php

namespace App\Http\Controllers;

use App\Contact;
use App\User;
use App\BlockedUser;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->input('auth_user_id');
        
        $contacts = Contact::where('user_id', $userId)
            ->with(['contactUser' => function($query) {
                $query->select('id', 'username', 'profile_picture', 'online');
            }])
            ->get();

        return response()->json($contacts);
    }

    public function sync(Request $request)
    {
        $request->validate([
            'phone_numbers' => 'required|array',
            'phone_numbers.*' => 'required|string',
        ]);

        $userId = $request->input('auth_user_id');
        $numbers = $request->input('phone_numbers');
        
        // Exclude users who blocked me
        $blockedMe = BlockedUser::where('blocked_id', $userId)->pluck('user_id');
        
        $existingUsers = User::whereIn('id', $numbers)
            ->whereNotIn('id', $blockedMe)
            ->get(['id', 'username', 'profile_picture', 'online']);

        return response()->json($existingUsers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'contact_id' => 'required|string|exists:users,id',
            'nickname' => 'nullable|string',
        ]);

        $userId = $request->input('auth_user_id');
        $contactId = $request->input('contact_id');

        if ($userId === $contactId) {
            return response()->json(['message' => 'Cannot add yourself as contact'], 400);
        }

        $contact = Contact::updateOrCreate(
            ['user_id' => $userId, 'contact_id' => $contactId],
            ['nickname' => $request->input('nickname')]
        );

        return response()->json([
            'message' => 'Contact saved successfully',
            'contact' => $contact
        ]);
    }

    public function destroy(Request $request, $contactId)
    {
        $userId = $request->input('auth_user_id');
        
        Contact::where('user_id', $userId)
            ->where('contact_id', $contactId)
            ->delete();

        return response()->json(['message' => 'Contact removed successfully']);
    }
}
