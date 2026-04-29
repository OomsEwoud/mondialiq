<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class League extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'type',
        'logo_url',
        'country_id',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    public function fixtures()
    {
        return $this->hasMany(Fixture::class);
    }
}
