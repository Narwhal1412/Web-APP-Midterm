<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use Illuminate\Http\Request;

// CRUD for note
class NoteController extends Controller
{
    // POST /api/notes -> 201 {} or 401 or 422
    // Create note
    public function create(CreateNoteRequest $request){
        // For the user who made the request,
        // create note with it's input validated
        // public function notes(): HasMany {...} inside of Models/User.php
        $note = $request->user()->notes()->create($request->validated());

        return response()->json($note,201);
    }
    // GET /api/notes -> 200 {} or 401
    // Read note
    public function read(Request $request){

        $notes = $request->user()->notes()->latest()->get();

        return response()->json($notes,200);
    }

    // PUT /api/notes/{id} -> 200 {} or 404
    // Update note
    public function update(UpdateNoteRequest $request, int $id){
        // find the note with the specified id
        $note = $request->user()->notes()->findOrFail($id);
        // Then update it, after input validation
        $note->update($request->validated());

        return response()->json($note, 200);
    }
    
}
