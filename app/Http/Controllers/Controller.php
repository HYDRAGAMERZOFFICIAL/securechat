<?php

namespace App\Http\Controllers;

use App\AuditLog;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function logEvent(Request $request, string $event, ?string $userId = null, ?string $deviceId = null, array $metadata = [])
    {
        AuditLog::create([
            'user_id' => $userId,
            'device_id' => $deviceId,
            'event' => $event,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'metadata' => $metadata
        ]);
    }
}
