<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

// Whitelist collumns for create/update
// user_id is not needed in fillable, 
// Since laravel automatically fills it automatically, 
// From the logged-in user
#[fillable(['title','content'])]
class Note extends Model
{
    // A note can only belong to a user.
    // PHP automatically link this model foreign key to the other model.
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
