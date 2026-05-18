<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureOdd extends Model
{
    protected $fillable = [
        'fixture_id',
        'bookmaker_id',
        'bet_type_id',
        'value',
        'odd',
    ];

    protected $casts = [
        'odd' => 'float',
    ];

    public function betType(): BelongsTo
    {
        return $this->belongsTo(BetType::class);
    }

    public function bookmaker(): BelongsTo
    {
        return $this->belongsTo(Bookmaker::class);
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }
}
