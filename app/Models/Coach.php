<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coach extends Model
{
    protected $fillable = [
        'external_id',
        'team_id',
        'country_id',
        'first_name',
        'last_name',
        'display_name',
        'birth_date',
        'photo_url',
    ];

    protected $casts = [
        'birth_date' => 'datetime',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
