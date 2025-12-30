<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\CallController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PrivacyController;
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
    Route::get('/users/devices', [UserController::class, 'getDevices']);
    Route::post('/users/link-signal', [UserController::class, 'linkSignal']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::post('/contacts/sync', [ContactController::class, 'sync']);
    Route::post('/contacts', [ContactController::class, 'store']);
    Route::delete('/contacts/{contactId}', [ContactController::class, 'destroy']);

    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'store']);
    Route::get('/chats/{id}', [ChatController::class, 'show']);
    Route::put('/chats/{id}', [ChatController::class, 'update']);
    Route::post('/chats/{id}/members', [ChatController::class, 'addMember']);
    Route::delete('/chats/{id}/members/{memberId}', [ChatController::class, 'removeMember']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/status', [MessageController::class, 'updateStatus']);

    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::get('/media/{id}/download', [MediaController::class, 'download']);

    Route::get('/statuses', [StatusController::class, 'index']);
    Route::post('/statuses', [StatusController::class, 'store']);
    Route::post('/statuses/{id}/view', [StatusController::class, 'view']);
    Route::get('/statuses/{id}/views', [StatusController::class, 'getViews']);

    Route::get('/calls', [CallController::class, 'index']);
    Route::post('/calls', [CallController::class, 'store']);
    Route::post('/calls/signal', [CallController::class, 'signal']);

    Route::post('/notifications/subscribe', [NotificationController::class, 'subscribe']);
    Route::post('/notifications/unsubscribe', [NotificationController::class, 'unsubscribe']);
    Route::get('/sync', [NotificationController::class, 'sync']);

    Route::post('/privacy/block', [PrivacyController::class, 'block']);
    Route::delete('/privacy/block/{blockedId}', [PrivacyController::class, 'unblock']);
    Route::get('/privacy/blocked', [PrivacyController::class, 'blockedList']);
    Route::post('/privacy/report', [PrivacyController::class, 'report']);
});
