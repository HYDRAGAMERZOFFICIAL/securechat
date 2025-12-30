<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::all(['id', 'username', 'profile_picture as profilePicture', 'online']);
    }

    public function handlePost(Request $request)
    {
        $action = $request->input('action');

        if ($action === 'login') {
            return $this->login($request);
        } elseif ($action === 'register') {
            return $this->register($request);
        }

        return response()->json(['message' => 'Action required'], 400);
    }

    private function login(Request $request)
    {
        $user = User::find($request->input('id'));

        if ($user) {
            $user->update(['online' => true]);
            return response()->json($user);
        }

        return response()->json(['message' => 'User not found'], 404);
    }

    private function register(Request $request)
    {
        User::create([
            'id' => $request->input('id'),
            'username' => $request->input('username'),
            'profile_picture' => $request->input('profile_picture'),
            'online' => true
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    public function update(Request $request)
    {
        $user = User::find($request->input('id'));
        if ($user) {
            $user->update([
                'username' => $request->input('username'),
                'profile_picture' => $request->input('profilePicture')
            ]);
            return response()->json(['message' => 'User updated successfully']);
        }
        return response()->json(['message' => 'User not found'], 404);
    }
}
