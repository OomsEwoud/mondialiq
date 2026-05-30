<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureOdd extends Model
{
    protected $fillable = [
        'fixture_id',
        'external_bookmaker_id',
        'bookmaker_name',
        'external_bet_id',
        'bet_name',
        'bookmaker_id',
        'bet_type_id',
        'value',
        'odd',
        'api_updated_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'odd' => 'float',
            'api_updated_at' => 'datetime',
        ];
    }

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
