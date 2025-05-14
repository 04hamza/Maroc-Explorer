<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }
        $user = Auth::user();
        $token = JWTAuth::fromUser($user);
        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 200);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    public function user()
    {
        return response()->json(Auth::user(), 200);
    }
    public function tokenInfo(Request $request)
    {
        try {
            $token = JWTAuth::parseToken();
            $payload = $token->getPayload();
            return response()->json([
                'message' => 'Token info retrieved successfully',
                'data' => [
                    'issued_at' => date('Y-m-d H:i:s', $payload->get('iat')),
                    'expires_at' => date('Y-m-d H:i:s', $payload->get('exp')),
                    'user_id' => $payload->get('sub'),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }
    }

    /**
     * Refresh the JWT token
     */
    public function refresh(Request $request)
    {
        try {
            $newToken = JWTAuth::refresh();
            return response()->json([
                'message' => 'Token refreshed successfully',
                'token' => $newToken,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Could not refresh token'], 401);
        }
    }
}