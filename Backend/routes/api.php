<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Health endpoint
Route::get('/health', function () {
    try {
        // Establish the current PDO connection
        DB::connection()->getPdo();
        $db = 'ok'; 
    } catch (\Throwable $e) {
        $db = 'down';
    }

    return response() -> json(
        // Reports ok or down
        // Shows the current running container id with gethostname()
    ['db' => $db, 'container' => gethostname()],
    $db === 'ok' ? 200 : 503
    );
});

// Register endpoint
Route::post('/register', [AuthController::class, 'register']);

// Read endpoint
Route::get('/notes', function (Request $request) {
    // Lay id cua nguoi dang dang nhap
    $userId = $request->user()->id;
    // Tim trong bang notes nhung dong co user_id trung voi nguoi dang dang nhap
    $notes = DB::table('notes')->where('user_id', $userId)->get();
    // Tra ket qua ve dang JSON, ma 200 la thanh cong
    return response()->json($notes, 200);
})->middleware('auth:sanctum');