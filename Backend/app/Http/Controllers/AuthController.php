<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // register handler/logic
    public function register(RegisterRequest $request){
        // validated() only the fields that have rules,
        // The confirmation field isn't included
        // User::create, create the user and inserts the row
        $user = User::create($request->validated());

        return response() -> json(
            ['user' => $user,
            // createToken('web')->plainTextToken: issues the token
             'token' => $user->createToken('web')->plainTextToken] // Also for auto logging in after account creation
             , 201
        );
    }
    
    // login logic
    public function login(LoginRequest $request){

        $credentials = $request->validated();

        // Basically SELECT * FROM user WHERE email=$email LIMIT 1 
        // Eloquent, ORM(Object Relational Mapping), maps OOP code
        // to RAW SQL query.
        $user = User::where('email', $credentials['email'])->first();

        // If the email or password does not match
        if (!$user || !Hash::check($credentials['password'],$user->password)){
            return response() -> json([
                'message' => "The provided credentials are incorrect.", 
            ], 422);
        }

        return response() ->json([
            'user' => $user,
            'token' => $user->createToken('web')->plainTextToken
        ], 200);
    }
}
