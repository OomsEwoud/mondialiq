<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
      protected $fillable = [
        'external_id',
        'country_id',
        'first_name',
        'last_name',
        'display_name',
        'birth_date',
        'photo_url',
        'position',
        'number'
    ];

    protected $casts = [
        'birth_date' => 'datetime',
        'number' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

}
