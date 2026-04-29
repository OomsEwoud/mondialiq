<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'photo_url'
    ];

    protected $casts = [
        'birth_date' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}
