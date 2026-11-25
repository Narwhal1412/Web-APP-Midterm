<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        // Lay id cua nguoi dang dang nhap
        $userId = $request->user()->id;

        // Tim trong bang notes nhung dong co user_id trung voi nguoi dang dang nhap
        $notes = DB::table('notes')->where('user_id', $userId)->get();

        // Tra ket qua ve dang JSON, ma 200 la thanh cong
        return response()->json($notes, 200);
    }
}