<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referee extends Model
{
    protected $fillable = [
        'external_id',
        'name',
    ];

    public function fixtures()
    {
        return $this->hasMany(Fixture::class);
    }
}
