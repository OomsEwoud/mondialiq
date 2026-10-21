<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['provider_league_id', 'season', 'provider', 'endpoint', 'schema_version', 'payload', 'payload_sha256', 'next_index', 'fetched_at', 'completed_at'])]
class MlImportBatch extends Model
{
    protected function casts(): array
    {
        return ['payload' => 'array', 'next_index' => 'integer', 'fetched_at' => 'immutable_datetime', 'completed_at' => 'immutable_datetime'];
    }
}
