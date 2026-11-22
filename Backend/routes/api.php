<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Health route
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