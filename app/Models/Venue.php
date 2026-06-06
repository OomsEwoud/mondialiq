<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'external_id',
    'name',
    'city',
    'country_id',
    'capacity',
    'photo_url',
])]
class Venue extends Model
{
    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function fixtures(): HasMany
    {
        return $this->hasMany(Fixture::class);
    }
}
