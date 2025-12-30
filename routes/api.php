<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::post('/users', [UserController::class, 'handlePost']);

// Protected Routes
Route::middleware(['auth.signed'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users', [UserController::class, 'update']);

    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'store']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
});
