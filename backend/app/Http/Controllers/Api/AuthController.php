<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
Use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    //Register a new user.

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);
 
            $user  = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
 
            $token = $user->createToken('api-token')->plainTextToken;
 
            return response()->json([
                'message' => 'User registered successfully.',
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                'token'   => $token,
            ], 201);
 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
 
    //Log in an existing user and return a Sanctum token.
     
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'    => 'required|string|email',
                'password' => 'required|string',
            ]);
 
            $user = User::where('email', $request->email)->first();
 
            if (!$user) {
                return response()->json([
                    'message' => 'No account found with that email address.',
                    'errors'  => ['email' => ['This email is not registered.']],
                ], 404);
            }
 
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Incorrect password.',
                    'errors'  => ['password' => ['The password you entered is wrong.']],
                ], 401);
            }
 
        // Revoke all previous tokens (optional – keeps only the latest)
                    $user->tokens()->delete();
            $token = $user->createToken('api-token')->plainTextToken;
 
            return response()->json([
                'message' => 'Login successful.',
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                'token'   => $token,
            ]);
 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
 
    //Log out the authenticated user (revoke current token).
     
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out successfully.']);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
 
    // Return the currently authenticated user.
    
    public function me(Request $request)
    {
        try {
            return response()->json([
                'user' => ['id' => $request->user()->id, 'name' => $request->user()->name, 'email' => $request->user()->email],
            ]);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Update the authenticated user's username (name).

    public function updateUsername(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $user = $request->user();
            $user->update(['name' => $validated['name']]);

            return response()->json([
                'message' => 'Username updated successfully.',
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}