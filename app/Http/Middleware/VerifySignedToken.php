<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySignedToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = substr($authHeader, 7);
        $payload = $this->verifyToken($token);

        if (!$payload || $payload['type'] !== 'session') {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        // Attach user info to request
        $request->merge(['auth_user_id' => $payload['user_id']]);
        $request->merge(['auth_device_id' => $payload['device_id']]);

        return $next($request);
    }

    private function verifyToken(string $token)
    {
        $secret = config('app.key');
        $parts = explode('.', $token);
        if (count($parts) !== 2) return null;

        [$base64Payload, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', $base64Payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) return null;

        $payload = json_decode(base64_decode($base64Payload), true);
        
        if (!$payload || !isset($payload['exp']) || time() > $payload['exp']) {
            return null;
        }

        return $payload;
    }
}
