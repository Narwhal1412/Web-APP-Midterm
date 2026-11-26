<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;
    // A user has many notes.
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    // Casts are basically turning DB values into PHP types.
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // Eloquent automatically encrypts the plain text password,
            // Before the SQL INSERT
            'password' => 'hashed',
        ];
    }
}
