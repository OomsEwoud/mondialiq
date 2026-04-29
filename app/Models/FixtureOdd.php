<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixtureOdd extends Model
{
    protected $fillable = [
        'fixture_id',
        'bookmaker_id',
        'bet_type_id',
        'value',
        'odd'
    ];

    protected $casts = [
        'odd' => 'float'
    ];

    public function betType()
    {
        return $this->belongsTo(BetType::class);
    }

    public function Bookmaker()
    {
        return $this->belongsTo(Bookmaker::class);
    }

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }
}
