<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/auth', [UserController::class, 'handlePost']);

// Protected Routes
Route::middleware(['auth.signed'])->group(function () {
    Route::post('/auth/logout', [UserController::class, 'logout']);
    Route::post('/auth/revoke-device', [UserController::class, 'revokeDevice']);
    Route::post('/auth/keys', [UserController::class, 'updateKeys']);
    Route::get('/auth/keys/{target_user_id}', [UserController::class, 'getUserKeys']);

    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users', [UserController::class, 'update']);

    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'store']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
});
