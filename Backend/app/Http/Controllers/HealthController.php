<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function health(){
        try {
            // Establish the current PDO connection
            DB::connection()->getPdo();
            $db = "ok";
        } catch (\Throwable $e){
            $db = "down";
        }

        return response() -> json([
            'db' => $db, 'container' => gethostname()
        ], $db === 'ok' ? 200 : 503);
    }
}
