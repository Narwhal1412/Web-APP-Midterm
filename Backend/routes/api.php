<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Protected route outside of group
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Prottected routes sharing middleware via a group
Route::middleware('auth:sanctum')->group(function () {
    // Logout endpoint
    Route::post('/logout', [AuthController::class, 'logout']);
    
    //CRUD
    // Create note endpoint
    Route::post("/notes", [NoteController::class, 'create']);
    // Read note endpoint
    Route::get('/notes', [NoteController::class, 'read']);
    // Read{id} note endpoint
    Route::get('/notes/{id}', [NoteController::class, 'readid']);
    // Update note endpoint
    Route::put('/notes/{id}', [NoteController::class, 'update']);
    // Delete note endpoint
    Route::delete('/notes/{id}', [NoteController::class, 'delete']);
});

// Health endpoint
Route::get('/health', [HealthController::class, 'health']);

// Public Routes
// Register endpoint
Route::post('/register', [AuthController::class, 'register']);

// Login endpoint
Route::post('login', [AuthController::class, 'login']);