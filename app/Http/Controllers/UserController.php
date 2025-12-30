<?php

namespace App\Http\Controllers;

use App\User;
use App\Device;
use App\Otp;
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
            return response()->json(['message' => 'Invalid or expired OTP'], 401);
        }

        if ($otpRecord->attempts >= 3) {
            $otpRecord->update(['expires_at' => now()]);
            return response()->json(['message' => 'Too many attempts. Request a new OTP.'], 401);
        }

        if (!Hash::check($otpCode, $otpRecord->otp_hash)) {
            $otpRecord->increment('attempts');
            return response()->json(['message' => 'Incorrect OTP'], 401);
        }

        $otpRecord->update(['verified_at' => now()]);

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

        $token = $this->generateSignedToken([
            'user_id' => $user->id,
            'device_id' => $deviceId,
            'type' => 'session'
        ], 60 * 24 * 7); // 7 days session

        return response()->json([
            'status' => 'success',
            'user' => $user,
            'access_token' => $token
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
}
