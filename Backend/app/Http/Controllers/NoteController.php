<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateNoteRequest;
use Illuminate\Http\Request;

// CRUD for note
class NoteController extends Controller
{
    // Create note
    public function create(CreateNoteRequest $request){
        // For the user who made the request,
        // create note with it's input validated
        // public function notes(): HasMany {...} inside of Models/User.php
        $note = $request->user()->notes()->create($request->validated());

        return response()->json($note,201);
    }

    // Read note
    public function read(Request $request){

        $notes = $request->user()->notes()->latest()->get();

        return response()->json($notes,200);
    }
    
}
