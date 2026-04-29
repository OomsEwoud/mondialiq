<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venue extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'city',
        'country_id',
        'capacity',
        'photo_url'
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function fixtures()
    {
        return $this->hasMany(Fixture::class);
    }
}
