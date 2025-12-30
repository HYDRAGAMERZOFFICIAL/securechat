<?php

namespace App\Http\Controllers;

use App\User;
use App\Device;
use App\Otp;
use App\AuditLog;
use App\RefreshToken;
use App\Events\DeviceLinking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserController extends Controller
{
    private $tokenSecret;

    public function __construct()
    {
        $this->tokenSecret = config('app.key');
    }

    private function logEvent(Request $request, string $event, ?string $userId = null, ?string $deviceId = null, array $metadata = [])
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

    public function index()
    {
        return User::all(['id', 'username', 'profile_picture as profilePicture', 'online']);
    }

    public function handlePost(Request $request)
    {
        $action = $request->input('action');

        switch ($action) {
            case 'request_otp':
                return $this->requestOtp($request);
            case 'verify_otp':
                return $this->verifyOtp($request);
            case 'register':
                return $this->register($request);
            case 'login':
                return $this->login($request);
            case 'refresh_token':
                return $this->handleRefreshToken($request);
            default:
                return response()->json(['message' => 'Invalid action'], 400);
        }
    }

    private function requestOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10',
        ]);

        $phoneNumber = $request->input('phone_number');
        
        // Rate limiting: check for recent active OTPs
        $existing = Otp::where('phone_number', $phoneNumber)
            ->where('expires_at', '>', now())
            ->whereNull('verified_at')
            ->count();

        if ($existing >= 3) {
            return response()->json(['message' => 'Too many requests. Please wait.'], 429);
        }

        $otpCode = rand(100000, 999999);
        $otpHash = Hash::make($otpCode);

        Otp::create([
            'phone_number' => $phoneNumber,
            'otp_hash' => $otpHash,
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->logEvent($request, 'otp_requested', $phoneNumber);

        // LOGGING OTP FOR DEVELOPMENT (In production, send via SMS)
        Log::info("OTP for $phoneNumber: $otpCode");

        return response()->json([
            'message' => 'OTP sent successfully',
            'dev_otp' => config('app.debug') ? $otpCode : null // Only for dev
        ]);
    }

    private function verifyOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string',
            'otp' => 'required|string|size:6',
            'device_id' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $phoneNumber = $request->input('phone_number');
        $otpCode = $request->input('otp');

        $otpRecord = Otp::where('phone_number', $phoneNumber)
            ->where('expires_at', '>', now())
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$otpRecord) {
            $this->logEvent($request, 'otp_failed_expired', $phoneNumber);
            return response()->json(['message' => 'Invalid or expired OTP'], 401);
        }

        if ($otpRecord->attempts >= 3) {
            $otpRecord->update(['expires_at' => now()]);
            $this->logEvent($request, 'otp_failed_too_many_attempts', $phoneNumber);
            return response()->json(['message' => 'Too many attempts. Request a new OTP.'], 401);
        }

        if (!Hash::check($otpCode, $otpRecord->otp_hash)) {
            $otpRecord->increment('attempts');
            $this->logEvent($request, 'otp_failed_incorrect', $phoneNumber);
            return response()->json(['message' => 'Incorrect OTP'], 401);
        }

        $otpRecord->update(['verified_at' => now()]);
        $this->logEvent($request, 'otp_verified', $phoneNumber);

        $user = User::where('id', $phoneNumber)->first();

        if (!$user) {
            $regToken = $this->generateSignedToken([
                'phone_number' => $phoneNumber,
                'verified' => true,
                'type' => 'registration'
            ], 15); // 15 min registration window

            return response()->json([
                'status' => 'registration_required',
                'registration_token' => $regToken
            ]);
        }

        return $this->authenticateDevice($user, $request);
    }

    private function register(Request $request)
    {
        $request->validate([
            'registration_token' => 'required|string',
            'username' => 'required|string|min:3',
            'profile_picture' => 'nullable|string',
            'device_id' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $tokenData = $this->verifySignedToken($request->input('registration_token'));

        if (!$tokenData || $tokenData['type'] !== 'registration') {
            return response()->json(['message' => 'Invalid or expired registration token'], 401);
        }

        $phoneNumber = $tokenData['phone_number'];

        $user = User::create([
            'id' => $phoneNumber,
            'username' => $request->input('username'),
            'profile_picture' => $request->input('profile_picture'),
            'online' => true
        ]);

        $this->logEvent($request, 'registration_success', $user->id, $request->input('device_id'));

        return $this->authenticateDevice($user, $request);
    }

    private function authenticateDevice(User $user, Request $request)
    {
        $deviceId = $request->input('device_id');
        $deviceName = $request->input('device_name', 'Unknown Device');

        Device::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'user_id' => $user->id,
                'device_name' => $deviceName,
                'last_ip' => $request->ip(),
                'last_active_at' => now()
            ]
        );

        $user->update(['online' => true]);

        $this->logEvent($request, 'login_success', $user->id, $deviceId);

        $accessToken = $this->generateSignedToken([
            'user_id' => $user->id,
            'device_id' => $deviceId,
            'type' => 'session'
        ], 15); // 15 minutes short-lived

        $refreshTokenValue = Str::random(64);
        RefreshToken::create([
            'user_id' => $user->id,
            'device_id' => $deviceId,
            'token' => $refreshTokenValue,
            'expires_at' => now()->addDays(30),
        ]);

        return response()->json([
            'status' => 'success',
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshTokenValue
        ]);
    }

    private function generateSignedToken(array $payload, int $minutes)
    {
        $payload['exp'] = time() + ($minutes * 60);
        $payload['iat'] = time();
        $payload['jti'] = Str::random(16);

        $jsonPayload = json_encode($payload);
        $base64Payload = base64_encode($jsonPayload);
        $signature = hash_hmac('sha256', $base64Payload, $this->tokenSecret);

        return $base64Payload . '.' . $signature;
    }

    private function verifySignedToken(string $token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) return null;

        [$base64Payload, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', $base64Payload, $this->tokenSecret);

        if (!hash_equals($expectedSignature, $signature)) return null;

        $payload = json_decode(base64_decode($base64Payload), true);
        
        if (!$payload || !isset($payload['exp']) || time() > $payload['exp']) {
            return null;
        }

        return $payload;
    }

    // Keep original methods for compatibility if needed, but updated to use new logic
    private function login(Request $request)
    {
        // Simple login action for backward compatibility if used by other parts
        $user = User::find($request->input('id'));

        if ($user) {
            return $this->authenticateDevice($user, $request);
        }

        return response()->json(['message' => 'User not found'], 404);
    }

    private function handleRefreshToken(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
            'device_id' => 'required|string',
        ]);

        $tokenValue = $request->input('refresh_token');
        $deviceId = $request->input('device_id');

        $refreshToken = RefreshToken::where('token', $tokenValue)
            ->where('device_id', $deviceId)
            ->where('revoked', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$refreshToken) {
            $this->logEvent($request, 'refresh_token_failed', null, $deviceId, ['token' => $tokenValue]);
            return response()->json(['message' => 'Invalid or expired refresh token'], 401);
        }

        $accessToken = $this->generateSignedToken([
            'user_id' => $refreshToken->user_id,
            'device_id' => $refreshToken->device_id,
            'type' => 'session'
        ], 15);

        $this->logEvent($request, 'token_refreshed', $refreshToken->user_id, $deviceId);

        return response()->json([
            'access_token' => $accessToken
        ]);
    }

    public function logout(Request $request)
    {
        $deviceId = $request->input('auth_device_id');
        $userId = $request->input('auth_user_id');

        Device::where('device_id', $deviceId)
            ->where('user_id', $userId)
            ->delete();

        RefreshToken::where('device_id', $deviceId)
            ->where('user_id', $userId)
            ->update(['revoked' => true]);

        $this->logEvent($request, 'logout', $userId, $deviceId);

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function revokeDevice(Request $request)
    {
        $request->validate([
            'target_device_id' => 'required|string'
        ]);

        $userId = $request->input('auth_user_id');
        $targetDeviceId = $request->input('target_device_id');

        Device::where('device_id', $targetDeviceId)
            ->where('user_id', $userId)
            ->delete();

        RefreshToken::where('device_id', $targetDeviceId)
            ->where('user_id', $userId)
            ->update(['revoked' => true]);

        $this->logEvent($request, 'device_revoked', $userId, $request->input('auth_device_id'), ['revoked_device_id' => $targetDeviceId]);

        return response()->json(['message' => 'Device revoked successfully']);
    }

    public function updateKeys(Request $request)
    {
        $request->validate([
            'identity_key' => 'required|string',
            'signed_pre_key' => 'required|string',
            'signed_pre_key_signature' => 'required|string',
            'signed_pre_key_id' => 'required|integer',
            'one_time_pre_keys' => 'required|array',
            'one_time_pre_keys.*.key_id' => 'required|integer',
            'one_time_pre_keys.*.public_key' => 'required|string',
        ]);

        $device = $request->input('auth_device');
        
        $device->update([
            'identity_key' => $request->input('identity_key'),
            'signed_pre_key' => $request->input('signed_pre_key'),
            'signed_pre_key_signature' => $request->input('signed_pre_key_signature'),
            'signed_pre_key_id' => $request->input('signed_pre_key_id'),
        ]);

        // Replace one-time pre-keys
        $device->preKeys()->delete();

        foreach ($request->input('one_time_pre_keys') as $keyData) {
            $device->preKeys()->create([
                'key_id' => $keyData['key_id'],
                'public_key' => $keyData['public_key'],
            ]);
        }

        $this->logEvent($request, 'keys_updated', $device->user_id, $device->device_id);

        return response()->json(['message' => 'Keys updated successfully']);
    }

    public function getUserKeys(Request $request, $targetUserId)
    {
        $devices = Device::where('user_id', $targetUserId)->get();

        if ($devices->isEmpty()) {
            return response()->json(['message' => 'User not found or has no active devices'], 404);
        }

        $result = [];
        foreach ($devices as $device) {
            $oneTimeKey = $device->preKeys()
                ->whereNull('consumed_at')
                ->first();

            $result[] = [
                'device_id' => $device->device_id,
                'identity_key' => $device->identity_key,
                'signed_pre_key' => $device->signed_pre_key,
                'signed_pre_key_signature' => $device->signed_pre_key_signature,
                'signed_pre_key_id' => $device->signed_pre_key_id,
                'one_time_pre_key' => $oneTimeKey ? [
                    'key_id' => $oneTimeKey->key_id,
                    'public_key' => $oneTimeKey->public_key
                ] : null
            ];
            
            if ($oneTimeKey) {
                $oneTimeKey->update(['consumed_at' => now()]);
            }
        }

        $this->logEvent($request, 'keys_fetched', $request->input('auth_user_id'), $request->input('auth_device_id'), ['target_user_id' => $targetUserId]);

        return response()->json([
            'user_id' => $targetUserId,
            'devices' => $result
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'username' => 'nullable|string|min:3',
            'profile_picture' => 'nullable|string',
        ]);

        $userId = $request->input('auth_user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update($request->only(['username', 'profile_picture']));

        $this->logEvent($request, 'profile_updated', $userId, $request->input('auth_device_id'));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function getDevices(Request $request)
    {
        $userId = $request->input('auth_user_id');
        $currentDeviceId = $request->input('auth_device_id');

        $devices = Device::where('user_id', $userId)->get();

        return response()->json($devices->map(function ($device) use ($currentDeviceId) {
            $device->is_current = $device->device_id === $currentDeviceId;
            return $device;
        }));
    }

    public function linkSignal(Request $request)
    {
        $request->validate([
            'link_code' => 'required|string',
            'data' => 'required|array',
            'type' => 'required|string',
        ]);

        broadcast(new DeviceLinking($request->input('link_code'), $request->input('data'), $request->input('type')))->toOthers();

        return response()->json(['message' => 'Linking signal sent']);
    }
}
